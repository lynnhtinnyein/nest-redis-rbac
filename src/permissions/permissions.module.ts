import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Permission } from "./permission.entity.js";

@Module({
    imports: [TypeOrmModule.forFeature([Permission])],
})
export class PermissionsModule {}
