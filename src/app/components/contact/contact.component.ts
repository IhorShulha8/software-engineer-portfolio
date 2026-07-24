import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { RevealDirective } from '../../shared/animations/reveal.directive';
import {
  FIELD_LIMITS,
  RESUBMIT_COOLDOWN_MS,
  nameFormatValidator,
  noControlCharsValidator,
} from './validators';

type SubmitState = 'idle' | 'sending' | 'success' | 'error';
type FieldName = 'name' | 'email' | 'message';

/**
 * Contact section: a short brief form (name / email / message) plus direct
 * contact links. Submissions go to Netlify Forms via AJAX POST.
 *
 * Netlify detects forms at build time by scanning static HTML. Because SSR
 * plugins can intercept the root path `/`, we have a dedicated static twin
 * in `public/__form.html` (same `name` fields + `data-netlify`). This component
 * POSTs to `/__form.html` so the submissions are intercepted correctly.
 */
@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslatePipe, RevealDirective],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  private readonly fb = inject(FormBuilder);
  protected readonly translate = inject(TranslateService);

  protected readonly state = signal<SubmitState>('idle');

  /** Exposed limits so the template can bind native HTML5 maxlength/minlength. */
  protected readonly limits = FIELD_LIMITS;

  /** Timestamp of the last accepted submission (debounce guard). */
  private lastSubmitAt = 0;

  protected readonly form = this.fb.nonNullable.group({
    name: [
      '',
      [
        Validators.required,
        Validators.minLength(FIELD_LIMITS.NAME_MIN),
        Validators.maxLength(FIELD_LIMITS.NAME_MAX),
        nameFormatValidator(),
      ],
    ],
    email: [
      '',
      [
        Validators.required,
        Validators.email,
        Validators.maxLength(FIELD_LIMITS.EMAIL_MAX),
        noControlCharsValidator(),
      ],
    ],
    message: [
      '',
      [
        Validators.required,
        Validators.minLength(FIELD_LIMITS.MESSAGE_MIN),
        Validators.maxLength(FIELD_LIMITS.MESSAGE_MAX),
      ],
    ],
    // Honeypot: hidden from humans, bots fill it in -> submission dropped.
    'bot-field': [''],
  });

  private readonly langChange = toSignal(this.translate.onLangChange, {
    initialValue: null,
  });

  protected readonly contact = computed(() => {
    this.langChange();
    return this.translate.instant('CONTACT') as Record<string, string>;
  });

  protected isInvalid(control: FieldName): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.dirty || c.touched);
  }

  /**
   * Maps a control's validator error keys to i18n message keys, per field.
   * Key order is intentional: the most actionable cause for each field is
   * listed first so `errorKey()` surfaces it before a generic message.
   *
   * `minlength`/`maxlength` are Angular built-ins shared across fields, so
   * each field maps them to its own message.
   */
  private static readonly ERROR_MESSAGES: Record<
    FieldName,
    Array<[errorKey: string, messageKey: string]>
  > = {
    name: [
      ['required', 'FORM.REQUIRED'],
      ['minlength', 'FORM.NAME_TOO_SHORT'],
      ['maxlength', 'FORM.NAME_TOO_LONG'],
      ['nameInvalid', 'FORM.NAME_INVALID'],
    ],
    email: [
      ['required', 'FORM.REQUIRED'],
      ['email', 'FORM.EMAIL_INVALID'],
      ['maxlength', 'FORM.EMAIL_TOO_LONG'],
      ['controlChars', 'FORM.EMAIL_INVALID'],
    ],
    message: [
      ['required', 'FORM.REQUIRED'],
      ['minlength', 'FORM.MESSAGE_TOO_SHORT'],
      ['maxlength', 'FORM.MESSAGE_TOO_LONG'],
    ],
  };

  /**
   * Returns the i18n key (under `FORM.`) describing the first error on a
   * control, or `null` when the control is valid. The template pipes the key
   * through `TranslatePipe` to render the message.
   */
  protected errorKey(control: FieldName): string | null {
    const errors = this.form.controls[control].errors;
    if (!errors) {
      return null;
    }
    for (const [errorKey, messageKey] of ContactComponent.ERROR_MESSAGES[control]) {
      if (errors[errorKey]) {
        return messageKey;
      }
    }
    return 'FORM.REQUIRED';
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    // Honeypot: if the hidden field is filled, this is a bot. Pretend success
    // so the bot can't tell it was dropped, but do NOT send anything. This is
    // the second layer of honeypot defense (Netlify applies its own on submit).
    if (raw['bot-field']) {
      this.state.set('success');
      this.form.reset();
      return;
    }

    // Debounce: reject rapid re-submission to blunt trivial flood attempts.
    const now = Date.now();
    if (now - this.lastSubmitAt < RESUBMIT_COOLDOWN_MS) {
      return;
    }
    this.lastSubmitAt = now;

    this.state.set('sending');

    // Netlify expects URL-encoded body with form-name + the field names.
    const formName = 'inquiry';
    const body = new URLSearchParams({
      'form-name': formName,
      name: raw.name,
      email: raw.email,
      message: raw.message,
      'bot-field': raw['bot-field'],
    });

    fetch('/__form.html', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: body.toString(),
    })
      .then((response) => {
        if (response.ok) {
          this.state.set('success');
          this.form.reset();
        } else {
          this.state.set('error');
        }
      })
      .catch(() => {
        this.state.set('error');
      });
  }
}
