import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
    use(req: Request, res: Response, next: NextFunction) {
        console.log(`== New Request [ ${new Date().toLocaleString()} ] ==`);
        console.log(`Request Method: ${req.method}`);
        console.log(`Request URL: ${req.originalUrl}`);
        console.log(`Request Headers: ${JSON.stringify(req.headers, null, 2)}`);
        console.log(`Request Body: ${JSON.stringify(req.body, null, 2)}`);
        console.log(`=============================================`)
        next();
    }
}
