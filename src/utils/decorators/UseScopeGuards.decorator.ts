// Decorators for guards

import { Reflector } from "@nestjs/core";
import { JwtScopes } from "src/models/types/Jwt";
import { Permissions, UserRole } from "src/models/types/UserRole";

export type GuardScopes = {
    roles?: UserRole[];
    permissions?: Permissions[];
    jwt?: JwtScopes[];
}

type AtLeastOne<T, U = { [K in keyof T]: Pick<T, K> }> = Partial<T> & U[keyof U];
type ArrayOrSingle<T> = T | T[];

export const UseScopeGuard = Reflector.createDecorator<ArrayOrSingle<AtLeastOne<GuardScopes>>>()

// TODO: "minRole" - minimum role required to access the route, also can be combined
// TODO: "isAuthenticated" - if user must be authenticated to access the route - create field here or use other decorator?
// TODO: "forbiddenRole": UserRole[] - if user with these roles should not access the route (forbidden is stronger than role/minRole)
// TODO: validator ^ - if "minRole" is set, "roles" should not be set, and others