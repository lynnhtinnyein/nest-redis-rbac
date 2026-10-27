import { NestFactory } from "@nestjs/core";
import { ConfigService } from "@nestjs/config";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
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

    // swagger
    const swaggerConfig = new DocumentBuilder()
        .setTitle("Nest Auth")
        .setVersion("1.0")
        .addBearerAuth()
        .build();

    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup("docs", app, document);

    const config = app.get(ConfigService);
    await app.listen(config.get<number>("PORT") ?? 3000);
}
bootstrap();
