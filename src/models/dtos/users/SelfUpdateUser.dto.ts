import { IsEmpty, IsString, Length, ValidateIf } from "class-validator";
import { SelfUpdateUser } from "../../types/User";
import { DTO } from "src/models/types/Dtos";

export default class SelfUpdateUserDto implements DTO<SelfUpdateUser> {
    @ValidateIf((o) => o.id !== undefined)
    @IsEmpty({ message: 'Cannot update ID' })
    id: never;

    @ValidateIf((o) => o.email !== undefined)
    @IsEmpty({ message: 'First name cannot be updated in this context' })
    firstName: never; // Cannot be updated in this context

    @ValidateIf((o) => o.email !== undefined)
    @IsEmpty({ message: 'Last name cannot be updated in this context' })
    lastName: never; // Cannot be updated in this context

    @IsString()
    @Length(1, 20)
    profileName: string;

    @ValidateIf((o) => o.password !== undefined)
    @IsEmpty({ message: 'Email cannot be updated in this context' })
    email: never; // Cannot be updated in this context

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