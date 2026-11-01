import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOneOptions, FindOptionsWhere, In, IsNull, Like, Not, Raw, Repository } from "typeorm";
import { buildFindOneOptions } from "../common/relation-options.js";
import { Permission } from "../permissions/permission.entity.js";
import { User } from "./user.entity.js";
import { Role } from "./role/role.enum.js";
import { CreateUserDto } from "./dto/create-user.dto.js";
import bcrypt from "bcrypt";
import { UpdateUserDto } from "./dto/update-user-dto.js";
import { ListUserDto } from "./dto/index-user.dto.js";
import { SelectQueryBuilder } from "typeorm/browser";
import { AuthUser } from "../auth/current-user.decorator.js";
import { paginate } from "nestjs-typeorm-paginate";

type FindOptions = { withRelations?: boolean };

@Injectable()
export class UsersService {
    private readonly relations: FindOneOptions<User>;

    constructor(
        @InjectRepository(User) private readonly repo: Repository<User>,
        @InjectRepository(Permission)
        private readonly permissionRepo: Repository<Permission>
    ) {
        this.relations = buildFindOneOptions(this.repo, [
            "permissions",
            "toggledBy:id,name",
            "createdBy:id,name"
        ]);
    }

    async getByEmail(email: string, { withRelations = false }: FindOptions = {}) {
        const user = await this.repo.findOne({
            where: { email },
            ...(withRelations ? this.relations : {})
        });
        if (!user) throw new NotFoundException(`User ${email} not found`);
        return user;
    }

    async getById(id: number, { withRelations = false }: FindOptions = {}) {
        const user = await this.repo.findOne({
            where: { id },
            ...(withRelations ? this.relations : {})
        });
        if (!user) throw new NotFoundException(`User ${id} not found`);
        return user;
    }

    parsePayload(
        dto: ListUserDto,
        config: {
            defaultPerPage?: number;
            defaultSortBy?: string;
            defaultSortOrder?: "ASC" | "DESC";
        } = {}
    ) {
        const { defaultPerPage = 10, defaultSortBy = "id", defaultSortOrder = "DESC" } = config;

        const sortKeyMap: Record<string, string> = {
            status: "isSuspended",
            permissions: "permissionsCount"
        };

        const sortBy = dto.sortBy ?? defaultSortBy;

        return {
            filters: {
                search: dto.search ?? null,
                status: dto.status ?? "ALL",
                role: dto.role ?? "ALL"
            },
            sorting: { [sortKeyMap[sortBy] ?? sortBy]: dto.sortOrder ?? defaultSortOrder },
            pagination: {
                page: dto.page ?? 1,
                limit: dto.perPage ?? defaultPerPage
            }
        };
    }

    async getList(dto: ListUserDto, authUser: AuthUser) {
        const { filters, sorting, pagination } = this.parsePayload(dto, {
            defaultPerPage: 15,
            defaultSortBy: "createdAt"
        });

        const accessibleRoles = authUser.getAccessibleRoles();
        const requestedRole = filters.role as Role;
        const hasRoleFilter = !!filters.role && filters.role !== "ALL";

        const query: FindOptionsWhere<User> = { id: Not(authUser.id) };

        if (hasRoleFilter && !accessibleRoles.includes(requestedRole)) {
            query.id = Raw(() => "1 = 0");
        } else {
            query.role = In(hasRoleFilter ? [requestedRole] : accessibleRoles);
        }

        // if (filters.onlyTrashed) {
        //     query.deletedAt = Not(IsNull());
        // }

        if (filters.status !== "ALL") {
            query.isSuspended = filters.status === "SUSPENDED";
        }

        const where: FindOptionsWhere<User>[] = filters.search
            ? [
                  { ...query, name: Like(`%${filters.search}%`) },
                  { ...query, email: Like(`%${filters.search}%`) }
              ]
            : [query];

        return paginate<User>(this.repo, pagination, {
            where,
            // withDeleted: !!filters.onlyTrashed,
            relations: { permissions: true, toggledBy: true, createdBy: true },
            order: sorting
        });
    }

    async create(dto: CreateUserDto, creatorId: number) {
        const creator = await this.getById(creatorId);

        const role = dto.role ?? Role.USER;
        if (!creator.canCreate(role)) {
            throw new ForbiddenException("you do not have permission to perform this action");
        }

        if (await this.getByEmail(dto.email)) {
            throw new ConflictException("email is already registered");
        }

        const permissions = await this.resolvePermissions(dto.permissionIds ?? [], role);

        const user = await this.repo.save(
            this.repo.create({
                name: dto.name,
                email: dto.email,
                password: await bcrypt.hash(dto.password, 10),
                role,
                createdById: creator.id,
                permissions
            })
        );

        return this.getById(user.id, { withRelations: true });
    }

    async update(id: number, dto: UpdateUserDto, actorId: number) {
        const actor = await this.getById(actorId);
        const user = await this.getById(id);

        if (!actor.canManage(user.role)) {
            throw new ForbiddenException("you do not have permission to perform this action");
        }

        const role = dto.role ?? user.role;
        if (role !== user.role && !actor.canCreate(role)) {
            throw new ForbiddenException("you do not have permission to perform this action");
        }

        if (dto.name !== undefined) user.name = dto.name;
        user.role = role;

        if (dto.permissionIds) {
            user.permissions = await this.resolvePermissions(dto.permissionIds, role);
        }

        await this.repo.save(user);
        return this.getById(id, { withRelations: true });
    }

    async updatePassword(id: number, newPassword: string) {
        const user = await this.getById(id);
        user.password = await bcrypt.hash(newPassword, 10);
        await this.repo.save(user);
    }

    // private async buildIndexQueryParams(Request $request, bool $only_trashed)
    // {
    //     return [
    //         'filters': [
    //             'search' => $request->get('search'),
    //             'status' => $request->get('status', 'ALL'),
    //             'role' => $request->get('role', 'ALL'),
    //             'onlyTrashed' => $only_trashed
    //         ],
    //         'sorting' => [
    //             'sortBy' => $request->get('sortBy', 'created_at'),
    //             'sortOrder' => strtoupper($request->get('sortOrder', 'DESC'))
    //         ],
    //         'authUser' => $request->user(),
    //         'perPage' => (int) $request->get('perPage', 15)
    //     ];
    // }

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
            if (permission.accessibleRoles && !permission.accessibleRoles.includes(role)) {
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
