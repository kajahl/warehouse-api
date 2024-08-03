import { IsString, Length } from "class-validator";
import { SelfChangePassword } from "src/models/types/User";

export default class SelfChangePasswordDto implements SelfChangePassword {
    @IsString()
    @Length(8, 32)
    currentPassword: string;

    @IsString()
    @Length(8, 32)
    password: string;
    
    @IsString()
    @Length(8, 32)
    confirmPassword: string;
}