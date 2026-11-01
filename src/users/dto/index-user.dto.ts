import { ApiPropertyOptional } from "@nestjs/swagger";
import { IsIn, IsOptional, IsString } from "class-validator";
import { Role } from "../role/role.enum.js";
import { Searchable, Sortable } from "../../common/dto/query-decorators.js";
import { PaginatedListDto } from "../../common/dto/pagination-query.dto.js";

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

@Searchable()
@Sortable(USER_SORTABLE)
export class ListUserDto extends PaginatedListDto<(typeof USER_SORTABLE)[number]> {
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
