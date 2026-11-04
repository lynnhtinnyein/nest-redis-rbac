import {
    CanActivate,
    ExecutionContext,
    HttpException,
    HttpStatus,
    Injectable
} from "@nestjs/common";
import type { Request } from "express";
import { RedisService } from "../redis/redis.service.js";

const MAX_ATTEMPTS = 5;
const WINDOW_SECONDS = 60;

@Injectable()
export class LoginThrottleGuard implements CanActivate {
    constructor(private readonly redis: RedisService) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const req = context.switchToHttp().getRequest<Request>();
        const count = await this.redis.incrWithTtl(`login-attempts:${req.ip}`, WINDOW_SECONDS);
        if (count > MAX_ATTEMPTS) {
            throw new HttpException(
                "Too many attempts, try again later",
                HttpStatus.TOO_MANY_REQUESTS
            );
        }
        return true;
    }
}
