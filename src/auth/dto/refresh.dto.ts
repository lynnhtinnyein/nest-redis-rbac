import { IsNotEmpty, IsString } from "class-validator";

export class RefreshDto {
    @IsNotEmpty({ message: "refresh token is required" })
    @IsString()
    refreshToken: string;
}
