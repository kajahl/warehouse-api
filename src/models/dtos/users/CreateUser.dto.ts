import { IsEmail, IsEmpty, IsEnum, IsString, Length, ValidateIf } from "class-validator";
import { CreateUser } from "../../types/User";
import { DTO } from "src/models/types/Dtos";
import { UserRole } from "../../types/UserRole";
import { IsPermissions } from "src/utils/validators/isPermissions.validator";
import { Permissions } from "src/models/types/UserPermissions";

export default class CreateUserDto implements DTO<CreateUser> {
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

    @IsEnum(UserRole, { each: true })
    roles: UserRole[];
    
    @IsPermissions({ each: true })
    permissions: Permissions[];
}