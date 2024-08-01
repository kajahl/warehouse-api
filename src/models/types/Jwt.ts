export type JwtPayload = {
    sub: number;
    email: string;
};

export type JwtRefreshToken = {
    refreshToken: string;
}

export type JwtAccessToken = {
    accessToken: string;
}

export type JwtTokens = JwtRefreshToken & JwtAccessToken;

// TODO: Implement
export enum JwtScope {
    TO_BE_IMPLEMENTED
}