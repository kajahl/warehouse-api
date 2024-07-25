import { IsEmail, IsString, Length } from "class-validator";
import { RegisterUser } from "../../types/User";

export default class RegisterUserDto implements RegisterUser{
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