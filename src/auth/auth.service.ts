import { createHash, randomUUID } from "node:crypto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, Not, Repository } from "typeorm";
import { User } from "../users/user.entity.js";
import { UsersService } from "../users/users.service.js";
import { LoginDto } from "./dto/login.dto.js";
import { Session } from "./session.entity.js";
import bcrypt from "bcrypt";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
        @InjectRepository(Session)
        private readonly sessionRepo: Repository<Session>
    ) {}

    async login(dto: LoginDto) {
        const user = await this.usersService.findByEmail(dto.email, { withRelations: true });
        const valid = user && (await bcrypt.compare(dto.password, user.password));
        if (!user || !valid) {
            throw new UnauthorizedException("Invalid credentials");
        }
        const tokens = await this.issueTokens(user);

        return {
            ...tokens,
            user
        };
    }

    async refresh(refreshToken: string) {
        let userId: number;
        try {
            const { sub } = await this.jwtService.verifyAsync(refreshToken, {
                secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET")
            });
            userId = sub;
        } catch {
            throw new UnauthorizedException("Invalid refresh token");
        }

        const refreshTokenHash = this.hash(refreshToken);
        const session = await this.sessionRepo.findOne({ where: { refreshTokenHash } });
        if (!session) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        const user = await this.usersService.findById(userId, { withRelations: true });
        if (!user || user.isSuspended) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        return this.issueTokens(user, session);
    }

    async logout(sid: string) {
        await this.sessionRepo.delete({ id: sid });
    }

    async logoutAll(userId: number, sid?: string) {
        await this.sessionRepo.delete({
            userId,
            ...(sid && { id: Not(sid) })
        });
    }

    private async issueTokens(user: User, currentSession?: Session) {
        const ttl = Number(this.config.get("JWT_REFRESH_EXPIRES_IN"));
        const sid = currentSession?.id ?? randomUUID();

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync({
                sub: user.id,
                sid,
                role: user.role,
                permissions: user.permissions.map((permission) => permission.value)
            }),
            this.jwtService.signAsync(
                { sub: user.id, jti: randomUUID() },
                {
                    secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
                    expiresIn: ttl
                }
            )
        ]);

        const refreshTokenHash = this.hash(refreshToken);
        const expiresAt = new Date(Date.now() + ttl * 1000);

        // clean up all sessionRepo that no longer valid
        await this.sessionRepo.delete({ expiresAt: LessThan(new Date()) });

        if (currentSession) {
            const { affected } = await this.sessionRepo.update(
                { id: currentSession.id, refreshTokenHash: currentSession.refreshTokenHash },
                { refreshTokenHash, expiresAt }
            );
            if (!affected) {
                throw new UnauthorizedException("Invalid refresh token");
            }
        } else {
            await this.sessionRepo.insert({
                id: sid,
                userId: user.id,
                refreshTokenHash,
                expiresAt
            });
        }

        return { accessToken, refreshToken };
    }

    private hash(token: string) {
        return createHash("sha256").update(token).digest("hex");
    }
}
