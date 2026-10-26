import type { Permission } from "./permission.entity.js";

export class PermissionResource {
    static make(permission: Permission) {
        return {
            id: permission.id,
            value: permission.value,
            name: permission.name,
            description: permission.description,
            isHidden: permission.isHidden,
            riskLevel: permission.riskLevel,
            accessibleRoles: permission.accessibleRoles
        };
    }

    static collection(permissions: Permission[]) {
        return permissions.map((permission) => PermissionResource.make(permission));
    }
}
