import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/**
 * Field length limits (OWASP: enforce strict length checks on strings).
 * Single source of truth — consumed by reactive form validators (built-in
 * `Validators.minLength`/`maxLength`), the template (native HTML5
 * `maxlength`/`minlength`) and the static Netlify twin in `public/__form.html`.
 */
export const FIELD_LIMITS = {
  NAME_MIN: 2,
  NAME_MAX: 80,
  EMAIL_MAX: 254, // RFC 5321 hard limit
  MESSAGE_MIN: 20,
  MESSAGE_MAX: 2000,
} as const;

/**
 * Minimum delay (ms) between two accepted submissions. A trivial client-side
 * guard against button-mashing / scripted flood. It is NOT a server-side
 * rate limit — see PLAN notes for the server-side follow-up.
 */
export const RESUBMIT_COOLDOWN_MS = 10_000;

/**
 * Allow-list for a person's name.
 *
 * Permitted characters:
 *  - Unicode letters (\p{L}) — covers Latin, Cyrillic, accented chars.
 *  - Spaces, hyphen, apostrophe, period (for initials), and the middle-dot.
 *
 * Rejected (and thus caught before submission):
 *  - digits, `@`, URLs (`http`/`www`), control chars, newlines, emojis,
 *    angle brackets, quotes used in injection payloads.
 *
 * NOTE: a literal space is used instead of `\s` — `\s` in JS also matches
 * CR/LF/tab, which would let `name\r\ninjected` slip through.
 */
const NAME_PATTERN = /^[\p{L}][\p{L} '.\-·]{0,}$/u;

/**
 * CR, LF and the NUL byte anywhere in a value.
 *
 * Used with the email field to prevent email header injection (a value like
 * `a@b.com\r\nBcc: victim@x` must never reach a mail server).
 */
const CONTROL_CHARS = /[\r\n\u0000]/;

/**
 * Validator for the `name` field format only. Length bounds are enforced by
 * `Validators.minLength`/`maxLength` in the component (same mechanism used by
 * the `message` field), so length errors surface as the standard `minlength`/
 * `maxlength` keys. This validator therefore reports a single `nameInvalid`
 * key and stays out of the length business.
 */
export function nameFormatValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').toString().trim();
    if (value.length === 0) {
      return null; // empty is the job of Validators.required
    }
    if (!NAME_PATTERN.test(value)) {
      return { nameInvalid: { value } };
    }
    return null;
  };
}

/**
 * Validator that forbids CR/LF and the NUL byte anywhere in the value. The
 * email length cap is enforced separately by `Validators.maxLength(EMAIL_MAX)`
 * — this validator is concerned only with control characters.
 */
export function noControlCharsValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value = (control.value ?? '').toString();
    if (CONTROL_CHARS.test(value)) {
      return { controlChars: true };
    }
    return null;
  };
}
