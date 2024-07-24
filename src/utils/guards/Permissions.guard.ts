import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class PermissionsGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        return true;
    }
}