type AuthErrorCode =
  | 'AUTH_INVALID_CREDENTIALS'
  | 'AUTH_EMAIL_NOT_CONFIRMED'
  | 'AUTH_USER_ALREADY_EXISTS'
  | 'AUTH_WEAK_PASSWORD'
  | 'AUTH_SESSION_EXPIRED'
  | 'AUTH_UNAUTHORIZED'
  | 'AUTH_UNKNOWN_ERROR';

export interface StandardAuthError {
  error: {
    code: AuthErrorCode;
    message: string;
  };
}

function mapToErrorCode(rawMessage: string): AuthErrorCode {
  const message = rawMessage.toLowerCase();

  if (message.includes('invalid login credentials')) {
    return 'AUTH_INVALID_CREDENTIALS';
  }
  if (message.includes('email not confirmed')) {
    return 'AUTH_EMAIL_NOT_CONFIRMED';
  }
  if (message.includes('user already registered')) {
    return 'AUTH_USER_ALREADY_EXISTS';
  }
  if (message.includes('password') && message.includes('weak')) {
    return 'AUTH_WEAK_PASSWORD';
  }
  if (message.includes('jwt expired') || message.includes('session')) {
    return 'AUTH_SESSION_EXPIRED';
  }
  if (message.includes('unauthorized') || message.includes('permission')) {
    return 'AUTH_UNAUTHORIZED';
  }

  return 'AUTH_UNKNOWN_ERROR';
}

const ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  AUTH_INVALID_CREDENTIALS: 'Incorrect email or password.',
  AUTH_EMAIL_NOT_CONFIRMED: 'Please confirm your email before signing in.',
  AUTH_USER_ALREADY_EXISTS: 'An account with this email already exists.',
  AUTH_WEAK_PASSWORD: 'Password is too weak. Please choose a stronger one.',
  AUTH_SESSION_EXPIRED: 'Your session has expired. Please sign in again.',
  AUTH_UNAUTHORIZED: 'You do not have permission to perform this action.',
  AUTH_UNKNOWN_ERROR: 'Something went wrong. Please try again.',
};

export function standardizeAuthError(rawError: unknown): StandardAuthError {
  const rawMessage =
    rawError instanceof Error
      ? rawError.message
      : typeof rawError === 'string'
      ? rawError
      : 'Unknown error';

  const code = mapToErrorCode(rawMessage);

  return {
    error: {
      code,
      message: ERROR_MESSAGES[code],
    },
  };
}
