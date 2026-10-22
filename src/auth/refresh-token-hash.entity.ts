import {
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import { User } from "../users/user.entity.js";

@Entity("refresh-token-hashes")
export class RefreshTokenHash {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 64, unique: true })
    tokenHash: string;

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
