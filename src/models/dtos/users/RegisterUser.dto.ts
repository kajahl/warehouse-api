import { IsEmail, IsString, Length } from "class-validator";
import { User } from "../../types/User";

export default class RegisterUserDto implements Omit<User, '_id' | 'roles' | 'permissions'> {
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
}