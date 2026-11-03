import { IsBoolean, IsNotEmpty, IsOptional, IsString, MinLength } from "class-validator";
import { Match } from "../../common/match.decorator.js";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class UpdatePasswordDto {
    @ApiProperty({ example: "password123", minLength: 8 })
    @IsNotEmpty({ message: "password is required" })
    @IsString({ message: "invalid password" })
    @MinLength(8, { message: "password must be at least 8 characters" })
    password: string;

    @ApiProperty({ example: "password123", description: "Must match password" })
    @IsNotEmpty({ message: "confirm password is required" })
    @Match("password", { message: "password and confirmation do not match" })
    confirmPassword: string;

    @ApiPropertyOptional({
        example: true,
        default: false,
        description: "Revoke all sessions on other devices"
    })
    @IsOptional()
    @IsBoolean({ message: "invalid logoutAllDevices" })
    logoutAllDevices?: boolean;
}
