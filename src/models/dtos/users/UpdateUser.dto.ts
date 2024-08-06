import { IsEmail, IsEmpty, IsEnum, IsOptional, IsString, Length, ValidateIf } from "class-validator";
import { UpdateUser } from "../../types/User";
import { DTO } from "src/models/types/Dtos";

export default class UpdateUserDto implements DTO<UpdateUser> {
    @ValidateIf((o) => o.id !== undefined)
    @IsEmpty({ message: 'Cannot update ID' })
    id: never;
    
    @IsString()
    @IsOptional()
    @Length(1, 20)
    firstName: string;

    @IsString()
    @IsOptional()
    @Length(1, 20)
    lastName: string;

    @IsString()
    @IsOptional()
    @Length(1, 20)
    profileName: string;

    @IsEmail()
    @IsOptional()
    email: string;

    @ValidateIf((o) => o.password !== undefined)
    @IsEmpty({ message: 'Password cannot be updated in this context' })
    password: never; // Cannot be updated in this context

    @ValidateIf((o) => o.roles !== undefined)
    @IsEmpty({ message: 'Roles cannot be updated in this context' })
    roles: never; // Cannot be updated in this context

    @ValidateIf((o) => o.permissions !== undefined)
    @IsEmpty({ message: 'Permissions cannot be updated in this context' })
    permissions: never; // Cannot be updated in this context
}