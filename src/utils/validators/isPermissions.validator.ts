import {
    registerDecorator,
    ValidationArguments,
    ValidationOptions,
    ValidatorConstraint,
    ValidatorConstraintInterface
  } from 'class-validator';
import { OtherPermissionsPlaceholder, UserRelatedPermissions } from 'src/models/types/UserRole';
  
  @ValidatorConstraint({ async: false })
  export class IsPermissionsConstraint implements ValidatorConstraintInterface {
    validate(value: any, args: ValidationArguments) {
      // Sprawdź, czy wartość jest jednym z typów Permissions
      return Object.values(Permissions).includes(value) //||
            //  Object.values(OtherPermissionsPlaceholder).includes(value);
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