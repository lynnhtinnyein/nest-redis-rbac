import { faker } from "@faker-js/faker";
import bcrypt from "bcrypt";
import { User } from "../../users/user.entity.js";
import { Role } from "../../users/role/role.enum.js";

export async function makeUser(overrides: Partial<User> = {}): Promise<User> {
    const user = Object.assign(new User(), {
        name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        role: Role.USER,
        ...overrides
    });
    user.password = await bcrypt.hash(overrides.password ?? "Password@123", 10);
    return user;
}

export function makeUsers(count: number, overrides: Partial<User> = {}): Promise<User[]> {
    return Promise.all(Array.from({ length: count }, () => makeUser(overrides)));
}
