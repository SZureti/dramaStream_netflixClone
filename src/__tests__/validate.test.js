import { describe, expect, it } from 'vitest';
import { emailError, passwordError, safeNext } from '../lib/validate.js';
import { isResumable } from '../state/ProgressContext.jsx';

describe('account form checks', () => {
  it('requires a real-looking email', () => {
    expect(emailError('')).toMatch(/enter your email/i);
    expect(emailError('sam@')).toMatch(/valid email/i);
    expect(emailError(' sam@example.com ')).toBeNull();
  });

  it('requires at least 8 characters of password', () => {
    expect(passwordError('')).toMatch(/enter a password/i);
    expect(passwordError('short')).toMatch(/at least 8/i);
    expect(passwordError('long-enough')).toBeNull();
  });

  it('only follows ?next= to paths on this site', () => {
    expect(safeNext('/account')).toBe('/account');
    expect(safeNext('https://evil.example')).toBe('/');
    expect(safeNext('//evil.example')).toBe('/');
    expect(safeNext(null)).toBe('/');
  });
});

describe('Continue Watching rules', () => {
  it('resumes only between 10 seconds in and 95% through', () => {
    expect(isResumable(null)).toBe(false);
    expect(isResumable({ position: 5, duration: 6000 })).toBe(false);
    expect(isResumable({ position: 300, duration: 6000 })).toBe(true);
    expect(isResumable({ position: 5800, duration: 6000 })).toBe(false);
  });
});
