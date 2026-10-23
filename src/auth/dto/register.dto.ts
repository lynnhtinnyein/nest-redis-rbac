import { IsEmail, IsNotEmpty, IsString, MinLength } from "class-validator";

export class RegisterDto {
    
    name: string;

    @IsNotEmpty({ message: "Email is required" })
    @IsEmail({}, { message: "Invalid email format" })
    email: string;

    @IsNotEmpty({ message: "Password is required" })
    @IsString({ message: "Password must be a string" })
    @MinLength(8, { message: "Password must be at least 8 character" })
    password: string;
}
