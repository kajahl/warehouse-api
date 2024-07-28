import { Controller, Get, HttpCode, HttpStatus, Inject, Post, Request, Response, Session, UseGuards } from '@nestjs/common';
import { AuthService } from '../../services/auth/auth.service';
import { LocalAuthGuard } from 'src/utils/guards/LocalAuth.guard';
import { IsAuthenticatedGuard } from 'src/utils/guards/IsAuthenticated.guard';
import { JwtAuthGuard } from 'src/utils/guards/JwtAuth.guard';

@Controller('auth')
export class AuthController {
    constructor(@Inject() private authService: AuthService) {}

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

    // Utils
    @Get('profile')
    @UseGuards(JwtAuthGuard)
    getProfile(@Request() req) {
        return req.user;
    }

    @Get('session')
    @UseGuards(IsAuthenticatedGuard)
    getSession(@Session() session: Record<string, any>) {
        console.log(session);
        console.log(session.id);
        return session;
    }
}
