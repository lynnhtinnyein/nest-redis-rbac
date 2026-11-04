import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthUser, AuthUserData } from "../current-user.decorator.js";
import { TokenBlacklistService } from "../token-blacklist.service.js";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(
        config: ConfigService,
        private readonly blacklist: TokenBlacklistService
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.getOrThrow<string>("JWT_SECRET")
        });
    }

    async validate(payload: AuthUserData & { sub: number }) {
        if (await this.blacklist.isSessionRevoked(payload.sid)) {
            throw new UnauthorizedException("Session revoked");
        }
        return new AuthUser({
            id: payload.sub,
            sid: payload.sid,
            role: payload.role,
            permissions: payload.permissions
        });
    }
}
