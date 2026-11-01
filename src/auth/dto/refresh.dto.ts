import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString } from "class-validator";

export class RefreshDto {
    @ApiProperty({ example: "" })
    @IsNotEmpty({ message: "refresh token is required" })
    @IsString()
    refreshToken: string;
}
