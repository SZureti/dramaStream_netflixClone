// Form checks shared by the account screens.

export const MIN_PASSWORD = 8;

export function emailError(email) {
  const value = email.trim();
  if (!value) return 'Enter your email address.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Enter a valid email address, like name@example.com.';
  return null;
}

export function passwordError(password) {
  if (!password) return 'Enter a password.';
  if (password.length < MIN_PASSWORD) return `Use at least ${MIN_PASSWORD} characters.`;
  return null;
}

/** Only follow ?next= to paths on this site, never to another origin. */
export function safeNext(next) {
  return typeof next === 'string' && next.startsWith('/') && !next.startsWith('//') ? next : '/';
}
