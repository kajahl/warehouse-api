import { Injectable } from '@nestjs/common';
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
}
