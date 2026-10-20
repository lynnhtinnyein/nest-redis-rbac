import { ConflictException, Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service.js";
import { RegisterDto } from "./auth.dto.js";
import bcrypt from "bcrypt";

@Injectable()
export class AuthService {
    constructor(private readonly usersService: UsersService) {}

    async register(dto: RegisterDto) {
        const existing = await this.usersService.findByEmail(dto.email);
        if (existing) {
            throw new ConflictException("Email already registered");
        }

        const hashed = await bcrypt.hash(dto.password, 10);
        const user = await this.usersService.create(dto.email, hashed);

        return { id: user.id, email: user.email, createdAt: user.createdAt };
    }
}
