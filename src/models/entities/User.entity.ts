import { BeforeInsert, Column, Entity, ObjectId, ObjectIdColumn, PrimaryGeneratedColumn, Unique } from "typeorm";
import { User } from "../types/User";
import { UserRole } from "../types/UserRole";
import { Permissions } from "../types/UserPermissions";

@Entity()
@Unique(['email'])
export class UserEntity implements User {
    @PrimaryGeneratedColumn()
    id: number;

    @Column({ length: 20, nullable: false })
    firstName: string;

    @Column({ length: 20, nullable: false })
    lastName: string;

    @Column({ length: 20, nullable: false })
    profileName: string;

    @Column({ nullable: false })
    email: string;

    @Column({ nullable: false })
    password: string;

    @Column({ type: 'simple-array', nullable: false, default: [] })
    roles: UserRole[];

    @Column({ type: 'simple-array', nullable: false, default: [] })
    permissions: Permissions[]

    @BeforeInsert()
    emailToLowerCase() {
        this.email = this.email.toLowerCase();
    }
}
