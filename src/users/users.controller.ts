import {
    Body,
    Controller,
    Delete,
    Get,
    NotFoundException,
    Param,
    ParseIntPipe,
    Patch,
    Post,
    Put,
    Query,
    UseGuards
} from "@nestjs/common";
import { type AuthUser, CurrentUser } from "../auth/current-user.decorator.js";
import { JwtAuthGuard } from "../auth/jwt/jwt-auth.guard.js";
import { PermissionsGuard } from "../permissions/permissions.guard.js";
import { RequirePermission } from "../permissions/require-permissions.decorator.js";
import { CreateUserDto } from "./dto/create-user.dto.js";
import { RoleGuard } from "./role/role.guard.js";
import { UsersService } from "./users.service.js";
import { UserResource } from "./user.resource.js";
import { ApiBearerAuth, ApiOperation } from "@nestjs/swagger";
import { UpdateUserDto } from "./dto/update-user-dto.js";
import { UpdatePasswordDto } from "./dto/update-password.dto.js";
import { AuthService } from "../auth/auth.service.js";
import { ListUserDto } from "./dto/index-user.dto.js";

@ApiBearerAuth()
@Controller("users")
@UseGuards(JwtAuthGuard, PermissionsGuard, RoleGuard)
export class UsersController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService
    ) {}

    // users.view
    @Get()
    @RequirePermission("users.view")
    async index(@Query() query: ListUserDto, @CurrentUser() authUser: AuthUser) {
        const users = await this.usersService.getList(query, authUser);
        return UserResource.collection(users);
    }

    @Get("trashed")
    @RequirePermission("users.view")
    async trashed(@Query() query: ListUserDto, @CurrentUser() authUser: AuthUser) {
        const users = await this.usersService.getList(query, authUser, { onlyTrashed: true });
        return UserResource.collection(users);
    }

    @Get(":id")
    @RequirePermission("users.view")
    async show(@Param("id", ParseIntPipe) id: number) {
        const user = await this.usersService.findById(id, { withRelations: true });
        if (!user) throw new NotFoundException("User not found");
        return UserResource.create(user);
    }

    // users.manage
    @Post()
    @RequirePermission("users.manage")
    @ApiOperation({ summary: "Create user" })
    async store(@Body() dto: CreateUserDto, @CurrentUser() authUser: AuthUser) {
        const user = await this.usersService.create(dto, authUser);
        if (!user) throw new NotFoundException("Failed to create user");
        return UserResource.create(user);
    }

    @Put(":id")
    @RequirePermission("users.manage")
    async update(
        @Param("id", ParseIntPipe) id: number,
        @Body() dto: UpdateUserDto,
        @CurrentUser() authUser: AuthUser
    ) {
        const user = await this.usersService.update(id, dto, authUser);
        if (!user) throw new NotFoundException("Failed to update user.");
        return UserResource.create(user);
    }

    @Patch(":id/update-password")
    @RequirePermission("users.manage")
    async updatePassword(
        @Param("id", ParseIntPipe) id: number,
        @Body() dto: UpdatePasswordDto,
        @CurrentUser() authUser: AuthUser
    ) {
        await this.usersService.updatePassword(id, dto.password);

        if (dto.logoutAllDevices) {
            await this.authService.logoutAll(id, id === authUser.id ? authUser.sid : undefined);
        }

        return {
            message: dto.logoutAllDevices
                ? "Password updated successfully. You have been logged out of all devices."
                : "Password updated successfully."
        };
    }

    @Delete(":id")
    @RequirePermission("users.manage")
    async destroy(@Param("id", ParseIntPipe) id: number, @CurrentUser() authUser: AuthUser) {
        await this.usersService.safeDelete(id, authUser);
        return { message: "User deleted successfully" };
    }

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
