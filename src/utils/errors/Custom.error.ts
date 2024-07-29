export default class CustomError extends Error {
    constructor(public code: ErrorCodes, message: string = '') {
        super(message);
        this.name = 'CustomError';
    }
}

export enum ErrorCodes {
    DUPLICATE_POSTGRES_ERROR_CODE = 23505,
    BAD_METHOD = 1,
    NOT_FOUND = 2,
    JWT_SAVE_ERROR = 3,
    TO_BE_DEFINED = 9999,
}