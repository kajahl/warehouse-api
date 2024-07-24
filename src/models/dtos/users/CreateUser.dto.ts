import { IsEmail, IsEnum, IsString, Length } from "class-validator";
import { User } from "../../types/User";
import { Permissions, UserRole } from "src/models/types/UserRole";

export default class CreateUserDto implements Omit<User, '_id'> {
    @IsString()
    @Length(1, 20)
    firstName: string;

    @IsString()
    @Length(1, 20)
    lastName: string;

    @IsString()
    @Length(1, 20)
    profileName: string;

    @IsEmail()
    email: string;

    @IsString()
    @Length(8, 32)
    password: string;

    @IsEnum(UserRole, { each: true })
    roles: UserRole[];

    @IsEnum(Permissions, { each: true })
    permissions: Permissions[];
}