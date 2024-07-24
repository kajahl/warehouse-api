import { CanActivate, ExecutionContext, Injectable, Inject, forwardRef } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './Roles.guard';
import { PermissionsGuard } from './Permissions.guard';

@Injectable()
export class AnyGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        @Inject(forwardRef(() => RolesGuard)) private readonly rolesGuard: RolesGuard,
        @Inject(forwardRef(() => PermissionsGuard)) private readonly permissionsGuard: PermissionsGuard,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const firstGuardResult = await this.rolesGuard.canActivate(context);
        const secondGuardResult = await this.permissionsGuard.canActivate(context);
        return firstGuardResult || secondGuardResult;
    }
}