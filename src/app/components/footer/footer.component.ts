import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

/**
 * Site footer: brand + tagline + location, contact/Impressum links, and a
 * compact language switcher. Language switching navigates to the locale URL
 * (same pattern as the nav).
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
})
export class FooterComponent {
  protected readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  protected readonly langs = ['en', 'de', 'ua'] as const;

  private readonly langChange = toSignal(this.translate.onLangChange, {
    initialValue: null,
  });

  protected readonly footer = computed(() => {
    this.langChange();
    return this.translate.instant('FOOTER') as Record<string, string>;
  });

  protected readonly contact = computed(() => {
    this.langChange();
    return this.translate.instant('CONTACT') as Record<string, string>;
  });

  protected readonly year = new Date().getFullYear();

  setLang(lang: string): void {
    this.router.navigate([lang]);
  }
}
