import { IsString, Length } from "class-validator";

export default class ChangePasswordDto {
    @IsString()
    @Length(8, 32)
    password: string;
    
    @IsString()
    @Length(8, 32)
    confirmPassword: string;
}