import type { PaginatedResponse } from "../common/orm/paginate.js";

export abstract class BaseResource {
    static collection<T>(
        this: { create(item: T): unknown },
        resource: PaginatedResponse<T>
    ): PaginatedResponse<unknown>;
    static collection<T>(this: { create(item: T): unknown }, resource: T[]): unknown[];
    static collection<T>(this: { create(item: T): unknown }, resource: PaginatedResponse<T> | T[]) {
        if (Array.isArray(resource)) {
            return resource.map((item) => this.create(item));
        }

        return {
            ...resource,
            content: resource.content.map((item) => this.create(item))
        };
    }
}
