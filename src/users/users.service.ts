import {
    BadRequestException,
    ConflictException,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { FindOneOptions, In, Repository } from "typeorm";
import { buildFindOneOptions } from "../common/relation-options.js";
import { Permission } from "../permissions/permission.entity.js";
import { User } from "./user.entity.js";
import { Role } from "./role/role.enum.js";
import { CreateUserDto } from "./dto/create-user.dto.js";
import bcrypt from "bcrypt";
import { UpdateUserDto } from "./dto/update-user-dto.js";

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

    findByEmail(email: string, { withRelations = false }: FindOptions = {}) {
        return this.repo.findOne({
            where: { email },
            ...(withRelations ? this.relations : {})
        });
    }

    async findById(id: number, { withRelations = false }: FindOptions = {}) {
        const user = await this.repo.findOne({
            where: { id },
            ...(withRelations ? this.relations : {})
        });
        if (!user) throw new NotFoundException(`User ${id} not found`);
        return user;
    }

    async create(dto: CreateUserDto, creatorId: number) {
        const creator = await this.findById(creatorId);
        if (!creator) {
            throw new UnauthorizedException();
        }

        const role = dto.role ?? Role.USER;
        if (!creator.canCreate(role)) {
            throw new ForbiddenException("you do not have permission to perform this action");
        }

        if (await this.findByEmail(dto.email)) {
            throw new ConflictException("email is already registered");
        }

        const permissions = await this.resolvePermissions(dto.permissionIds ?? [], role);

        return this.repo.save(
            this.repo.create({
                name: dto.name,
                email: dto.email,
                password: await bcrypt.hash(dto.password, 10),
                role,
                createdById: creator.id,
                permissions
            })
        );
    }

    async update(id: number, dto: UpdateUserDto, actorId: number) {
        const actor = await this.findById(actorId);
        const user = await this.findById(id);

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
        return this.findById(id, { withRelations: true });
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
