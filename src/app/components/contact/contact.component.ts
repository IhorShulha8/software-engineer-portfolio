import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { RevealDirective } from '../../shared/animations/reveal.directive';

type SubmitState = 'idle' | 'sending' | 'success' | 'error';

/**
 * Contact section: a short brief form (name / email / message) plus direct
 * contact links. Submissions go to Netlify Forms via AJAX POST.
 *
 * Netlify detects forms at build time by scanning static HTML. Because SSR
 * plugins can intercept the root path `/`, we have a dedicated static twin
 * in `public/form.html` (same `name` fields + `data-netlify`). This component
 * POSTs to `/form.html` so the submissions are intercepted correctly.
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

  protected readonly form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    message: ['', Validators.required],
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

  protected isInvalid(control: 'name' | 'email' | 'message'): boolean {
    const c = this.form.controls[control];
    return c.invalid && (c.dirty || c.touched);
  }

  protected submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.state.set('sending');

    // Netlify expects URL-encoded body with form-name + the field names.
    const formName = 'inquiry';
    const value = this.form.getRawValue();
    const body = new URLSearchParams({
      'form-name': formName,
      name: value.name,
      email: value.email,
      message: value.message,
      'bot-field': value['bot-field'],
    });

    fetch('/form.html', {
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
