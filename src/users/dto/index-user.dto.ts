import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString, MaxLength } from "class-validator";
import { Role } from "../role/role.enum.js";
import { SortablePaginationDto } from "../../common/dto/sortable-pagination.dto.js";

export const USER_SORTABLE = [
    "id",
    "name",
    "permissions",
    "role",
    "status",
    "createdAt",
    "updatedAt",
    "deletedAt"
] as const;

const USER_STATUSES = ["ALL", "ACTIVE", "SUSPENDED"] as const;
const USER_ROLES = ["ALL", ...Object.values(Role)] as const;

export class ListUserDto extends SortablePaginationDto(USER_SORTABLE, {
    defaultSortBy: "createdAt",
    defaultSortOrder: "DESC",
    defaultPerPage: 12
}) {
    @ApiPropertyOptional({ type: String, maxLength: 255 })
    @IsOptional()
    @IsString()
    @MaxLength(255)
    search?: string;

    @ApiPropertyOptional({ enum: USER_STATUSES })
    @IsOptional()
    @IsString()
    @IsIn(USER_STATUSES, { message: `status must be one of: ${USER_STATUSES.join(", ")}` })
    status?: (typeof USER_STATUSES)[number];

    @ApiPropertyOptional({ enum: USER_ROLES })
    @IsOptional()
    @IsString()
    @IsIn(USER_ROLES, { message: `role must be one of: ${USER_ROLES.join(", ")}` })
    role?: (typeof USER_ROLES)[number];
}
