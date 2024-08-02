import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from 'src/models/types/User';

export const AuthUser = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user as User;
        return user;
    },
);
