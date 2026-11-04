import { Controller, Get } from "@nestjs/common";
import { RedisService } from "./redis.service.js";

@Controller("redis-test")
export class RedisTestController {
    constructor(private readonly redis: RedisService) {}

    @Get()
    async test() {
        await this.redis.set("nest:ping", { ok: true }, 30);
        return this.redis.get("nest:ping");
    }
}
