import { Body, Controller, Post, UseGuards } from "@nestjs/common";
import { type AuthUser, CurrentUser } from "../auth/current-user.decorator.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { PermissionsGuard } from "../permissions/permissions.guard.js";
import { CreateUserDto } from "./dto/create-user.dto.js";
import { UsersService } from "./users.service.js";
import { RequirePermission } from "../permissions/require-permissions.decorator.js";

@Controller("user")
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // @Get()
    // @RequirePermissions("users.view")
    // list(@Query() query: ListUsersQueryDto, @CurrentUser() user: AuthUser) {
    //     return this.usersService.list(query, user.id);
    // }

    @Post()
    @RequirePermission("users.manage")
    create(@Body() dto: CreateUserDto, @CurrentUser() user: AuthUser) {
        return this.usersService.createUser(dto, user.id);
    }
}
