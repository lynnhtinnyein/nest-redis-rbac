import {
    type CanActivate,
    type ExecutionContext,
    ForbiddenException,
    Injectable,
    UnauthorizedException
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { ACCESS_TARGET_KEY } from "./access-target.decorator.js";
import { UsersService } from "../users.service.js";
import { AuthUser } from "../../auth/current-user.decorator.js";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly usersService: UsersService
    ) {}

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const authUser: AuthUser = request.user;

        if (!authUser) {
            throw new UnauthorizedException("Unauthenticated.");
        }

        const param =
            this.reflector.getAllAndOverride<string>(ACCESS_TARGET_KEY, [
                context.getHandler(),
                context.getClass()
            ]) ?? "id";

        const targetId = request.params?.[param];

        if (targetId === undefined) {
            return true;
        }

        const target = await this.usersService.findById(targetId);

        if (!authUser.canAccess(target)) {
            throw new ForbiddenException("You cannot access this account.");
        }

        request.targetUser = target;

        return true;
    }
}
