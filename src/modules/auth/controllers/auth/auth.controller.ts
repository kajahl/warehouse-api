import { Controller, Get, HttpCode, HttpStatus, Inject, Post, Request, Response, Session, UseGuards } from '@nestjs/common';
import { AuthService } from '../../services/auth/auth.service';
import { LocalAuthGuard } from 'src/utils/guards/LocalAuth.guard';
import { IsAuthenticatedGuard } from 'src/utils/guards/IsAuthenticated.guard';
import { JwtAuthGuard } from 'src/utils/guards/JwtAuth.guard';
import { CustomJwtService } from '../../services/custom-jwt/custom-jwt.service';

@Controller('auth')
export class AuthController {
    constructor(
        @Inject() private authService: AuthService,
        @Inject() private jwtService: CustomJwtService
    ) {}

    // Local
    @Post('login')
    @UseGuards(LocalAuthGuard)
    @HttpCode(HttpStatus.OK)
    async login(@Request() req) {
        return this.authService.login(req.user);
    }

    @Post('logout')
    @HttpCode(HttpStatus.OK)
    async logout(@Request() req, @Response() res) {
        req.logout((err) => {
            if (err) {
                return res.status(500).send({ message: 'Failed to logout' });
            }
            req.session.destroy((err) => {
                if (err) {
                    return res.status(500).send({ message: 'Failed to destroy session' });
                }
                res.clearCookie('connect.sessid'); // Usuń ciasteczko sesji
                return res.status(200).send({ message: 'Logged out successfully' });
            });
        });
    }

    // Session

    @Get('session')
    @UseGuards(IsAuthenticatedGuard)
    getSession(@Session() session: Record<string, any>) {
        console.log(session);
        console.log(session.id);
        return session;
    }

    // Jwt

    @Post('generate-tokens')
    @UseGuards(IsAuthenticatedGuard)
    async generateTokens(@Request() req) {
        return this.jwtService.generateTokens(req.user);
    }

    // Utils
    @Get('profile')
    @UseGuards(JwtAuthGuard)
    getProfile(@Request() req) {
        return req.user;
    }
}
