import { Role } from "./role.enum.js";

const levels: Record<Role, number> = {
    [Role.USER]: 1,
    [Role.ADMIN]: 2,
    [Role.SUPER_ADMIN]: 3
};

export const roleLevel = (role: Role) => levels[role] ?? 0;
