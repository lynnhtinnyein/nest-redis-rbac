import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Brackets, EntityManager, FindOneOptions, In, IsNull, Repository } from "typeorm";
import { buildFindOneOptions } from "../common/relation-options.js";
import { Permission } from "../permissions/permission.entity.js";
import { User } from "./user.entity.js";
import { Role } from "./role/role.enum.js";
import { CreateUserDto } from "./dto/create-user.dto.js";
import { UpdateUserDto } from "./dto/update-user-dto.js";
import { ListUserDto } from "./dto/index-user.dto.js";
import { AuthUser } from "../auth/current-user.decorator.js";
import { emptyPage, paginate } from "../common/orm/paginate.js";
import { deleteOrArchive } from "../common/utils/delete-or-archive.js";
import bcrypt from "bcrypt";

type FindOptions = { withRelations?: boolean; withDeleted?: boolean };

@Injectable()
export class UsersService {
    private readonly relations: FindOneOptions<User>;

    constructor(
        @InjectRepository(User) private readonly repo: Repository<User>,
        @InjectRepository(Permission)
        private readonly permissionRepo: Repository<Permission>
    ) {
        this.relations = buildFindOneOptions(this.repo, {
            permissions: { select: "*" },
            toggledBy: { withDeleted: true, select: ["id", "name"] },
            createdBy: { withDeleted: true, select: ["id", "name"] }
        });
    }

    findByEmail(
        email: string,
        { withRelations = false, withDeleted = false }: FindOptions = {},
        repo: EntityManager = this.repo.manager
    ) {
        return repo.findOne(User, {
            ...(withRelations && this.relations),
            ...(withDeleted && { withDeleted }),
            where: { email, ...(withDeleted ? {} : { deletedAt: IsNull() }) }
        });
    }

    findById(
        id: number,
        { withRelations = false, withDeleted = false }: FindOptions = {},
        repo: EntityManager = this.repo.manager
    ) {
        return repo.findOne(User, {
            ...(withRelations && this.relations),
            ...(withDeleted && { withDeleted }),
            where: { id, ...(withDeleted ? {} : { deletedAt: IsNull() }) }
        });
    }

    async getList(
        dto: ListUserDto,
        authUser: AuthUser,
        { onlyTrashed = false }: { onlyTrashed?: boolean } = {}
    ) {
        const pagination = { page: dto.page, perPage: dto.perPage };
        const sortBy = dto.sortBy === "status" ? "isSuspended" : dto.sortBy;

        const accessibleRoles = authUser.getAccessibleRoles();
        const requestedRole = dto.role as Role;
        const hasRoleFilter = !!dto.role && dto.role !== "ALL";

        if (hasRoleFilter && !accessibleRoles.includes(requestedRole)) {
            return emptyPage<User>(pagination);
        }

        const qb = this.repo
            .createQueryBuilder("user")
            .where("user.id != :authId", { authId: authUser.id })
            .andWhere("user.role IN (:...roles)", {
                roles: hasRoleFilter ? [requestedRole] : accessibleRoles
            });

        if (onlyTrashed) {
            qb.withDeleted().andWhere("user.deletedAt IS NOT NULL");
        }

        if (dto.status !== "ALL") {
            qb.andWhere("user.isSuspended = :suspended", {
                suspended: dto.status === "SUSPENDED"
            });
        }

        if (dto.search) {
            qb.andWhere(
                new Brackets((b) => {
                    b.where("user.name LIKE :search").orWhere("user.email LIKE :search");
                }),
                { search: `%${dto.search}%` }
            );
        }

        if (sortBy === "permissions") {
            qb.addSelect(
                (sq) =>
                    sq
                        .select("COUNT(*)")
                        .from("user_permissions", "up")
                        .where("up.userId = user.id"),
                "permissionsCount"
            ).orderBy("permissionsCount", dto.sortOrder);
        } else {
            qb.orderBy(`user.${sortBy}`, dto.sortOrder);
        }

        qb.addOrderBy("user.id", "ASC");

        return paginate({
            repo: this.repo,
            qb,
            relations: this.relations,
            pagination
        });
    }

    async create(dto: CreateUserDto, authUser: AuthUser) {
        const role = dto.role ?? Role.USER;
        if (!authUser.canCreate(role)) {
            throw new ForbiddenException("Access denied");
        }

        if (await this.findByEmail(dto.email)) {
            throw new ConflictException("email is already registered");
        }

        const permissions = await this.resolvePermissions(dto.permissionIds ?? [], role);
        const password = await bcrypt.hash(dto.password, 10);

        try {
            return await this.repo.manager.transaction(async (repo) => {
                const user = await repo.save(
                    repo.create(User, {
                        name: dto.name,
                        email: dto.email,
                        password,
                        role,
                        createdById: authUser.id,
                        permissions
                    })
                );

                return this.findById(user.id, { withRelations: true }, repo);
            });
        } catch (error) {
            if ((error as { code?: string }).code === "ER_DUP_ENTRY") {
                throw new ConflictException("email is already registered");
            }
            throw error;
        }
    }

    async update(id: number, dto: UpdateUserDto, authUser: AuthUser) {
        const user = await this.findById(id);

        if (!user) throw new NotFoundException("User not found");

        if (!authUser.canManage(user.role)) {
            throw new ForbiddenException("Access denied");
        }

        const role = dto.role ?? user.role;
        if (role !== user.role && !authUser.canCreate(role)) {
            throw new ForbiddenException("Access denied");
        }

        if (dto.name !== undefined) user.name = dto.name;
        user.role = role;

        if (dto.permissionIds) {
            user.permissions = await this.resolvePermissions(dto.permissionIds, role);
        }

        return this.repo.manager.transaction(async (repo) => {
            await repo.save(user);
            return this.findById(id, { withRelations: true }, repo);
        });
    }

    async updatePassword(id: number, newPassword: string) {
        const user = await this.findById(id);
        if (!user) throw new NotFoundException("User not found");
        user.password = await bcrypt.hash(newPassword, 10);
        await this.repo.save(user);
    }

    async safeDelete(id: number, authUser: AuthUser) {
        const user = await this.findById(id, { withDeleted: true });
        if (!user) throw new NotFoundException("User not found");

        const isOwnAccount = authUser.id === id;
        if (!isOwnAccount && !authUser.canManage(user.role)) {
            throw new ForbiddenException("Access denied");
        }

        if (user.deletedAt) return;

        const deleteResult = await deleteOrArchive(this.repo, id);

        if (deleteResult === "archived") {
            await this.repo.update(id, {
                email: `deleted_${id}_${user.email}`
            });
        }
    }

    async toggleAccountSuspension(
        id: number,
        authUser: AuthUser,
        { suspending = false }: { suspending: boolean }
    ) {
        const user = await this.findById(id);
        if (!user) throw new NotFoundException("User not found");

        if (!authUser.canManage(user.role)) {
            throw new ForbiddenException("Access denied");
        }

        if (user.isSuspended === suspending) return;

        await this.repo.update(id, {
            isSuspended: suspending,
            toggledById: authUser.id,
            toggledAt: new Date()
        });
    }

    private async resolvePermissions(ids: number[], role: Role) {
        if (!ids.length) {
            return [];
        }

        const permissions = await this.permissionRepo.find({
            where: { id: In(ids) },
            relations: { dependencies: true }
        });
        if (permissions.length !== ids.length) {
            throw new BadRequestException("one or more selected permissions do not exist");
        }

        const selected = new Set(permissions.map((permission) => permission.id));
        for (const permission of permissions) {
            if (permission.assignableRoles && !permission.assignableRoles.includes(role)) {
                throw new BadRequestException(
                    `permission ${permission.value} is not available for role ${role}`
                );
            }
            for (const dependency of permission.dependencies) {
                if (!selected.has(dependency.id)) {
                    throw new BadRequestException(
                        `permission ${permission.value} requires ${dependency.value}`
                    );
                }
            }
        }

        return permissions;
    }
}
