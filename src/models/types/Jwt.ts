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
export type JwtScopes = JwtTestScopes

export enum JwtTestScopes {
    TO_BE_IMPLEMENTED,
    TEST_SCOPE_1,
    TEST_SCOPE_2,
    TEST_SCOPE_3,
}