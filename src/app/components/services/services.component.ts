import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { RevealDirective } from '../../shared/animations/reveal.directive';

interface ServiceCard {
  TITLE: string;
  DESC: string;
  STACK: string[];
}

/**
 * Services section: four offering cards (Backend / AI / Cloud / Fullstack).
 *
 * The AI card uses the cyan accent + violet→cyan gradient to visually stand out
 * (BRIEF.md §2.1, §7.1). Card keys live under `SERVICES` in the i18n files.
 */
@Component({
  selector: 'app-services',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RevealDirective],
  templateUrl: './services.component.html',
  styleUrl: './services.component.scss',
})
export class ServicesComponent {
  private readonly translate = inject(TranslateService);

  private readonly langChange = toSignal(this.translate.onLangChange, {
    initialValue: null,
  });

  /** Ordered list of service keys rendered as cards (AI kept second = spotlight). */
  protected readonly cardKeys = ['BACKEND', 'AI', 'CLOUD', 'FULLSTACK'] as const;

  /** Map key -> css modifier for per-card theming (AI differs from the rest). */
  protected readonly cardModifier: Record<string, string> = {
    BACKEND: 'backend',
    AI: 'ai',
    CLOUD: 'cloud',
    FULLSTACK: 'fullstack',
  };

  protected readonly services = computed<Record<string, ServiceCard>>(() => {
    this.langChange();
    return this.translate.instant('SERVICES') as Record<string, ServiceCard>;
  });
}
