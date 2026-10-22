import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { User } from "./user.entity.js";

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly repo: Repository<User>
    ) {}

    findByEmail(email: string) {
        return this.repo.findOne({ where: { email } });
    }

    findById(id: number) {
        return this.repo.findOne({ where: { id } });
    }

    create(email: string, password: string) {
        return this.repo.save(this.repo.create({ email, password }));
    }
}
