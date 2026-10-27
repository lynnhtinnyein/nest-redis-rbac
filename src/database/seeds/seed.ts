import { ConfigService } from "@nestjs/config";
import { NestFactory } from "@nestjs/core";
import { DataSource } from "typeorm";
import { AppModule } from "../../app.module.js";
import { seedPermissions } from "./permissions/permissions.seed.js";
import { seedUsers } from "./users/users.seed.js";

async function run() {
    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: ["error", "warn"]
    });

    try {
        const dataSource = app.get(DataSource);
        await seedPermissions(dataSource);
        await seedUsers(dataSource, app.get(ConfigService));
        console.log("Seeding complete");
    } finally {
        await app.close();
    }
}

run().catch((error) => {
    console.error(error);
    process.exit(1);
});
