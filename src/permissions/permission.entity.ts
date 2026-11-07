import {
    Column,
    CreateDateColumn,
    Entity,
    JoinTable,
    ManyToMany,
    PrimaryGeneratedColumn
} from "typeorm";
import { Role } from "../users/role/role.enum.js";

@Entity("permissions")
export class Permission {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ unique: true })
    name: string;

    @Column({ nullable: true })
    description: string;

    @Column({ unique: true })
    value: string;

    @Column({ default: false })
    isAdminDefault: boolean;

    @Column({ type: "json", nullable: true })
    assignableRoles: Role[] | null;

    @Column({ default: false })
    isHidden: boolean;

    @Column({ type: "smallint", default: 1 })
    riskLevel: number;

    @CreateDateColumn()
    createdAt: string;

    //relations
    @ManyToMany(() => Permission)
    @JoinTable({
        name: "permission_dependencies",
        joinColumn: { name: "permissionId" },
        inverseJoinColumn: { name: "dependencyId" }
    })
    dependencies: Permission[];
}
