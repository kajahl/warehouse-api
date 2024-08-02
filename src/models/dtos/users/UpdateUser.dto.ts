import { IsEmpty, IsEnum, IsOptional, IsString, Length } from "class-validator";
import { UpdateUser } from "../../types/User";
import { UserRole } from "../../types/UserRole";
import { IsPermissions } from "src/utils/validators/isPermissions.validator";
import { Permissions } from "src/models/types/UserPermissions";

export default class UpdateUserDto implements UpdateUser {
    @IsEmpty()
    @IsOptional()
    firstName: string; // Cannot be updated in this context

    @IsEmpty()
    @IsOptional()
    lastName: string; // Cannot be updated in this context

    @IsString()
    @Length(1, 20)
    profileName: string;

    @IsEmpty()
    @IsOptional()
    email: string; // Cannot be updated in this context

    @IsEmpty()
    @IsOptional()
    password: string; // Cannot be updated in this context

    @IsOptional()
    @IsEnum(UserRole, { each: true })
    roles: UserRole[];

    @IsOptional()
    @IsPermissions({ each: true })
    permissions: Permissions[];
}