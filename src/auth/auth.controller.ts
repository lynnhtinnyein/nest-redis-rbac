import { Body, Controller, Get, HttpCode, Post, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service.js";
import { type AuthUser, CurrentUser } from "./current-user.decorator.js";
import { LoginDto } from "./dto/login.dto.js";
import { RefreshDto } from "./dto/refresh.dto.js";
import { JwtAuthGuard } from "./jwt-auth.guard.js";
import { UserResource } from "../users/user.resource.js";

@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("login")
    @HttpCode(200)
    async login(@Body() dto: LoginDto) {
        const data = await this.authService.login(dto);
        return {
            ...data,
            user: UserResource.make(data.user)
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

    @UseGuards(JwtAuthGuard)
    @Post("logout-all")
    @HttpCode(204)
    logoutAll(@CurrentUser() user: AuthUser) {
        return this.authService.logoutAll(user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get("me")
    profile(@CurrentUser() user: AuthUser) {
        return user;
    }
}
