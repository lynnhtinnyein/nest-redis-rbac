import {
    type CanActivate,
    type ExecutionContext,
    ForbiddenException,
    Injectable,
    NotFoundException,
    UnauthorizedException
} from "@nestjs/common";
import { UsersService } from "../users.service.js";
import { AuthUser } from "../../auth/current-user.decorator.js";

@Injectable()
export class RoleGuard implements CanActivate {
    constructor(private readonly usersService: UsersService) {}

    async canActivate(context: ExecutionContext) {
        const request = context.switchToHttp().getRequest();
        const authUser: AuthUser = request.user;

        if (!authUser) throw new UnauthorizedException("Unauthenticated.");

        const target = await this.usersService.findById(Number(request.params.id), {
            withDeleted: true
        });

        if (!target) throw new NotFoundException("User not found");
        if (!authUser.canAccess(target)) throw new ForbiddenException("Access denied");

        request.targetUser = target;
        return true;
    }
}
