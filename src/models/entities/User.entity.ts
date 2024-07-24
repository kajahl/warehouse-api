import { BeforeInsert, Column, Entity, ObjectId, ObjectIdColumn, Unique } from "typeorm";
import { User } from "../types/User";
import { Permissions, UserRole } from "../types/UserRole";

@Entity()
@Unique(['email'])
export class UserEntity implements User {
    @ObjectIdColumn()
    _id: ObjectId;

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
