import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service.js";

@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @Get()
    entry(): string {
        return this.appService.about();
    }

    @Get("/health")
    checkHealth(): string {
        return this.appService.checkHealth();
    }
}
