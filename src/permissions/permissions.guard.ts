import {
    type CanActivate,
    type ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { Role } from "../users/role/role.enum.js";
import { PERMISSIONS_KEY, type PermissionMetadata } from "./require-permissions.decorator.js";

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext) {
        const required = this.reflector.getAllAndOverride<PermissionMetadata>(PERMISSIONS_KEY, [
            context.getHandler(),
            context.getClass()
        ]);

        if (!required?.permissions.length) {
            return true;
        }

        const { user } = context.switchToHttp().getRequest();

        if (!user) {
            throw new UnauthorizedException();
        }

        if (user.role === Role.SUPER_ADMIN) {
            return true;
        }

        const owned = new Set<string>(user.permissions ?? []);
        const has = (value: string) => owned.has(value);

        const allowed =
            required.mode === "every"
                ? required.permissions.every(has)
                : required.permissions.some(has);

        if (allowed) {
            return true;
        }

        throw new ForbiddenException("Access denied");
    }
}
