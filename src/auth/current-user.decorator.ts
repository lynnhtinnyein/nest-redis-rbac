import { createParamDecorator, type ExecutionContext } from "@nestjs/common";
import type { Permission } from "../permissions/permission.entity.js";
import { Authorizable } from "../users/role/authorizable.js";
import type { Role } from "../users/role/role.enum.js";

export interface AuthUserData {
    id: number;
    sid: string;
    role: Role;
    permissions: Permission[];
    isSuspended: boolean;
}

export class AuthUser extends Authorizable {
    readonly id: number;
    readonly sid: string;
    readonly role: Role;
    readonly permissions: Permission[];
    readonly isSuspended: boolean;

    constructor(data: AuthUserData) {
        super();
        this.id = data.id;
        this.sid = data.sid;
        this.role = data.role;
        this.permissions = data.permissions;
        this.isSuspended = data.isSuspended;
    }
}

export const CurrentUser = createParamDecorator(
    (_data: unknown, ctx: ExecutionContext): AuthUser => ctx.switchToHttp().getRequest().user
);
