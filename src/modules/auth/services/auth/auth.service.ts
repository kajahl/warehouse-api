import { forwardRef, Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserRepository } from 'src/models/repositories/User.repository';
import { User } from 'src/models/types/User';

@Injectable()
export class AuthService {
    constructor(
        @Inject(forwardRef(() => UserRepository)) private userRepository: UserRepository,
        @Inject() private configService: ConfigService,
        @Inject() private jwtService: JwtService,
    ) {}

    hashPassword(password: string) {
        return bcrypt.hashSync(password, 10);
    }
    
    comparePassword(password: string, hash: string) {
        return bcrypt.compareSync(password, hash);
    }

    async validateUser(email: string, password: string): Promise<Omit<User, 'password'> | null> {
        const user = await this.userRepository.findByEmail(email);
        if (user == null) return null;
        const correctPassword = bcrypt.compareSync(password, user.password);
        if (!correctPassword) return null;
        const { password: _, ...result } = user;
        return result;
    }

    async login(user: User) {
        // const payload = {
        //     id: user.id
        // };
        // return {
        //     access_token: this.jwtService.sign(payload, { expiresIn: '1d', secret: this.configService.get<string>('JWT_SECRET') }),
        // };
        return true;
    }

    
}
