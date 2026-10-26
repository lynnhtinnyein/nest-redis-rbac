import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { Permission } from "../permissions/permission.entity.js";
import { Role } from "./role.enum.js";
import { roleLevel } from "./role-policy.js";

@Entity("users")
export class User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({ unique: true })
    email: string;

    @Column()
    password: string;

    @Column({ type: "enum", enum: Role, default: Role.USER })
    role: Role;

    // suspend and restore
    @Column({ default: false })
    isSuspended: boolean;

    @Column({ type: "int", nullable: true })
    toggledById: number | null;

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "toggledById" })
    toggledBy: User | null;

    @Column({ type: "datetime", nullable: true })
    toggledAt: Date | null;

    // create
    @Column({ type: "int", nullable: true })
    createdById: number | null;

    @ManyToOne(() => User, (user) => user.createdAccounts, { nullable: true })
    @JoinColumn({ name: "createdById" })
    createdBy: User | null;

    @OneToMany(() => User, (user) => user.createdBy)
    createdAccounts: User[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    //relations
    @ManyToMany(() => Permission)
    @JoinTable({
        name: "user_permissions",
        joinColumn: { name: "userId" },
        inverseJoinColumn: { name: "permissionId" }
    })
    permissions: Permission[];

    // helper functions
    canManage(target: Role | User) {
        const role = typeof target === "string" ? target : target.role;
        return roleLevel(this.role) > roleLevel(role);
    }

    canCreate(targetRole: Role) {
        return this.role === Role.SUPER_ADMIN || this.canManage(targetRole);
    }

    canView(target: User) {
        if (this.id === target.id) {
            return true;
        }
        if (target.role === Role.SUPER_ADMIN) {
            return false;
        }
        return this.canManage(target);
    }

    hasPermission(value: string) {
        if (this.isSuspended) {
            return false;
        }
        return this.permissions?.some((permission) => permission.value === value) ?? false;
    }
}
