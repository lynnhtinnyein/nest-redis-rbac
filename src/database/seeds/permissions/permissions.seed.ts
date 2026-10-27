import { DataSource } from "typeorm";
import { dependencies, permissions } from "./permissions.data.js";
import { Permission } from "../../../permissions/permission.entity.js";

export async function seedPermissions(dataSource: DataSource) {
    const repo = dataSource.getRepository(Permission);
    await repo.upsert(permissions, ["value"]);

    const saved = await repo.find();
    const byValue = new Map(saved.map((permission) => [permission.value, permission]));

    for (const [value, dependsOn] of Object.entries(dependencies)) {
        const permission = byValue.get(value);
        if (!permission) {
            throw new Error(`Unknown permission: ${value}`);
        }

        permission.dependencies = dependsOn.map((dependencyValue) => {
            const dependency = byValue.get(dependencyValue);
            if (!dependency) {
                throw new Error(`Unknown dependency ${dependencyValue} on ${value}`);
            }
            return dependency;
        });

        await repo.save(permission);
    }
}
