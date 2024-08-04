import { UndefinedErrorOccurred } from "src/utils/helpers/CustomExceptionErrors";

export const UserExceptionMessages = {
    // Service & Controller
    PASSWORD_DOES_NOT_MEET_REQUIREMENTS: 'Password does not meet requirements',
    NEW_PASSWORD_CANNOT_BE_THIS_SAME_AS_OLD_PASSWORD: 'New password cannot be the same as the old password',
    PASSWORDS_AND_CONFIRMPASSWORD_DOES_NOT_MATCH: 'Passwords do not match',
    CURRENT_PASSWORD_IS_INCORRECT: 'Current password is incorrect',
    MISSING_CONFIRM_QUERY_PARAMETER: 'You must specify the confirm query parameter as true to perform the action.',
    CANNOT_PERFORM_ACTION_ON_YOURSELF_USING_THIS_ENDPOINT: 'You cannot perform this action on yourself using this endpoint',
    CANNOT_PERFORM_ACTION_ON_USER_WITH_HIGHER_ROLE: 'You cannot perform this action on a user with a higher or equal role than yours',

    // Service
    ERROR_CODE_001: UndefinedErrorOccurred(1),
    ERROR_CODE_002: UndefinedErrorOccurred(2),
    ERROR_CODE_003: UndefinedErrorOccurred(3),
    ERROR_CODE_004: UndefinedErrorOccurred(4),
    ERROR_CODE_005: UndefinedErrorOccurred(5),
    ERROR_CODE_006: UndefinedErrorOccurred(6),
    ERROR_CODE_007: UndefinedErrorOccurred(7),

    // Repository
    USER_NOT_FOUND: 'User not found',
    USER_WITH_THIS_EMAIL_ALREADY_EXISTS: 'User with this email already exists',  
    CANNOT_UPDATE_PASSWORD_USING_THIS_METHOD: 'Cannot update password using this method',
};