import type {
    FindOneOptions,
    FindOptionsRelations,
    FindOptionsSelect,
    ObjectLiteral,
    Repository
} from "typeorm";

export function buildFindOneOptions<T extends ObjectLiteral>(
    repo: Repository<T>,
    specs: string[]
): FindOneOptions<T> {
    const { metadata } = repo;
    const relationNames = new Set(metadata.relations.map((relation) => relation.propertyName));
    const relations: Record<string, true> = {};
    const select: Record<string, unknown> = {};

    for (const column of metadata.columns) {
        if (!relationNames.has(column.propertyName)) {
            select[column.propertyName] = true;
        }
    }

    for (const spec of specs) {
        const [name, columns] = spec.split(":");
        const relation = metadata.findRelationWithPropertyPath(name);
        if (!relation) {
            throw new Error(`Unknown relation "${name}" on ${metadata.name}`);
        }

        relations[name] = true;

        if (!columns) {
            select[name] = true;
            continue;
        }

        const keys = new Set([
            ...relation.inverseEntityMetadata.primaryColumns.map((column) => column.propertyName),
            ...columns.split(",").map((column) => column.trim())
        ]);
        select[name] = Object.fromEntries([...keys].map((key) => [key, true]));
    }

    return {
        relations: relations as unknown as FindOptionsRelations<T>,
        select: select as unknown as FindOptionsSelect<T>
    };
}
