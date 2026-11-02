import { ApiPropertyOptional } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsIn, IsOptional, IsString } from "class-validator";
import { PaginationDto, type PaginationOptions } from "./pagination.dto.js";

export type SortOrder = "ASC" | "DESC";

interface SortablePaginationOptions<T extends readonly string[]> extends PaginationOptions {
    defaultSortBy: T[number];
    defaultSortOrder?: SortOrder;
}

export function SortablePaginationDto<const T extends readonly string[]>(
    keys: T,
    options: SortablePaginationOptions<T>
) {
    const { defaultSortBy, defaultSortOrder = "DESC" } = options;

    class SortablePagination extends PaginationDto(options) {
        @ApiPropertyOptional({ enum: [...keys], default: defaultSortBy })
        @IsOptional()
        @IsString()
        @IsIn([...keys], { message: `sortBy must be one of: ${keys.join(", ")}` })
        sortBy: T[number] = defaultSortBy;

        @ApiPropertyOptional({ enum: ["ASC", "DESC"], default: defaultSortOrder })
        @IsOptional()
        @Transform(({ value }) => (typeof value === "string" ? value.toUpperCase() : value))
        @IsString()
        @IsIn(["ASC", "DESC"], { message: "sortOrder must be either ASC or DESC" })
        sortOrder: SortOrder = defaultSortOrder;
    }

    return SortablePagination;
}
