import { ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsInt, IsOptional, Max, Min } from "class-validator";

export interface PaginationOptions {
    defaultPerPage?: number;
    maxPerPage?: number;
}

export function PaginationDto(options: PaginationOptions = {}) {
    const { defaultPerPage = 15, maxPerPage = 1000 } = options;

    class Pagination {
        @ApiPropertyOptional({ type: Number, minimum: 1, default: 1 })
        @IsOptional()
        @Type(() => Number)
        @IsInt()
        @Min(1)
        page: number = 1;

        @ApiPropertyOptional({
            type: Number,
            minimum: 1,
            maximum: maxPerPage,
            default: defaultPerPage
        })
        @IsOptional()
        @Type(() => Number)
        @IsInt()
        @Min(1)
        @Max(maxPerPage)
        perPage: number = defaultPerPage;
    }

    return Pagination;
}

export type PaginationQuery = InstanceType<ReturnType<typeof PaginationDto>>;
