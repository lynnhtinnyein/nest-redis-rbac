import {
    type CanActivate,
    type ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "../users/role.enum.js";
import { UsersService } from "../users/users.service.js";
import { PERMISSIONS_KEY, type PermissionMetadata } from "./require-permissions.decorator.js";

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly usersService: UsersService
    ) {}

    async canActivate(context: ExecutionContext) {
        const required = this.reflector.getAllAndOverride<PermissionMetadata>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass()
        ]);

        if (!required?.permissions.length) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();
        const found = await this.usersService.findById(user.id, { withRelations: true });
        if (!found) {
            throw new UnauthorizedException();
        }

        if (found.isSuspended) {
            throw new ForbiddenException("account is suspended");
        }

        if (found.role === Role.SUPER_ADMIN) {
            return true;
        }

        const owned = new Set(found.permissions.map((permission) => permission.value));
        const has = (value: string) => owned.has(value);

        const allowed =
            required.mode === "every"
                ? required.permissions.every(has)
                : required.permissions.some(has);

        if (allowed) {
            return true;
        }

        throw new ForbiddenException("you do not have permission to perform this action");
    }
}
