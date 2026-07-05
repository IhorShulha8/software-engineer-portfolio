import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService } from '@ngx-translate/core';
import { toSignal } from '@angular/core/rxjs-interop';

import { RevealDirective } from '../../shared/animations/reveal.directive';

interface BuildingItem {
  TITLE: string;
  DESC: string;
  TAG: string;
}

/**
 * "Building" section: own product directions (SaaS / AI tooling / startup
 * ideas). Kept at the direction level — no concrete product names — per owner
 * request. Sits between Work and About to separate client work from what I
 * build for myself.
 *
 * Uses a warm amber accent to differentiate from the AI-section cyan and the
 * primary violet — the section reads as "founder/indie" energy.
 */
@Component({
  selector: 'app-building',
  standalone: true,
  imports: [CommonModule, RevealDirective],
  templateUrl: './building.component.html',
  styleUrl: './building.component.scss',
})
export class BuildingComponent {
  private readonly translate = inject(TranslateService);

  private readonly langChange = toSignal(this.translate.onLangChange, {
    initialValue: null,
  });

  protected readonly title = computed(() => {
    this.langChange();
    return this.translate.instant('BUILDING.TITLE') as string;
  });

  protected readonly lead = computed(() => {
    this.langChange();
    return this.translate.instant('BUILDING.LEAD') as string;
  });

  protected readonly focusLabel = computed(() => {
    this.langChange();
    return this.translate.instant('BUILDING.FOCUS_LABEL') as string;
  });

  protected readonly items = computed<BuildingItem[]>(() => {
    this.langChange();
    const list = this.translate.instant('BUILDING.ITEMS') as BuildingItem[] | undefined;
    return Array.isArray(list) ? list : [];
  });
}
