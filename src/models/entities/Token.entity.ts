import { Column, Entity, JoinColumn, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./User.entity";
import { User } from "../types/User";

@Entity()
export class TokenEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @OneToOne(() => UserEntity, user => user.id)
    @JoinColumn()
    user: User;

    @Column({ nullable: false })
    refreshTokenHash: string;
}