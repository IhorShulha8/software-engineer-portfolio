import { TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { of } from 'rxjs';

import {
  isLocale,
  detectPreferredLocale,
  localeGuard,
  DEFAULT_LOCALE,
} from './locale';
import { provideTranslationTesting } from '../testing/translate-test-providers';

describe('Locale Utilities', () => {
  describe('isLocale', () => {
    it('should validate supported locales', () => {
      expect(isLocale('en')).toBe(true);
      expect(isLocale('de')).toBe(true);
      expect(isLocale('ua')).toBe(true);
    });

    it('should reject invalid locales', () => {
      expect(isLocale('fr')).toBe(false);
      expect(isLocale('')).toBe(false);
      expect(isLocale(null)).toBe(false);
      expect(isLocale(undefined)).toBe(false);
    });
  });

  describe('detectPreferredLocale', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should fallback to DEFAULT_LOCALE when no storage or navigator exists', () => {
      expect(detectPreferredLocale()).toBe(DEFAULT_LOCALE);
    });

    it('should detect stored language preference', () => {
      localStorage.setItem('lang', 'de');
      expect(detectPreferredLocale()).toBe('de');
    });

    it('should detect navigator language prefix', () => {
      const originalLanguage = navigator.language;
      Object.defineProperty(navigator, 'language', {
        value: 'uk-UA',
        configurable: true,
      });
      expect(detectPreferredLocale()).toBe('ua');
      Object.defineProperty(navigator, 'language', {
        value: originalLanguage,
        configurable: true,
      });
    });
  });

  describe('localeGuard', () => {
    let translateService: TranslateService;
    let router: Router;

    beforeEach(() => {
      TestBed.configureTestingModule({
        providers: [
          provideTranslationTesting(),
          {
            provide: Router,
            useValue: {
              parseUrl: vi.fn().mockImplementation((url) => url),
            },
          },
        ],
      });

      translateService = TestBed.inject(TranslateService);
      router = TestBed.inject(Router);
      vi.spyOn(translateService, 'use').mockReturnValue(of({}));
    });

    it('should activate root route and set default locale', async () => {
      const routeMock: any = {
        paramMap: { get: () => null },
        data: {},
      };

      const result = await TestBed.runInInjectionContext(() =>
        localeGuard(routeMock, {} as any)
      );

      expect(result).toBe(true);
      expect(translateService.use).toHaveBeenCalledWith('en');
    });

    it('should activate supported prefixed locale', async () => {
      const routeMock: any = {
        paramMap: { get: (key: string) => (key === 'locale' ? 'de' : null) },
      };

      const result = await TestBed.runInInjectionContext(() =>
        localeGuard(routeMock, {} as any)
      );

      expect(result).toBe(true);
      expect(translateService.use).toHaveBeenCalledWith('de');
    });

    it('should redirect unsupported prefixed locale to root', async () => {
      const routeMock: any = {
        paramMap: { get: (key: string) => (key === 'locale' ? 'fr' : null) },
      };

      const result = await TestBed.runInInjectionContext(() =>
        localeGuard(routeMock, {} as any)
      );

      expect(result).toBe('/');
      expect(router.parseUrl).toHaveBeenCalledWith('/');
    });
  });
});
