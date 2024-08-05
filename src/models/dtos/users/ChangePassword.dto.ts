import { IsString, Length } from "class-validator";
import { ChangePassword } from "src/models/types/User";
import { DTO } from "src/models/types/Dtos";

export default class ChangePasswordDto implements DTO<ChangePassword> {
    @IsString()
    @Length(8, 32)
    password: string;
    
    @IsString()
    @Length(8, 32)
    confirmPassword: string;
}