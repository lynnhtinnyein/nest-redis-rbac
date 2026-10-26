import { PermissionResource } from "../permissions/permission.resource.js";
import type { User } from "./user.entity.js";

export class UserResource {
    static ref(user: User) {
        return { id: user.id, name: user.name };
    }

    static make(user: User) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isSuspended: user.isSuspended,
            toggledAt: user.toggledAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            permissions: user.permissions && PermissionResource.collection(user.permissions),
            toggledBy: user.toggledBy && UserResource.ref(user.toggledBy),
            createdBy: user.createdBy && UserResource.ref(user.createdBy)
        };
    }

    static collection(users: User[]) {
        return users.map((user) => UserResource.make(user));
    }
}
