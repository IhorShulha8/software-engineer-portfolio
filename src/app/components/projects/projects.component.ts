import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { RevealDirective } from '../../shared/animations/reveal.directive';

interface CaseStudy {
  TITLE: string;
  TAG: string;
  STACK: string[];
  ROLE: string;
  RESULT: string;
}

/**
 * Selected work: anonymised case studies with results.
 *
 * Reads from the `WORK` i18n key (BRIEF.md §6, PLAN.md §2.2). Each card shows
 * the stack, the owner's role, and a result statement. Result strings prefixed
 * with `TODO: verify` are placeholders awaiting owner confirmation before the
 * production release.
 */
@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, RevealDirective],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {
  private readonly translate = inject(TranslateService);

  private readonly langChange = toSignal(this.translate.onLangChange, {
    initialValue: null,
  });

  protected readonly title = computed(() => {
    this.langChange();
    return this.translate.instant('WORK.TITLE') as string;
  });

  protected readonly lead = computed(() => {
    this.langChange();
    return this.translate.instant('WORK.LEAD') as string;
  });

  protected readonly cases = computed<CaseStudy[]>(() => {
    this.langChange();
    const list = this.translate.instant('WORK.LIST') as CaseStudy[] | undefined;
    return Array.isArray(list) ? list : [];
  });
}
