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

