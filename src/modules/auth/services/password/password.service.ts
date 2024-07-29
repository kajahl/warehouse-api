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

    validatePassword(password: string) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        // At least one lowercase letter
        // At least one uppercase letter
        // At last one number
        // At least one special character
        // At least 8 characters
        if (!passwordRegex.test(password))
            throw new BadRequestException('Password does not meet complexity requirements');
        return true;
    }
}
