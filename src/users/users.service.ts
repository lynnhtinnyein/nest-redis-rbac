import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./users.entity.js";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly repo: Repository<User>
    ) {}

    findByEmail(email: string) {
        return this.repo.findOne({ where: { email } });
    }

    create(email: string, password: string) {
        return this.repo.save(this.repo.create({ email, password }));
    }
}
