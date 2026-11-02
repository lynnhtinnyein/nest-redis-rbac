import { FindOneOptions, In, ObjectLiteral, Repository, SelectQueryBuilder } from "typeorm";

export interface Pagination {
    page: number;
    perPage: number;
}

export interface PaginatedResponse<T> {
    content: T[];
    page: number;
    perPage: number;
    totalPages: number;
    totalElements: number;
    hasMore: boolean;
}

interface PaginateParams<T extends ObjectLiteral> {
    repo: Repository<T>;
    qb: SelectQueryBuilder<T>;
    pagination: { page: number; perPage: number };
    relations?: FindOneOptions<T>;
}

export const emptyPage = <T>(pagination: Pagination): PaginatedResponse<T> => ({
    content: [],
    page: pagination.page,
    perPage: pagination.perPage,
    totalPages: 0,
    totalElements: 0,
    hasMore: false
});

export async function paginate<T extends ObjectLiteral>({
    repo,
    qb,
    pagination: { page, perPage },
    relations
}: PaginateParams<T>): Promise<PaginatedResponse<T>> {
    const totalElements = await qb.clone().getCount();

    const content = await qb
        .clone()
        .offset((page - 1) * perPage)
        .limit(perPage)
        .getMany();

    if (content.length && relations) {
        const pk = repo.metadata.primaryColumns[0].propertyName;

        const loaded = await repo.find({
            ...relations,
            where: { [pk]: In(content.map((item) => item[pk])) }
        } as any);

        const byId = new Map<any, any>(loaded.map((item) => [item[pk], item]));

        const raw = relations.relations;
        const keys = [
            ...new Set(
                Array.isArray(raw)
                    ? raw.map((path) => String(path).split(".")[0])
                    : Object.keys(raw ?? {})
            )
        ];

        for (const key of keys) {
            const relation = repo.metadata.findRelationWithPropertyPath(key);
            const empty = relation?.isOneToMany || relation?.isManyToMany ? [] : null;

            for (const item of content as any[]) {
                item[key] = byId.get(item[pk])?.[key] ?? empty;
            }
        }
    }

    const totalPages = Math.ceil(totalElements / perPage);

    return {
        content,
        page,
        perPage,
        totalPages,
        totalElements,
        hasMore: page < totalPages
    };
}
