import { ConfigService } from "@nestjs/config";
import bcrypt from "bcrypt";
import { DataSource } from "typeorm";
import { User } from "../../users/user.entity.js";
import { Role } from "../../users/role.enum.js";

export async function seedSuperAdmin(dataSource: DataSource, config: ConfigService) {
    const email = config.getOrThrow<string>("SEED_SUPER_ADMIN_EMAIL");
    const password = config.getOrThrow<string>("SEED_SUPER_ADMIN_PASSWORD");

    const repo = dataSource.getRepository(User);
    if (await repo.findOne({ where: { email } })) {
        return;
    }

    await repo.save(
        repo.create({
            name: "Super Admin",
            email,
            password: await bcrypt.hash(password, 10),
            role: Role.SUPER_ADMIN
        })
    );
}
