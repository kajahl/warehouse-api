import { Test, TestingModule } from '@nestjs/testing';
import { CustomJwtService } from './custom-jwt.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { TokenRepository } from 'src/models/repositories/token/Token.repository';
import CustomError, { ErrorCodes } from 'src/utils/errors/Custom.error';
import { BadRequestException, InternalServerErrorException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('CustomJwtService', () => {
    let service: CustomJwtService;
    let jwtService: JwtService;
    let tokenRepository: TokenRepository;

    const user = { id: 1, email: 'email' };
    const token = { sub: 1, email: 'email' };

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                CustomJwtService,
                {
                    provide: JwtService,
                    useValue: {
                        sign: jest.fn(),
                        verify: jest.fn(),
                        decode: jest.fn(),
                    },
                },
                {
                    provide: ConfigService,
                    useValue: {
                        get: jest.fn().mockImplementation((key: string) => key),
                    },
                },
                {
                    provide: TokenRepository,
                    useValue: {
                        updateToken: jest.fn(),
                        getHashedTokenByUserId: jest.fn(),
                    },
                },
            ],
        }).compile();

        service = module.get<CustomJwtService>(CustomJwtService);
        jwtService = module.get<JwtService>(JwtService);
        tokenRepository = module.get<TokenRepository>(TokenRepository);
    });

    it('should be defined', () => {
        expect(service).toBeDefined();
    });

    describe('generateTokens()', () => {
        it('should generate tokens for user and store refresh token in the database', async () => {
            const accessToken = 'accessToken';
            const refreshToken = 'refreshToken';
            jest.spyOn(service, '_generateAccessToken').mockReturnValue(accessToken);
            jest.spyOn(service, '_generateRefreshToken').mockReturnValue(refreshToken);
            jest.spyOn(tokenRepository, 'updateToken').mockResolvedValue(true);
            await expect(service.generateTokens(user)).resolves.toEqual(
                expect.objectContaining({
                    accessToken: accessToken,
                    refreshToken: refreshToken,
                }),
            );
        });

        it('should throw an BadRequestException if tokenRepository.updateToken() throw CustomError with JWT_SAVE_ERROR code', async () => {
            jest.spyOn(tokenRepository, 'updateToken').mockRejectedValue(new CustomError(ErrorCodes.JWT_SAVE_ERROR));
            await expect(service.generateTokens(user)).rejects.toThrow(BadRequestException);
        });

        it('should throw an InternalServerErrorException if error is unknown', async () => {
            jest.spyOn(tokenRepository, 'updateToken').mockRejectedValue(new Error());
            await expect(service.generateTokens(user)).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('refreshAccessToken()', () => {
        // skip throwing errors by _verifyToken(), always return true - other checking in _verifyToken() tests
        // skip throwing errors by _decodeToken(), always return true - other checking in _decodeToken() tests
        it('should refresh access token using refresh token', async () => {
            jest.spyOn(service, '_verifyToken').mockReturnValue(true);
            jest.spyOn(service, '_decodeToken').mockReturnValue(token);
            jest.spyOn(tokenRepository, 'getHashedTokenByUserId').mockResolvedValue('hashedToken');
            jest.spyOn(bcrypt, 'compareSync').mockReturnValue(true);
            jest.spyOn(service, '_generateAccessToken').mockReturnValue('accessToken');

            expect(await service.refreshAccessToken('refreshToken')).toEqual(
                expect.objectContaining({ accessToken: 'accessToken' })
            );
        });

        it('should throw BadRequestException if given token does not match with token hash from database', async () => {
            jest.spyOn(service, '_verifyToken').mockReturnValue(true);
            jest.spyOn(service, '_decodeToken').mockReturnValue(token);
            
            jest.spyOn(tokenRepository, 'getHashedTokenByUserId').mockResolvedValue('hashedToken');
            jest.spyOn(bcrypt, 'compareSync').mockReturnValue(false);

            await expect(service.refreshAccessToken('refreshToken')).rejects.toThrow(BadRequestException);
        });

        it('should throw BadRequestException if a token hash belonging to the user is not found in the database', async () => {
            jest.spyOn(service, '_verifyToken').mockReturnValue(true);
            jest.spyOn(service, '_decodeToken').mockReturnValue(token);

            jest.spyOn(tokenRepository, 'getHashedTokenByUserId').mockRejectedValue(new CustomError(ErrorCodes.NOT_FOUND));

            await expect(service.refreshAccessToken('refreshToken')).rejects.toThrow(BadRequestException);
        });

        it('should throw InternalServerErrorException if error is unknown', async () => {
            jest.spyOn(service, '_verifyToken').mockReturnValue(true);
            jest.spyOn(service, '_decodeToken').mockReturnValue(token);

            jest.spyOn(tokenRepository, 'getHashedTokenByUserId').mockRejectedValue(new Error());

            await expect(service.refreshAccessToken('refreshToken')).rejects.toThrow(InternalServerErrorException);
        });
    });

    describe('getScopesFromToken()', () => {
        it('should be implemented', async () => {
            throw new Error('Not implemented');
        });
    });

    describe('_verifyToken()', () => {
        it('should return true if token is valid', () => {
            jest.spyOn(jwtService, 'verify').mockReturnValue({});
            expect(service._verifyToken('token')).toBeTruthy();
        });

        it('should throw BadRequestException if token is invalid', () => {
            jest.spyOn(jwtService, 'verify').mockImplementation(() => {throw new Error()});
            expect(() => service._verifyToken('token')).toThrow(BadRequestException);
        });
    });

    describe('_decodeToken()', () => {
        it('should return decoded token', () => {
            jest.spyOn(jwtService, 'decode').mockReturnValue(token);
            expect(service._decodeToken('token')).toEqual(token);
        });

        it('should throw BadRequestException if token is invalid', () => {
            jest.spyOn(jwtService, 'decode').mockImplementation(() => {throw new Error()});
            expect(() => service._decodeToken('token')).toThrow(BadRequestException);
        });
    });

    describe('_generateAccessToken()', () => {
        it('should generate access token', () => {
            jest.spyOn(jwtService, 'sign').mockReturnValue('accessToken');
            expect(service._generateAccessToken(token)).toEqual('accessToken');
        });
    });

    describe('_generateRefreshToken()', () => {
        it('should generate refresh token', () => {
            jest.spyOn(jwtService, 'sign').mockReturnValue('refreshToken');
            expect(service._generateRefreshToken(token)).toEqual('refreshToken');
        });
    });
});
