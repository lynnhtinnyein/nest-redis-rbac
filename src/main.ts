import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module.js";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix("api/v1");
    const config = app.get(ConfigService);
    await app.listen(config.get<number>("PORT") ?? 3000);
}
bootstrap();
