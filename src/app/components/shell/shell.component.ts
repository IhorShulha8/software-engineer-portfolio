import { Component, inject, effect } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateService } from '@ngx-translate/core';

import { NavComponent } from '../nav/nav.component';
import { HeroComponent } from '../hero/hero.component';
import { ServicesComponent } from '../services/services.component';
import { ProjectsComponent } from '../projects/projects.component';
import { BuildingComponent } from '../building/building.component';
import { AboutComponent } from '../about/about.component';
import { SkillsComponent } from '../skills/skills.component';
import { ContactComponent } from '../contact/contact.component';
import { FooterComponent } from '../footer/footer.component';
import { SeoService } from '../../shared/seo/seo.service';

/**
 * Routed shell for a single locale (`/:locale`). Renders the full one-page
 * layout: nav + hero + services + work + about/skills + contact.
 *
 * AppComponent only hosts the <router-outlet>; the visible page lives here so
 * the locale guard runs before content mounts.
 */
@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [
    NavComponent,
    HeroComponent,
    ServicesComponent,
    ProjectsComponent,
    BuildingComponent,
    AboutComponent,
    SkillsComponent,
    ContactComponent,
    FooterComponent,
  ],
  template: `
    <app-nav />
    <app-hero />
    <main class="container">
      <app-services />
      <section id="work"><app-projects /></section>
      <app-building />
      <section id="about"><app-about /><app-skills /></section>
      <section id="contact"><app-contact /></section>
    </main>
    <app-footer />
  `,
  styleUrl: './shell.component.scss',
})
export class ShellComponent {
  private readonly translate = inject(TranslateService);
  private readonly seo = inject(SeoService);

  /** Tracks language changes so the SEO effect re-runs on locale switch. */
  private readonly langChange = toSignal(this.translate.onLangChange, {
    initialValue: null,
  });

  constructor() {
    // Re-sync <title>/meta only when the language actually changes.
    // allowSignalWrites is needed because SeoService updates Title/Meta which
    // can trigger signal-based consumers; the write is intentional and bounded.
    effect(() => {
      this.langChange();
      this.seo.sync();
    });
  }
}
