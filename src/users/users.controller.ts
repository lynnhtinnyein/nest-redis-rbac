import { Body, Controller, Get, Param, ParseIntPipe, Post, Put, UseGuards } from "@nestjs/common";
import { type AuthUser, CurrentUser } from "../auth/current-user.decorator.js";
import { JwtAuthGuard } from "../auth/jwt-auth.guard.js";
import { PermissionsGuard } from "../permissions/permissions.guard.js";
import { RequirePermission } from "../permissions/require-permissions.decorator.js";
import { CreateUserDto } from "./dto/create-user.dto.js";
import { RoleGuard } from "./role/role.guard.js";
import { UsersService } from "./users.service.js";
import { UserResource } from "./user.resource.js";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { UpdateUserDto } from "./dto/update-user-dto.js";

@ApiBearerAuth()
@Controller("users")
@UseGuards(JwtAuthGuard, PermissionsGuard, RoleGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    // users.view
    // @Get()
    // @RequirePermission("users.view")
    // list(@Query() query: ListUsersQueryDto, @CurrentUser() authUser: AuthUser) {
    //     return this.usersService.list(query, user.id);
    // }

    // @Get("trashed")
    // @RequirePermission("users.view")
    // trashed(@Query() query: ListUsersQueryDto, @CurrentUser() authUser: AuthUser) {
    //     return this.usersService.trashed(query, user.id);
    // }

    @Get(":id")
    @RequirePermission("users.view")
    async show(@Param("id", ParseIntPipe) id: number) {
        const user = await this.usersService.findById(id, { withRelations: true });
        return UserResource.make(user);
    }

    // users.manage
    @Post()
    @RequirePermission("users.manage")
    @ApiOperation({ summary: "Create user" })
    async store(@Body() dto: CreateUserDto, @CurrentUser() authUser: AuthUser) {
        const user = await this.usersService.create(dto, authUser.id);
        return UserResource.make(user);
    }

    @Put(":id")
    @RequirePermission("users.manage")
    async update(
        @Param("id", ParseIntPipe) id: number,
        @Body() dto: UpdateUserDto,
        @CurrentUser() authUser: AuthUser
    ) {
        const user = await this.usersService.update(id, dto, authUser.id);
        return UserResource.make(user);
    }

    // @Patch(":id/update-password")
    // @RequirePermission("users.manage")
    // updatePassword(@Param("id") id: string, @Body() dto: UpdatePasswordDto, @CurrentUser() authUser: AuthUser) {
    //     return this.usersService.updatePassword(id, dto, user.id);
    // }

    // @Delete(":id")
    // @RequirePermission("users.manage")
    // destroy(@Param("id") id: string, @CurrentUser() authUser: AuthUser) {
    //     return this.usersService.remove(id, user.id);
    // }

    // @Patch(":id/restore-from-trash")
    // @RequirePermission("users.manage")
    // restoreFromTrash(@Param("id") id: string, @CurrentUser() authUser: AuthUser) {
    //     return this.usersService.restoreFromTrash(id, user.id);
    // }

    // @Patch(":id/suspend")
    // @RequirePermission("users.manage")
    // suspend(@Param("id") id: string, @CurrentUser() authUser: AuthUser) {
    //     return this.usersService.suspend(id, user.id);
    // }

    // @Patch(":id/restore")
    // @RequirePermission("users.manage")
    // restore(@Param("id") id: string, @CurrentUser() authUser: AuthUser) {
    //     return this.usersService.restore(id, user.id);
    // }
}
