import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    @ApiProperty({ example: "superadmin@gmail.com" })
    @IsNotEmpty({ message: "email is required" })
    @IsEmail({}, { message: "invalid email format" })
    email: string;

    @ApiProperty({ example: "Password@123" })
    @IsNotEmpty({ message: "password is required" })
    @IsString({ message: "password must be a string" })
    password: string;
}