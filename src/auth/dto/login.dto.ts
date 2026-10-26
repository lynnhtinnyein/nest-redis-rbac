import { IsEmail, IsNotEmpty, IsString } from "class-validator";

export class LoginDto {
    @IsNotEmpty({ message: "email is required" })
    @IsEmail({}, { message: "invalid email format" })
    email: string;

    @IsNotEmpty({ message: "password is required" })
    @IsString({ message: "password must be a string" })
    password: string;
}
