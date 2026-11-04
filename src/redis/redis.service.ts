import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { Redis } from "ioredis";

@Injectable()
export class RedisService implements OnModuleDestroy {
    private readonly client: Redis;

    constructor(config: ConfigService) {
        this.client = new Redis({
            host: config.get<string>("REDIS_HOST", "localhost"),
            port: config.get<number>("REDIS_PORT", 6379)
        });
    }

    async get<T>(key: string): Promise<T | null> {
        const value = await this.client.get(key);
        return value ? (JSON.parse(value) as T) : null;
    }

    async set(key: string, value: unknown, ttlSeconds?: number): Promise<void> {
        const payload = JSON.stringify(value);
        if (ttlSeconds) {
            await this.client.set(key, payload, "EX", ttlSeconds);
        } else {
            await this.client.set(key, payload);
        }
    }

    async del(key: string): Promise<void> {
        await this.client.del(key);
    }

    async exists(key: string): Promise<boolean> {
        return (await this.client.exists(key)) === 1;
    }

    async incrWithTtl(key: string, ttlSeconds: number): Promise<number> {
        const count = await this.client.incr(key);
        if (count === 1) {
            await this.client.expire(key, ttlSeconds);
        }
        return count;
    }

    async onModuleDestroy() {
        await this.client.quit();
    }
}
