import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import * as session from 'express-session';
import * as passport from 'passport';
import * as connectPgSimple from 'connect-pg-simple';
import { Pool } from 'pg';

async function bootstrap() {
    const app = await NestFactory.create(AppModule);
    const configService = app.get(ConfigService);

    const PgSession = connectPgSimple(session);

    const pool = new Pool({
        user: configService.get<string>('DB_USERNAME'),
        host: configService.get<string>('DB_HOST'),
        database: configService.get<string>('DB_NAME'),
        password: configService.get<string>('DB_PASSWORD'),
        port: configService.get<number>('DB_PORT'),
    });

    app.use(
        session({
            name: 'sessid',
            secret: configService.get<string>('SESSION_SECRET'),
            resave: false,
            saveUninitialized: false,
            cookie: {
                maxAge: 1000 * 60 * 60 * 24,
            },
            store: new PgSession({
                pool: pool,
                tableName: 'session-store',
                createTableIfMissing: true,
            }),
        }),
    );
    app.use(passport.initialize());
    app.use(passport.session());
    await app.listen(3000);
}
bootstrap();
