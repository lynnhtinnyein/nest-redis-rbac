import {
    Body,
    Controller,
    Get,
    HttpCode,
    NotFoundException,
    Post,
    UseGuards
} from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { type AuthUser, CurrentUser } from "./current-user.decorator.js";
import { LoginDto } from "./dto/login.dto.js";
import { RefreshDto } from "./dto/refresh.dto.js";
import { JwtAuthGuard } from "./jwt/jwt-auth.guard.js";
import { UserResource } from "../users/user.resource.js";
import { UsersService } from "../users/users.service.js";
import { ApiBearerAuth } from "@nestjs/swagger";

@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        private readonly usersService: UsersService
    ) {}

    @Post("login")
    @HttpCode(200)
    async login(@Body() dto: LoginDto) {
        const data = await this.authService.login(dto);
        return {
            ...data,
            user: UserResource.create(data.user)
        };
    }

    @Post("refresh")
    @HttpCode(200)
    refresh(@Body() dto: RefreshDto) {
        return this.authService.refresh(dto.refreshToken);
    }

    @Post("logout")
    @HttpCode(204)
    logout(@Body() dto: RefreshDto) {
        return this.authService.logout(dto.refreshToken);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Post("logout-all")
    @HttpCode(204)
    logoutAll(@CurrentUser() authUser: AuthUser) {
        return this.authService.logoutAll(authUser.id);
    }

    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get("me")
    async me(@CurrentUser() authUser: AuthUser) {
        const user = await this.usersService.findById(authUser.id, { withRelations: true });
        if (!user) throw new NotFoundException("User not found");
        return UserResource.create(user);
    }
}
