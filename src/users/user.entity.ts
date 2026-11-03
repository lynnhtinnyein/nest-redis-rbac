import {
    Column,
    CreateDateColumn,
    DeleteDateColumn,
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
import { Authorizable } from "./role/authorizable.js";
import { Role } from "./role/role.enum.js";

@Entity("users")
export class User extends Authorizable {
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

    @Column({ default: false })
    isSuspended: boolean;

    @Column({ type: "int", nullable: true })
    toggledById: number | null;

    @ManyToOne(() => User, (user) => user.toggledUsers, { nullable: true })
    @JoinColumn({ name: "toggledById" })
    toggledBy: User | null;

    @OneToMany(() => User, (user) => user.toggledBy)
    toggledUsers: User[];

    @Column({ type: "datetime", nullable: true })
    toggledAt: Date | null;

    @Column({ type: "int", nullable: true })
    createdById: number | null;

    @ManyToOne(() => User, (user) => user.createdUsers, { nullable: true })
    @JoinColumn({ name: "createdById" })
    createdBy: User | null;

    @OneToMany(() => User, (user) => user.createdBy)
    createdUsers: User[];

    @CreateDateColumn()
    createdAt: Date;

    @UpdateDateColumn()
    updatedAt: Date;

    @DeleteDateColumn()
    deletedAt: Date | null;

    @ManyToMany(() => Permission)
    @JoinTable({
        name: "user_permissions",
        joinColumn: { name: "userId" },
        inverseJoinColumn: { name: "permissionId" }
    })
    permissions: Permission[];
}
