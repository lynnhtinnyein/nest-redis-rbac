import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { User } from "./user.entity.js";
import { UsersService } from "./users.service.js";
import { Permission } from "../permissions/permission.entity.js";

@Module({
    imports: [TypeOrmModule.forFeature([User, Permission])],
    providers: [UsersService],
    exports: [UsersService]
})
export class UsersModule {}
