import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { RevealDirective } from '../../shared/animations/reveal.directive';

interface FaqItem {
  QUESTION: string;
  ANSWER: string;
}

/**
 * FAQ section: a native `<details>`/`<summary>` accordion rendered from the
 * `FAQ.LIST` i18n key. Native disclosure elements work without JavaScript,
 * are keyboard-accessible by default, and expose their content to crawlers
 * and AI search engines in the prerendered HTML.
 */
@Component({
  selector: 'app-faq',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RevealDirective],
  templateUrl: './faq.component.html',
  styleUrl: './faq.component.scss',
})
export class FaqComponent {
  private readonly translate = inject(TranslateService);

  private readonly langChange = toSignal(this.translate.onLangChange, {
    initialValue: null,
  });

  protected readonly items = computed<FaqItem[]>(() => {
    this.langChange();
    const list = this.translate.instant('FAQ.LIST') as FaqItem[] | undefined;
    return Array.isArray(list) ? list : [];
  });
}
