import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

/** Supported locale codes (also the URL segments under /:locale). */
export const SUPPORTED_LOCALES = ['en', 'de', 'ua'] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];
export const DEFAULT_LOCALE: Locale = 'en';

/** Locales that have their own URL segment (EN lives at the bare `/`). */
export const PREFIXED_LOCALES: readonly Locale[] = ['de', 'ua'];

export function isLocale(value: string | null | undefined): value is Locale {
  return !!value && (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/**
 * Detect a preferred locale from (in priority order):
 *  1. a stored user choice in localStorage,
 *  2. the browser language (`navigator.language`), if supported,
 *  3. the default locale (en).
 *
 * NOTE: this is used only as a UX *hint* (e.g. a language suggestion banner),
 * NOT for routing. The URL is always canonical: `/` = EN, `/de`, `/ua`.
 * Routing `/` to anything else would break the canonical contract (BRIEF §2.1).
 */
export function detectPreferredLocale(): Locale {
  if (typeof window === 'undefined') return DEFAULT_LOCALE;

  try {
    const stored = window.localStorage.getItem('lang');
    if (isLocale(stored)) return stored;
  } catch {
    // localStorage may be unavailable (private mode) — fall through.
  }

  const nav = navigator.language?.toLowerCase() ?? '';
  if (nav.startsWith('de')) return 'de';
  if (nav.startsWith('uk') || nav.startsWith('ua')) return 'ua';
  return DEFAULT_LOCALE;
}

/**
 * Resolve the locale for the activating route and apply it to TranslateService.
 *
 * - For the root route (`/`, no `:locale` param) the locale is `en` (from
 *   `route.data['locale']` or default).
 * - For `/:locale` routes the param must be a supported locale; anything else
 *   redirects to `/` (EN fallback).
 *
 * Awaits the translation load so deep links don't flash raw i18n keys.
 */
export const localeGuard: CanActivateFn = async (route) => {
  const param = route.paramMap.get('locale');
  const translate = inject(TranslateService);
  const router = inject(Router);

  // Root route: no `:locale` param → EN.
  if (!param) {
    const locale = (route.data?.['locale'] as Locale) ?? DEFAULT_LOCALE;
    await firstValueFrom(translate.use(locale));
    persistChoice(locale);
    return true;
  }

  // Prefixed route: param must be a supported locale that has its own segment.
  if (!isLocale(param) || !PREFIXED_LOCALES.includes(param)) {
    // Unknown / unsupported segment (including 'en') → fall back to canonical `/`.
    return router.parseUrl('/');
  }

  persistChoice(param);
  await firstValueFrom(translate.use(param));
  return true;
};

function persistChoice(locale: Locale): void {
  try {
    localStorage.setItem('lang', locale);
  } catch {
    // ignore — non-critical
  }
}
