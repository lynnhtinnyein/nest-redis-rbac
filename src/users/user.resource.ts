import { BaseResource } from "../common/base.resoure.js";
import type { User } from "./user.entity.js";

export class UserResource extends BaseResource {
    static ref(user: User) {
        return { id: user.id, name: user.name };
    }

    static create(user: User) {
        return {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            isSuspended: user.isSuspended,
            toggledAt: user.toggledAt,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt,
            permissions: user.permissions && user.permissions.map((e) => e.value),
            toggledBy: user.toggledBy && UserResource.ref(user.toggledBy),
            createdBy: user.createdBy && UserResource.ref(user.createdBy)
        };
    }
}
