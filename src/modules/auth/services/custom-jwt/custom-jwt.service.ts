import { BadRequestException, Inject, Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService as NestJwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { TokenRepository } from 'src/models/repositories/token/Token.repository';
import { User } from 'src/models/types/User';
import * as bcrypt from 'bcrypt';
import { JwtAccessToken, JwtPayload, JwtTokens } from 'src/models/types/Jwt';
import CustomError, { ErrorCodes } from 'src/utils/errors/Custom.error';
import { VERBOSE } from 'src/utils/consts';

@Injectable()
export class CustomJwtService {
    constructor(
        private readonly jwtService: NestJwtService,
        private readonly configService: ConfigService,
        @InjectRepository(TokenRepository) private tokenRepository: TokenRepository,
    ) {}

    /**
     * Generate tokens for user and store refresh token in the database
     * @param user - user (id and email) to generate tokens for
     * @returns tokens
     * @throws BadRequestException if token could not be saved in the database
     * @throws InternalServerErrorException in case of other error
     */
    async generateTokens(user: Pick<User, 'id' | 'email'>): Promise<JwtTokens> {
        const payload: JwtPayload = { sub: user.id, email: user.email };
        const accessToken = this._generateAccessToken(payload);
        const refreshToken = this._generateRefreshToken(payload);
        await this.tokenRepository.updateToken(user.id, refreshToken).catch((e) => {
            if (VERBOSE) console.warn(e);
            if (e instanceof CustomError && e.code === ErrorCodes.JWT_SAVE_ERROR) throw new BadRequestException(e.message);
            throw new InternalServerErrorException('#TODO_CODE_011');
        });
        return {
            accessToken,
            refreshToken,
        };
    }

    /**
     * Refresh access token using refresh token
     * @param refreshToken refresh token
     * @returns new access token
     * @throws BadRequestException if token is invalid (token not found in database or hash does not match)
     * @throws InternalServerErrorException in case of other error
     */
    async refreshAccessToken(refreshToken: string): Promise<JwtAccessToken> {
        // Check if token is valid
        this._verifyToken(refreshToken, true);

        // Check if token exists in the database
        const payload = this._decodeToken(refreshToken);
        const hashedToken = await this.tokenRepository.getHashedTokenByUserId(payload.sub).catch((e) => {
            if (VERBOSE) console.warn(e);
            if (e instanceof CustomError && e.code === ErrorCodes.NOT_FOUND)
                throw new BadRequestException('Token not found in the database');
            throw new InternalServerErrorException('#TODO_CODE_012');
        });
        if (!bcrypt.compareSync(refreshToken, hashedToken)) throw new BadRequestException('Invalid token');
        return {
            accessToken: this._generateAccessToken(payload),
        };
    }

    /**
     * Verify token
     * @param token token to verify
     * @param refresh is it a refresh token
     * @returns true if token is valid
     * @throws BadRequestException if token is invalid
     */
    _verifyToken(token: string, refresh: boolean = false): true {
        try {
            this.jwtService.verify(token, {
                secret: this.configService.get<string>(refresh ? 'JWT_REFRESH_SECRET' : 'JWT_SECRET'),
            });
            return true;
        } catch (e) {
            if (VERBOSE) console.warn(e);
            throw new BadRequestException('Invalid token');
        }
    }

    /**
     * Decode token
     * @param token token to decode 
     * @returns decoded token
     * @throws BadRequestException if token is invalid
     */
    _decodeToken(token: string): JwtPayload {
        try {
            const decoded = this.jwtService.decode(token);
            return decoded as JwtPayload;
        } catch (e) {
            if (VERBOSE) console.warn(e);
            throw new BadRequestException('Unable to decode token');
        }
    }

    /**
     * Generate access token
     * @param payload payload to sign
     * @returns access token
     */
    _generateAccessToken(payload: JwtPayload): string {
        return this.jwtService.sign({
            sub: payload.sub,
            email: payload.email,
        }, {
            expiresIn: '1m',
            secret: this.configService.get<string>('JWT_SECRET'),
        });
    }

    /**
     * Generate refresh token
     * @param payload payload to sign
     * @returns refresh token
     */
    _generateRefreshToken(payload: JwtPayload): string {
        return this.jwtService.sign({
            sub: payload.sub,
            email: payload.email,
        }, {
            expiresIn: '7d',
            secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        });
    }
}
