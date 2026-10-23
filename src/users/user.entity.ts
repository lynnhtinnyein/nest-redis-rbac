import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    JoinTable,
    ManyToMany,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import { Role } from "./role.enum.js";
import { Permission } from "../permissions/permission.entity.js";

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

    @ManyToOne(() => User, { nullable: true })
    @JoinColumn({ name: "createdById" })
    createdBy: User | null;

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
}
