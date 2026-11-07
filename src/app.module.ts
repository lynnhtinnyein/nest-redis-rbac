import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller.js";
import { AppService } from "./app.service.js";
import { UsersModule } from "./users/users.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { PermissionsModule } from "./permissions/permissions.module.js";
import { RedisModule } from "./redis/redis.module.js";
import { ExistsInConstraint } from "./common/exists-in.decorator.js";

@Module({
    imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        TypeOrmModule.forRootAsync({
            inject: [ConfigService],
            useFactory: (config: ConfigService) => ({
                type: "mysql",
                host: config.get("DB_HOST"),
                port: Number(config.get("DB_PORT")),
                username: config.get("DB_USER"),
                password: config.get("DB_PASS"),
                database: config.get("DB_NAME"),
                autoLoadEntities: true,
                synchronize: true
                // dropSchema: true // migrate:fresh
            })
        }),
        RedisModule,
        UsersModule,
        AuthModule,
        PermissionsModule
    ],
    controllers: [AppController],
    providers: [AppService, ExistsInConstraint]
})
export class AppModule {}
