import { Module } from "@nestjs/common";
import { APP_GUARD } from "@nestjs/core";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "../users/users.module.js";
import { UsersController } from "../users/users.controller.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { JwtStrategy } from "./jwt/jwt.strategy.js";

import { Session } from "./session.entity.js";
import { TokenBlacklistService } from "./token-blacklist.service.js";
import { JwtAuthGuard } from "./jwt/jwt-auth.guard.js";

@Module({
    imports: [UsersModule, TypeOrmModule.forFeature([Session])],
    controllers: [AuthController, UsersController],
    providers: [
        AuthService,
        JwtStrategy,
        TokenBlacklistService,
        { provide: APP_GUARD, useClass: JwtAuthGuard }
    ]
})
export class AuthModule {}
