import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { AppModule } from "./app.module.js";
import { BadRequestException, ValidationPipe } from "@nestjs/common";

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    // validate form request
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true,
            transform: true,
            exceptionFactory: (errors) =>
                new BadRequestException(
                    errors.map((error) => {
                        const constraints = error.constraints ?? {};
                        return constraints.isNotEmpty ?? Object.values(constraints)[0];
                    })
                )
        })
    );

    app.setGlobalPrefix("api/v1");
    const config = app.get(ConfigService);
    await app.listen(config.get<number>("PORT") ?? 3000);
}
bootstrap();
