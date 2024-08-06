import { IsEmail, IsEmpty, IsString, Length, ValidateIf } from "class-validator";
import { RegisterUser } from "../../types/User";
import { DTO } from "src/models/types/Dtos";

export default class RegisterUserDto implements DTO<RegisterUser> {
    @ValidateIf((o) => o.id !== undefined)
    @IsEmpty({ message: 'Cannot set ID' })
    id: never; // Cannot set
    
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

    @ValidateIf((o) => o.roles !== undefined)
    @IsEmpty({ message: 'Roles cannot be updated in this context' })
    roles: never; // Cannot set in this context

    @ValidateIf((o) => o.permissions !== undefined)
    @IsEmpty({ message: 'Permissions cannot be updated in this context' })
    permissions: never; // Cannot set in this context
}