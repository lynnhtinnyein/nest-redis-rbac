import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UsersModule } from "../users/users.module.js";
import { UsersController } from "../users/users.controller.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { JwtStrategy } from "./jwt/jwt.strategy.js";
import { Session } from "./session.entity.js";
import { TokenBlacklistService } from "./token-blacklist.service.js";
import { JwtAuthModule } from "./jwt/jwt-auth.module.js";

@Module({
    imports: [JwtAuthModule, UsersModule, TypeOrmModule.forFeature([Session])],
    controllers: [AuthController, UsersController],
    providers: [AuthService, JwtStrategy, TokenBlacklistService]
})
export class AuthModule {}
