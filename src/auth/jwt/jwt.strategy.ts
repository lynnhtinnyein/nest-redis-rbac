import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { AuthUser, AuthUserData } from "../current-user.decorator.js";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
    constructor(config: ConfigService) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: config.getOrThrow<string>("JWT_SECRET")
        });
    }

    validate(payload: AuthUserData & { sub: number }) {
        return new AuthUser({
            id: payload.sub,
            sid: payload.sid,
            role: payload.role,
            permissions: payload.permissions,
            isSuspended: payload.isSuspended
        });
    }
}
