import { Routes } from '@angular/router';

import { localeGuard } from './shared/i18n/locale';
import { ShellComponent } from './components/shell/shell.component';

/**
 * Locale URL contract (BRIEF.md §2.1):
 *   `/`     → EN, rendered directly (no redirect). This is the canonical EN URL.
 *   `/de`   → German locale.
 *   `/ua`   → Ukrainian locale.
 *   `/en`   → 301 redirect to `/` (kept for shareable links, but `/` is canonical).
 *   `**`    → redirect to `/` (EN fallback).
 *
 * The previous design redirected `/` via detectInitialLocale() (localStorage /
 * navigator.language), which made `/` non-canonical. Per BRIEF, `/` is now a
 * stable EN page; language auto-detection is used only as a *hint* on first
 * visit (see NavComponent / a future banner), never to change the URL.
 */
export const routes: Routes = [
  {
    // Root = EN, rendered in place. localeGuard applies 'en' to TranslateService.
    path: '',
    component: ShellComponent,
    canActivate: [localeGuard],
    data: { locale: 'en' },
  },
  {
    // Locale-prefixed routes for DE / UA.
    path: ':locale',
    component: ShellComponent,
    canActivate: [localeGuard],
  },
  {
    // `/en` is a valid shareable link but canonical is `/` — redirect.
    path: 'en',
    pathMatch: 'full',
    redirectTo: '',
  },
  {
    // Anything else falls back to EN root.
    path: '**',
    redirectTo: '',
  },
];
