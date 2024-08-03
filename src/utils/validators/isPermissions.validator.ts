import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface,
} from 'class-validator';
import { PermissionsValues } from '../../models/types/UserPermissions';

@ValidatorConstraint({ async: false })
export class IsPermissionsConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
        return Object.values(PermissionsValues).includes(value);
    }

    defaultMessage(args: ValidationArguments) {
        return 'Value ($value) is not a valid Permissions type!';
    }
}

export function IsPermissions(validationOptions?: ValidationOptions) {
    return function (object: Object, propertyName: string) {
        registerDecorator({
            target: object.constructor,
            propertyName: propertyName,
            options: validationOptions,
            constraints: [],
            validator: IsPermissionsConstraint,
        });
    };
}
