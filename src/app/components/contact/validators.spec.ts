import { FormControl } from '@angular/forms';

import { nameFormatValidator, noControlCharsValidator } from './validators';

describe('contact form validators', () => {
  describe('nameFormatValidator', () => {
    const control = () => new FormControl('', nameFormatValidator());

    // NOTE: length bounds are enforced by `Validators.minLength`/`maxLength`
    // in the component and tested there — this validator is format-only.

    it('accepts an empty value (required-ness is handled separately)', () => {
      const c = control();
      c.setValue('');
      expect(c.valid).toBe(true);
    });

    it.each([
      'Hans Müller',
      'Олег Іваненко',
      "O'Brien",
      'Jean-Pierre',
      'Mary Jane', // space
      'J. Doe', // period for initials
      'L·M', // middle-dot
    ])('accepts a valid name: %s', (value) => {
      const c = control();
      c.setValue(value);
      expect(c.valid).toBe(true);
    });

    it.each([
      'test@test.com', // email-shaped
      'https://example.com', // URL
      'Call me 1234', // digits
      'name\r\ninjected', // internal control chars / newline
      'Mr <script>', // angle brackets
      'Emoji 😎 User', // emoji / symbols
      'name;DROP TABLE', // SQL-ish punctuation
    ])('rejects an invalid name: %s', (value) => {
      const c = control();
      c.setValue(value);
      expect(c.valid).toBe(false);
      expect(c.errors?.['nameInvalid']).toBeDefined();
    });
  });

  describe('noControlCharsValidator', () => {
    const control = () => new FormControl('', noControlCharsValidator());

    // NOTE: length cap is enforced by `Validators.maxLength(EMAIL_MAX)` in
    // the component — this validator is control-chars-only.

    it('passes for a normal email', () => {
      const c = control();
      c.setValue('user@example.com');
      expect(c.errors).toBeNull();
    });

    it.each([
      'a@b.com\r\nBcc: victim@x',
      'a@b.com\n',
      'a@b.com\u0000',
    ])('rejects a value with control characters: %j', (value) => {
      const c = control();
      c.setValue(value);
      expect(c.errors?.['controlChars']).toBe(true);
    });
  });
});
