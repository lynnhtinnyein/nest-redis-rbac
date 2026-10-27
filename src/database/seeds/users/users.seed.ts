import { faker } from "@faker-js/faker";
import { ConfigService } from "@nestjs/config";
import { DataSource } from "typeorm";
import { User } from "../../../users/user.entity.js";
import { Permission } from "../../../permissions/permission.entity.js";
import { Role } from "../../../users/role/role.enum.js";
import { makeUser, makeUsers } from "../../factories/user.factory.js";

export async function seedUsers(dataSource: DataSource, config: ConfigService) {
    const repo = dataSource.getRepository(User);
    const permissions = await dataSource.getRepository(Permission).find();
    const adminPermissions = permissions.filter((permission) => {
        const accessibleRoles = permission?.accessibleRoles || [];
        return accessibleRoles.includes(Role.ADMIN);
    });

    const superAdmin = await repo.save(
        await makeUser({
            name: "Super Admin",
            email: config.getOrThrow<string>("SEED_SUPER_ADMIN_EMAIL"),
            password: config.getOrThrow<string>("SEED_SUPER_ADMIN_PASSWORD"),
            role: Role.SUPER_ADMIN,
            permissions
        })
    );

    const admins = await repo.save(
        await makeUsers(2, {
            role: Role.ADMIN,
            createdBy: superAdmin,
            permissions: adminPermissions
        })
    );

    const users = await makeUsers(10);
    users.forEach((user) => (user.createdBy = faker.helpers.arrayElement(admins)));
    await repo.save(users);
}
