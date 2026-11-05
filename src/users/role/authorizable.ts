import { Permission } from "../../permissions/permission.entity.js";
import { roleLevel } from "./role-policy.js";
import { Role } from "./role.enum.js";

export abstract class Authorizable {
    abstract id: number;
    abstract role: Role;
    abstract permissions: Permission[] | string[];

    get permissionValues(): string[] {
        return this.permissions.map((permission) =>
            typeof permission === "string" ? permission : permission.value
        );
    }

    canManage(target: Role | { role: Role }) {
        const role = typeof target === "string" ? target : target.role;
        return roleLevel(this.role) > roleLevel(role);
    }

    canCreate(targetRole: Role) {
        return this.role === Role.SUPER_ADMIN || this.canManage(targetRole);
    }

    canAccess(target: { id: number; role: Role }) {
        if (this.id === target.id) return true;
        if (target.role === Role.SUPER_ADMIN) return false;
        return this.canManage(target);
    }

    hasPermission(value: string) {
        return this.permissionValues.includes(value);
    }

    getAccessibleRoles(): Role[] {
        return Object.values(Role).filter((role) => roleLevel(role) <= roleLevel(this.role));
    }
}
