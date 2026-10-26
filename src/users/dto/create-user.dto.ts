import {
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
import { Role } from "../role.enum.js";

export class CreateUserDto {
    @IsNotEmpty({ message: "name is required" })
    @IsString({ message: "invalid name" })
    @MaxLength(255, { message: "name cannot exceed 255 characters" })
    name: string;

    @IsNotEmpty({ message: "email is required" })
    @IsEmail({}, { message: "invalid email" })
    email: string;

    @IsNotEmpty({ message: "password is required" })
    @IsString({ message: "invalid password" })
    @MinLength(8, { message: "password must be at least 8 characters" })
    password: string;

    @IsNotEmpty({ message: "confirmPassword is required" })
    @Match("password", { message: "password and confirmation do not match" })
    confirmPassword: string;

    @IsOptional()
    @IsEnum(Role, { message: "invalid role" })
    role?: Role;

    @IsOptional()
    @IsArray({ message: "permissionIds must be an array" })
    @ArrayUnique({ message: "permissionIds must be unique" })
    @IsInt({ each: true, message: "each permission id must be an integer" })
    permissionIds?: number[];
}
