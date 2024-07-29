import { Repository } from 'typeorm';
import { TokenEntity } from '../entities/Token.entity';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import CustomError, { ErrorCodes } from 'src/utils/errors/Custom.error';
import { VERBOSE } from 'src/utils/consts';

export class TokenRepository extends Repository<TokenEntity> {
    constructor(@InjectRepository(TokenEntity) private tokenRepository: Repository<TokenEntity>) {
        super(tokenRepository.target, tokenRepository.manager, tokenRepository.queryRunner);
    }

    /**
     * Update a refreshToken for a user
     * @param userId - Id of the user
     * @param refreshToken - New refreshToken
     * @return - True if token was updated / created
     * @throw - CustomError with code TO_BE_DEFINED if error occurs
     */
    async updateToken(userId: number, refreshToken: string): Promise<boolean> {
        let existingToken = await this.findOne({ where: { user: { id: userId } } });
        const hashedToken = bcrypt.hashSync(refreshToken, 10);

        // Token never existed
        if (!existingToken) {
            const token = this.create({ user: { id: userId }, refreshTokenHash: hashedToken });
            existingToken = await this.save(token).catch(e => {
                if (VERBOSE) console.warn(e);
                throw new CustomError(ErrorCodes.JWT_SAVE_ERROR, `Error while creating token ${e}`);
            });
            return true;
        }

        // Update refreshToken
        existingToken.refreshTokenHash = hashedToken;
        await this.save(existingToken).catch(e => {
            if (VERBOSE) console.warn(e);
            throw new CustomError(ErrorCodes.JWT_SAVE_ERROR, `Error while updating token ${e}`);
        });
        return true;
    }

    /**
     * Find a hash of a refreshToken for a user
     * @param userId - Id of the user
     * @returns - Hash of the refreshToken
     */
    async getHashedTokenByUserId(userId: number): Promise<string> {
        const token = await this.findOne({ where: { user: { id: userId } } });
        if (!token) throw new CustomError(ErrorCodes.NOT_FOUND, 'Token not found');
        return token.refreshTokenHash;
    }

    async existsHash(refreshTokenHash: string): Promise<boolean> {
        return await this.findOne({ where: { refreshTokenHash } }).then(v => !!v).catch(() => false);
    }

}
