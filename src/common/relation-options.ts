import type {
    FindOneOptions,
    FindOptionsRelations,
    FindOptionsSelect,
    ObjectLiteral,
    Repository
} from "typeorm";

type RelationSpec = {
    select?: "*" | string[];
    withDeleted?: boolean;
};

export function buildFindOneOptions<T extends ObjectLiteral>(
    repo: Repository<T>,
    specs: Record<string, RelationSpec>
): FindOneOptions<T> {
    const { metadata } = repo;
    const relationNames = new Set(metadata.relations.map((relation) => relation.propertyName));
    const relations: Record<string, true> = {};
    const select: Record<string, unknown> = {};
    let withDeleted = false;

    for (const column of metadata.columns) {
        if (!relationNames.has(column.propertyName)) {
            select[column.propertyName] = true;
        }
    }

    for (const [name, spec] of Object.entries(specs)) {
        const relation = metadata.findRelationWithPropertyPath(name);
        if (!relation) {
            throw new Error(`Unknown relation "${name}" on ${metadata.name}`);
        }

        relations[name] = true;
        withDeleted ||= spec.withDeleted === true;

        if (!spec.select || spec.select === "*") {
            select[name] = true;
            continue;
        }

        const keys = new Set([
            ...relation.inverseEntityMetadata.primaryColumns.map((column) => column.propertyName),
            ...spec.select
        ]);
        select[name] = Object.fromEntries([...keys].map((key) => [key, true]));
    }

    return {
        relations: relations as unknown as FindOptionsRelations<T>,
        select: select as unknown as FindOptionsSelect<T>,
        ...(withDeleted ? { withDeleted } : {})
    };
}
