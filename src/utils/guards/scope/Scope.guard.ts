import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { User } from 'src/models/types/User';
import { UserRoleToPermissionsMap } from 'src/models/types/UserRole';
import { CustomJwtService } from 'src/modules/auth/services/custom-jwt/custom-jwt.service';
import { GuardScopes, UseScopeGuard } from 'src/utils/decorators/UseScopeGuards.decorator';
@Injectable()
export class ScopeGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly jwtService: CustomJwtService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const requiredScopes = this.reflector.get(UseScopeGuard, context.getHandler());

        const request = context.switchToHttp().getRequest();
        const user = request.user as Omit<User, 'password'> || undefined;
        const token = request.headers['authorization'] || undefined;

        const isAuthenticated = user !== undefined;
        const isTokenProvided = token !== undefined;

        let isTokenValid = undefined;
        if(isTokenProvided) {
            try {
                this.jwtService._verifyToken(token)
                isTokenValid = true;
            } catch (error) {
                isTokenValid = false;
            }
        }

        //console.log('request.user', request.user, isAuthenticated, 'request.headers', request.headers, isTokenProvided, isTokenValid);

        // AuthScopes will be empty if user is not authenticated and token is not provided
        
        // Not authenticated and token not provided
        if (!isAuthenticated && !isTokenProvided) return false;
        // Not authenticated, token provided but invalid
        if (!isAuthenticated && isTokenProvided && !isTokenValid) return false;

        const individualPermissions = user?.permissions || [];
        const rolePermissions = Array.from(new Set(user?.roles.map(role => UserRoleToPermissionsMap[role]).flat()));
        const allPermissions = Array.from(new Set([...individualPermissions, ...rolePermissions]));

        const authScopes: GuardScopes = {
            roles: isAuthenticated ? user.roles : [],
            permissions: isAuthenticated ? allPermissions : [],
            jwt: isTokenProvided ? await this.jwtService.getScopesFromToken(token) : []
        };

        // If single scope
        if (!(requiredScopes instanceof Array)) return this.verifyGuardSet(requiredScopes, authScopes);

        // If multiple scopes
        for (const requiredScope of requiredScopes) {
            if (this.verifyGuardSet(requiredScope, authScopes)) {
                return true;
            }
        }

        // Default
        return false;
    }

    private verifyGuardSet(guardScopes: GuardScopes, authScopes: GuardScopes): boolean {
        // Roles
        if (guardScopes.roles && guardScopes.roles.length > 0) {
            const hasEveryRole = guardScopes.roles.every((role) => authScopes.roles.includes(role));
            if (!hasEveryRole) return false;
        }
        // Permissions
        if (guardScopes.permissions && guardScopes.permissions.length > 0) {
            const hasEveryPermission = guardScopes.permissions.every((permission) =>
                authScopes.permissions.includes(permission),
            );
            if (!hasEveryPermission) return false;
        }
        // JWT
        if (guardScopes.jwt && guardScopes.jwt.length > 0) {
            const hasEveryScope = guardScopes.jwt.every((scope) => authScopes.jwt.includes(scope));
            if (!hasEveryScope) return false;
        }
        return true;
    }
}
