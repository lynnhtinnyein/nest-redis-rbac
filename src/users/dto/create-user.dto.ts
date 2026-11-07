import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import {
    ArrayMinSize,
    ArrayUnique,
    IsArray,
    IsEmail,
    IsEnum,
    IsInt,
    IsNotEmpty,
    IsOptional,
    IsString,
    MaxLength,
    MinLength
} from "class-validator";
import { Match } from "../../common/match.decorator.js";
import { Role } from "../role/role.enum.js";
import { ExistsIn } from "../../common/exists-in.decorator.js";
import { Permission } from "../../permissions/permission.entity.js";

export class CreateUserDto {
    @ApiProperty({ example: "John Doe", maxLength: 255 })
    @IsNotEmpty({ message: "name is required" })
    @IsString({ message: "invalid name" })
    @MaxLength(255, { message: "name cannot exceed 255 characters" })
    name: string;

    @ApiProperty({ example: "john@example.com" })
    @IsNotEmpty({ message: "email is required" })
    @IsEmail({}, { message: "invalid email" })
    email: string;

    @ApiProperty({ example: "password123", minLength: 8 })
    @IsNotEmpty({ message: "password is required" })
    @IsString({ message: "invalid password" })
    @MinLength(8, { message: "password must be at least 8 characters" })
    password: string;

    @ApiProperty({ example: "password123", description: "Must match password" })
    @IsNotEmpty({ message: "confirmPassword is required" })
    @Match("password", { message: "password and confirmation do not match" })
    confirmPassword: string;

    @ApiPropertyOptional({ enum: Role, enumName: "Role" })
    @IsOptional()
    @IsEnum(Role, { message: "invalid role" })
    role: Role;

    @ApiProperty({ type: [Number], example: [1, 2, 3], uniqueItems: true })
    @IsArray({ message: "permissionIds must be an array" })
    @ArrayMinSize(1, { message: "at least one permission is required" })
    @ArrayUnique({ message: "permissionIds must be unique" })
    @IsInt({ each: true, message: "each permission id must be an integer" })
    @ExistsIn(Permission)
    permissionIds: number[];
}
