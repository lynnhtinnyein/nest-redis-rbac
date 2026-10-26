import { createHash, randomUUID } from "node:crypto";
import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { InjectRepository } from "@nestjs/typeorm";
import { LessThan, Repository } from "typeorm";
import { UsersService } from "../users/users.service.js";
import { LoginDto } from "./dto/login.dto.js";
import { RefreshTokenHash } from "./refresh-token-hash.entity.js";
import bcrypt from "bcrypt";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly jwtService: JwtService,
        private readonly config: ConfigService,
        @InjectRepository(RefreshTokenHash)
        private readonly refreshTokenHashes: Repository<RefreshTokenHash>
    ) {}

    async login(dto: LoginDto) {
        const user = await this.usersService.findByEmail(dto.email);
        const valid = user && (await bcrypt.compare(dto.password, user.password));
        if (!user || !valid) {
            throw new UnauthorizedException("Invalid credentials");
        }
        const tokens = await this.issueTokens(user.id, user.email);

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

        // terminate once refreshed
        const { affected } = await this.refreshTokenHashes.delete({
            tokenHash: this.hash(refreshToken)
        });
        if (!affected) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        const user = await this.usersService.findById(userId);
        if (!user) {
            throw new UnauthorizedException("Invalid refresh token");
        }

        return this.issueTokens(user.id, user.email);
    }

    async logout(refreshToken: string) {
        await this.refreshTokenHashes.delete({ tokenHash: this.hash(refreshToken) });
    }

    async logoutAll(userId: number) {
        await this.refreshTokenHashes.delete({ userId });
    }

    private async issueTokens(id: number, email: string) {
        const payload = { sub: id, email };
        const ttl = Number(this.config.get("JWT_REFRESH_EXPIRES_IN"));

        const [accessToken, refreshToken] = await Promise.all([
            this.jwtService.signAsync(payload),
            this.jwtService.signAsync(
                { ...payload, jti: randomUUID() },
                {
                    secret: this.config.getOrThrow<string>("JWT_REFRESH_SECRET"),
                    expiresIn: ttl
                }
            )
        ]);

        await this.refreshTokenHashes.delete({ userId: id, expiresAt: LessThan(new Date()) });
        await this.refreshTokenHashes.insert({
            userId: id,
            tokenHash: this.hash(refreshToken),
            expiresAt: new Date(Date.now() + ttl * 1000)
        });

        return { accessToken, refreshToken };
    }

    private hash(token: string) {
        return createHash("sha256").update(token).digest("hex");
    }
}
