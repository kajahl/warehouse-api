import { IsEmail, IsEmpty, IsEnum, IsOptional, IsString, Length } from "class-validator";
import { UpdateUser } from "../../types/User";
import { UserRole } from "../../types/UserRole";
import { IsPermissions } from "src/utils/validators/isPermissions.validator";
import { Permissions } from "src/models/types/UserPermissions";

export default class UpdateUserDto implements UpdateUser {
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

    @IsOptional()
    @IsEmpty()
    password: string; // Cannot be updated in this context

    @IsOptional()
    @IsEmpty()
    roles: UserRole[]; // Cannot be updated in this context
    
    @IsOptional()
    @IsEmpty() 
    permissions: Permissions[]; // Cannot be updated in this context
}