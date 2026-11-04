import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { RedisService } from "../redis/redis.service.js";

@Injectable()
export class TokenBlacklistService {
    constructor(
        private readonly redis: RedisService,
        private readonly config: ConfigService
    ) {}

    revokeSession(sid: string) {
        const ttl = Number(this.config.getOrThrow("JWT_EXPIRES_IN"));
        return this.redis.set(`revoked-session:${sid}`, 1, ttl);
    }

    isSessionRevoked(sid: string) {
        return this.redis.exists(`revoked-session:${sid}`);
    }
}
