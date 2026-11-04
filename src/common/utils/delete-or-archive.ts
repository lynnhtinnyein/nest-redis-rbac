import { ObjectLiteral, QueryFailedError, Repository } from "typeorm";

const FK_VIOLATION_ERRNOS = [1451, 1217];

export async function deleteOrArchive<T extends ObjectLiteral>(
    repo: Repository<T>,
    id: number
): Promise<"archived" | "deleted"> {
    try {
        await repo.delete(id);
        return "deleted";
    } catch (error) {
        const errno = (error as QueryFailedError & { driverError?: { errno?: number } }).driverError
            ?.errno;

        if (error instanceof QueryFailedError && errno && FK_VIOLATION_ERRNOS.includes(errno)) {
            await repo.softDelete(id);
            return "archived";
        }

        throw error;
    }
}
