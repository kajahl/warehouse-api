import { Exclude, Expose } from "class-transformer";
import { User } from "src/models/types/User";
import { Permissions } from "src/models/types/UserPermissions";
import { UserRole } from "src/models/types/UserRole";

class BaseAccessSerializedUser implements User {
    id: number;
    firstName: string;
    lastName: string;
    profileName: string;
    roles: UserRole[];
    permissions: Permissions[];

    @Exclude()
    password: string;

    @Exclude()
    email: string;

    constructor(partial: Partial<BaseAccessSerializedUser>) {
        Object.assign(this, partial);
    }
}


export class PublicAccessSerializedUser extends BaseAccessSerializedUser {
    @Exclude()
    roles: UserRole[];

    @Exclude()
    permissions: Permissions[];

    @Exclude()
    lastName: string;

    constructor(partial: Partial<PublicAccessSerializedUser>) {
        super(partial);
        Object.assign(this, partial);
    }
}

export class AdminAccessSerializedUser extends BaseAccessSerializedUser {
    @Expose()
    email: string;

    constructor(partial: Partial<AdminAccessSerializedUser>) {
        super(partial);
        Object.assign(this, partial);
    }
}