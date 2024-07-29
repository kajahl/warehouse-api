import { Test, TestingModule } from '@nestjs/testing';
import { PasswordService } from './password.service';
import { BadRequestException } from '@nestjs/common';

describe('PasswordService', () => {
    let service: PasswordService;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [PasswordService],
        }).compile();

        service = module.get<PasswordService>(PasswordService);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('hashPassword()', () => {
        it('should hash password', () => {
            const password = 'password';
            const hash = service.hashPassword(password);
            expect(hash).toBeDefined();
            expect(hash).not.toEqual(password);
        });
    });

    describe('comparePassword()', () => {
        it('should compare password', () => {
            const password = 'password';
            const hash = service.hashPassword(password);
            expect(service.comparePassword(password, hash)).toBe(true);
            expect(service.comparePassword('wrongPassword', hash)).toBe(false);
        });
    });

    describe('validatePassword()', () => {
        it('should validate password', () => {
            // At least one lowercase letter (1)
            // At least one uppercase letter (2)
            // At last one number (3)
            // At least one special character (4)
            // At least 8 characters (5)
            const wrongPasswords = [
                'PASSWORD1*', // 1
                'password1*', // 2
                'Password*', // 3
                'Password1', // 4
                'Pa$w1', // 5
            ];
            wrongPasswords.forEach((password) => {
                expect(() => service.validatePassword(password)).toThrow(BadRequestException);
            });
            
            const correctPasswords = [
                'Password1!',
                'Password123!',
            ];
            correctPasswords.forEach((password) => {
                expect(() => service.validatePassword(password)).not.toThrow();
            });
        });
    });
});
