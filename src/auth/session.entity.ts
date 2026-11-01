import {
    Column,
    CreateDateColumn,
    Entity,
    Index,
    JoinColumn,
    ManyToOne,
    PrimaryColumn
} from "typeorm";
import { User } from "../users/user.entity.js";

@Entity("sessions")
export class Session {
    @PrimaryColumn({ type: "varchar", length: 36 })
    id: string;

    @Column({ length: 64, unique: true })
    refreshTokenHash: string;

    @Index()
    @Column({ type: "datetime" })
    expiresAt: Date;

    //relations
    @Column()
    userId: number;

    @ManyToOne(() => User, { onDelete: "CASCADE" })
    @JoinColumn({ name: "userId" })
    user: User;

    @CreateDateColumn()
    createdAt: Date;
}
