import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Permission } from "../permissions/permission.entity.js";
import { Authorizable } from "../users/role/authorizable.js";
import type { Role } from "../users/role/role.enum.js";

export interface AuthUserData {
    id: number;
    sid: string;
    role: Role;
    permissions: Permission[];
}

export class AuthUser extends Authorizable {
    readonly id: number;
    readonly sid: string;
    readonly role: Role;
    readonly permissions: Permission[];

    constructor(data: AuthUserData) {
        super();
        this.id = data.id;
        this.sid = data.sid;
        this.role = data.role;
        this.permissions = data.permissions;
    }
}

export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): AuthUser => ctx.switchToHttp().getRequest().user
);
