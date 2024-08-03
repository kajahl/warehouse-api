import { IsString, Length } from "class-validator";
import { ChangePassword } from "src/models/types/User";

export default class ChangePasswordDto implements ChangePassword {
    @IsString()
    @Length(8, 32)
    password: string;
    
    @IsString()
    @Length(8, 32)
    confirmPassword: string;
}