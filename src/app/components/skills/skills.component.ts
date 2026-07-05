import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { RevealDirective } from '../../shared/animations/reveal.directive';

interface SkillGroup {
  LABEL: string;
  ITEMS: string[];
}

/**
 * Toolkit section: skills grouped by category (Languages / Backend / Cloud /
 * AI / Frontend & Mobile). Reads from `SKILLS.GROUPS` in the i18n files.
 */
@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, TranslatePipe, RevealDirective],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
})
export class SkillsComponent {
  private readonly translate = inject(TranslateService);

  private readonly langChange = toSignal(this.translate.onLangChange, {
    initialValue: null,
  });

  protected readonly groups = computed<SkillGroup[]>(() => {
    this.langChange();
    const g = this.translate.instant('SKILLS.GROUPS') as SkillGroup[] | undefined;
    return Array.isArray(g) ? g : [];
  });
}
