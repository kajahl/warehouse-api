import { Test, TestingModule } from "@nestjs/testing";
import { TokenRepository } from "./Token.repository";
import { getRepositoryToken } from "@nestjs/typeorm";
import { TokenEntity } from "src/models/entities/Token.entity";
import { Repository } from "typeorm";
import CustomError from "src/utils/errors/Custom.error";

describe('TokenRepository', () => {
    let repository: TokenRepository;

    beforeEach(async () => {
        const module: TestingModule = await Test.createTestingModule({
            providers: [
                TokenRepository,
                {
                    provide: getRepositoryToken(TokenEntity),
                    useClass: Repository
                }
            ],
        }).compile();

        repository = module.get<TokenRepository>(TokenRepository);
    });

    it('should be defined', () => {
        expect(repository).toBeDefined();
    });

    describe('updateToken()', () => {
        /*
            findOne - if token exists
            create - create token - cannot cause impact itself
            save - save token - returns TokenEntity or throws an Error
        */

        // Token does not exist - create token test
        it('should create token', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);
            jest.spyOn(repository, 'create').mockReturnValue({} as any); 
            jest.spyOn(repository, 'save').mockResolvedValue({} as any);
            const result = await repository.updateToken(1, 'token');
            expect(result).toBe(true);
        });

        it('should throw error', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);
            jest.spyOn(repository, 'create').mockReturnValue({} as any); 
            jest.spyOn(repository, 'save').mockRejectedValue(new Error());
            await expect(repository.updateToken(1, 'token')).rejects.toThrow(CustomError);
        });

        // Token exists - update token test
        it('should update token', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue({} as any);
            jest.spyOn(repository, 'create').mockReturnValue({} as any); 
            jest.spyOn(repository, 'save').mockResolvedValue({} as any);
            const result = await repository.updateToken(1, 'token');
            expect(result).toBe(true);
        });

        it('should throw error', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue({} as any);
            jest.spyOn(repository, 'create').mockReturnValue({} as any); 
            jest.spyOn(repository, 'save').mockRejectedValue(new Error());
            await expect(repository.updateToken(1, 'token')).rejects.toThrow(CustomError);
        });
    });

    describe('getHashedTokenByUserId()', () => {
        it('should return token', async () => {
            const refreshTokenHash = 'token';
            jest.spyOn(repository, 'findOne').mockResolvedValue({ refreshTokenHash } as any);
            const result = await repository.getHashedTokenByUserId(1);
            expect(result).toBe(refreshTokenHash);
        });

        it('should throw error', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue(null);
            await expect(repository.getHashedTokenByUserId(1)).rejects.toThrow(CustomError);
        });
    });

    describe('existsHash()', () => {
        it('should return true if token exists', async () => {
            jest.spyOn(repository, 'findOne').mockResolvedValue({} as any);
            const result = await repository.existsHash('token');
            expect(result).toBe(true);
        });

        it('should return false if token does not exists', async () => {
            jest.spyOn(repository, 'findOne').mockRejectedValue(new Error());
            const result = await repository.existsHash('token');
            expect(result).toBe(false);
        });
    });
});