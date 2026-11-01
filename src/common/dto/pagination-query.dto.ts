import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export class PaginatedListDto<TSortKey extends string = never> {
    @ApiPropertyOptional({ type: Number, minimum: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number;

    @ApiPropertyOptional({ type: Number, minimum: 1, maximum: 1000 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Max(1000)
    @Min(1)
    perPage?: number;

    declare search?: string;
    declare sortBy?: TSortKey;
    declare sortOrder?: "ASC" | "DESC";
}
