import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { UserRepository } from 'src/models/repositories/user/User.repository';
import { User } from 'src/models/types/User';
import { PasswordService } from '../password/password.service';

@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UserRepository)) private userRepository: UserRepository,
        private passwordService: PasswordService
    ) {}

    async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
        email = email.toLowerCase();
        const user = await this.userRepository.findByEmail(email);
        if (user == null) return null;
        const correctPassword = this.passwordService.comparePassword(password, user.password);
        if (!correctPassword) return null;
        const { password: _, ...result } = user;
        return result;
    }
    
    async login(user: Omit<User, 'password'>) {
        return user;
    }
}
