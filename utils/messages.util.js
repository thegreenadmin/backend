module.exports = {
  PASSWORD_HASH_NOT_GENERATED: "Hash not generated",
  PASSWORD_NOT_MATCH: "Password not match",

  FIRST_NAME_REQUIRED: "First name is required",
  LAST_NAME_REQUIRED: "Last name is required",
  EMAIL_REQUIRED: "Email is required",
  PHONE_NUMBER_REQUIRED: "Phone number is required",
  DOB_REQUIRED: "DOB is required",

  OTP_SUCCESSFULLY_SEND: "OTP successfully sent",
  OTP_NOT_GENERATED: "OTP not generated, Please try it again",
  OTP_NOT_MATCHED: "OTP not matched, Please try it again",
  LOGIN_SUCCESSFULLY: "Logged in successfully",
  OTP_IS_REQUIRED: "OTP is required",

  DEVICE_ID_REQUIRED: "Device Id is required",
  DEVICE_TOKEN_REQUIRED: "Device Token is required",

  INVALID_TOKEN: "Invalid token",
  INVALID_SESSION: "Invalid session",
  INVALID_FILE_PATH: "The file source is not valid",
  INVALID_IMAGE_EXTENSION: "Image must be of type JPG|JPEG|PNG",
  INVALID_EMAIL_FORMAT: "Email format is invalid",
  INVALID_PHONE_NUMBER: "Phone number is invalid",
  INVALID_DATE_FORMAT: "Date format is YYYY-MM-DD",

  SESSION_EXPIRED: "Session is expired, Please login again!",
  SOMETHING_WENT_WRONG: "Something went wrong",

  FILE_SUCCESSFULLY_UPLOADED: "File successfully uploaded",

  PROOF_TYPE_UNAVAILABLE: "Proof type is unavailable",
  EXPIARY_DATE_REQUIRED: "Expiary date is required",
  IMAGE_REQUIRED: "Image is required",

  USER_NOT_FOUND: "Please sign up first to proceed",
  USER_SUCCESSFULLY_CREATED: "Account successfully created",
  USER_PROOF_ALREADY_AVILABLE: "User proof verification is already available",
  USER_PROOF_STORED_SUCCESSFULLY: "User proof details successfully stored",
  USER_FAVOURITE_STORE_ADDED_SUCCESSFULLY:
    "Store added to favorites successfully",
  USER_NOT_VERIFIED: "User is not verified",

  STORE_CREATED_SUCCESSFULLY: "Store created successfully",
  STORE_UNAVAILABLE: "Store is unavailable",
  STORE_NOT_ENABLED:
    "Store not enabled, Please contact store owner to enabled the store.",

  FAVOURITE_STORE_ALREADY_EXISTS: "Store already added to favorites",
  FAVOURITE_STORE_NOT_EXISTS: "Favourite store not exists",
  FAVOURITE_STORE_REMOVED_SUCCESSFULLY:
    "Store removed from favorites successfully",

  UNAUTHORIZED_ACCESS: "Unauthorized access",

  MODULE_ALREADY_EXISTS: "Module already exists",

  CONTROLLER_ALREADY_EXISTS: "Controller already exists",
  CONTROLLER_NOT_FOUND: "Controller not found",
  CONTROLLER_BELONGS_ONLY_TO_STORE_OWNER:
    "Controller only belongs to store owner",
  CONTROLLERS_SUCCESSFULLY_FETCHED: "Controllers successfully fetched",

  INVALID_STORE_USER_CREATING_CONSTRAINTS:
    "Store user could not create as some constraints are missing",
  STORE_USER_ALREADY_EXISTS: "User already exists",
  STORE_USER_CREATION_SUBJECT: "Invitation for joining the store",
  STORE_USER_CREATED_SUCCESSFULLY: "Store worket added successfully.",
  STORE_USER_NOT_FOUND: "Unauthorized store user",
  STORE_USER_VERIFICATION_CODE_EXPIRED: "Verification code expires",
  STORE_USER_SUCCESSFULLY_VERIFIED: "User successfully verified",
  STORE_USER_VERIFICATION_CODE_NOT_MATCHES: "Verification failed",
  STORE_USER_NOT_BELONGS_TO_STORE: "User not belongs to the store",
  STORE_USER_PERMISSION_NOT_FOUND: "User does not have permission",
  STORE_USERS_FETCHED_SUCCESSFULLY: "Users list fetched successfully",
  STORE_USER_DETAILS_FETCHED_SUCCESSFULLY: "User details fetched successfully",
  STORE_USER_DELETED_SUCCESSFULLY: "User deleted successfully",
  STORE_USER_NOT_DELETED: "Store owner can not be removed",
  LOCATION_ACCESS_NOT_GRANTED: "Please provide the Location access",
  ASSOCIATED_LOCATION_NOT_FOUND:
    "No location is associated with this postal code.",
  STORE_USER_ROLE_CREATED_SUCCESSFULLY: "Role for store created successfully",
  STORE_USER_ROLE_NOT_FOUND: "Role does not exists",
  STORE_USER_ROLE_DELETED_SUCCESSFULLY: "Role successfully removed",

  STORE_ROLE_CREATED_SUCCESSFULLY: "Role for store created successfully",
  STORE_ROLE_ALREADY_EXISTS: "Role already exists",
  STORE_ROLES_FETCHED_SUCCESSFULLY: "Store roles successfully fetched",
  STORE_ROLE_NOT_FOUND: "Role not found",
  STORE_ROLE_NOT_BELONGS_TO_STORE: "Role not belongs to the store",
  STORE_ROLE_NOT_DELETED: "Role can not be removed",
  STORE_ROLE_DELETED_SUCCESSFULLY: "Role successfully removed",

  STORE_ROLE_PERMISSION_ALREADY_EXISTS: "Permission already exists",
  STORE_ROLE_PERMISSION_SUCCESSFULLY_CREATED: "Permission successfully created",
  STORE_ROLE_PERMISSIONS_SUCCESSFULLY_FETCHED:
    "Store role permissions successfully fetched",
  STORE_ROLE_PERMISSION_NOT_DELETED: "Permission can not be removed",
  STORE_ROLE_PERMISSION_DELETED_SUCCESSFULLY: "Permission successfully removed",

  EXCEPTION_NAME_SEQUALIZE_UNIQUE_CONSTRAINT: "SequelizeUniqueConstraintError",
  EXCEPTION_MESSAGE_VALIDATION_ERROR: "Validation error",
  EXCEPTION_MESSAGE_ROLE_NOT_EXISTS: "column role.role_id does not exist",
};
