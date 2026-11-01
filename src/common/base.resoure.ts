import type { Pagination } from "nestjs-typeorm-paginate";

export abstract class BaseResource {
    static collection<T>(
        this: { create(item: T): unknown },
        resource: Pagination<T>
    ): {
        content: unknown[];
        page: number;
        perPage: number;
        totalPages: number;
        totalElements: number;
        hasMore: boolean;
    };
    static collection<T>(this: { create(item: T): unknown }, resource: T[]): unknown[];
    static collection<T>(this: { create(item: T): unknown }, resource: Pagination<T> | T[]) {
        if (Array.isArray(resource)) {
            return resource.map((item) => this.create(item));
        }

        const { items, meta } = resource;
        const totalPages = meta.totalPages ?? 0;

        return {
            content: items.map((item) => this.create(item)),
            page: meta.currentPage,
            perPage: meta.itemsPerPage,
            totalPages,
            totalElements: meta.totalItems ?? 0,
            hasMore: meta.currentPage < totalPages
        };
    }
}
