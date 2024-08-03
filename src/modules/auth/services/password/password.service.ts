import { BadRequestException, Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class PasswordService {
    constructor() {}

    hashPassword(password: string) {
        return bcrypt.hashSync(password, 10);
    }

    comparePassword(password: string, hash: string) {
        return bcrypt.compareSync(password, hash);
    }

    /**
     * Validate a password.
     * @param password - The password to validate.
     * @returns True if the password is valid (meets the requirements), false otherwise.
     */
    validatePassword(password: string) : boolean {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        // At least one lowercase letter
        // At least one uppercase letter
        // At last one number
        // At least one special character
        // At least 8 characters
        if (!passwordRegex.test(password))
            return false;
        return true;
    }
}
