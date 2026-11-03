import { ObjectLiteral, Repository } from "typeorm";

export async function hasDependents<T extends ObjectLiteral>(
    repo: Repository<T>,
    id: number,
    relations: string[]
): Promise<boolean> {
    for (const relation of relations) {
        const exists = await repo
            .createQueryBuilder("e")
            .withDeleted()
            .innerJoin(`e.${relation}`, "r")
            .where("e.id = :id", { id })
            .getExists();

        if (exists) return true;
    }

    return false;
}

export async function deleteOrArchive<T extends ObjectLiteral>(
    repo: Repository<T>,
    id: number,
    relations: string[]
): Promise<"archived" | "deleted"> {
    if (await hasDependents(repo, id, relations)) {
        await repo.softDelete(id);
        return "archived";
    }

    await repo.delete(id);
    return "deleted";
}
