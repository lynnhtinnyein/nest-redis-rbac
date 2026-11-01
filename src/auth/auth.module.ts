import { Module } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UsersModule } from "../users/users.module.js";
import { AuthController } from "./auth.controller.js";
import { AuthService } from "./auth.service.js";
import { JwtStrategy } from "./jwt/jwt.strategy.js";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Session } from "./session.entity.js";
import { UsersController } from "../users/users.controller.js";

@Module({
    imports: [
        UsersModule,
        PassportModule,
        TypeOrmModule.forFeature([Session]),
        JwtModule.registerAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                secret: config.get<string>("JWT_SECRET"),
                signOptions: { expiresIn: Number(config.get("JWT_EXPIRES_IN")) }
            })
        })
    ],
    controllers: [AuthController, UsersController], //TODO:
    providers: [AuthService, JwtStrategy]
})
export class AuthModule {}
