import { TestBed } from '@angular/core/testing';
import { Title, Meta } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

import { SeoService } from './seo.service';
import { provideTranslationTesting } from '../testing/translate-test-providers';

describe('SeoService', () => {
  let service: SeoService;
  let titleService: Title;
  let metaService: Meta;
  let translateService: TranslateService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SeoService,
        provideTranslationTesting(),
      ],
    });

    service = TestBed.inject(SeoService);
    titleService = TestBed.inject(Title);
    metaService = TestBed.inject(Meta);
    translateService = TestBed.inject(TranslateService);

    // Mock translate instant calls
    vi.spyOn(translateService, 'instant').mockImplementation((key: string | string[]) => {
      if (key === 'SEO.TITLE') return 'Test Title';
      if (key === 'SEO.DESCRIPTION') return 'Test Description';
      return key;
    });
  });

  afterEach(() => {
    // Clean up canonical links created in tests
    const links = document.head.querySelectorAll('link[rel="canonical"]');
    links.forEach((link) => link.remove());
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should sync document title and meta elements', () => {
    const titleSpy = vi.spyOn(titleService, 'setTitle');
    const metaSpy = vi.spyOn(metaService, 'updateTag');
    Object.defineProperty(translateService, 'currentLang', {
      value: () => 'en',
      configurable: true,
    });

    service.sync();

    expect(titleSpy).toHaveBeenCalledWith('Test Title');
    expect(metaSpy).toHaveBeenCalledWith({ property: 'og:title', content: 'Test Title' });
    expect(metaSpy).toHaveBeenCalledWith({ name: 'description', content: 'Test Description' });
    expect(metaSpy).toHaveBeenCalledWith({ property: 'og:description', content: 'Test Description' });
    expect(document.documentElement.getAttribute('lang')).toBe('en');

    const canonical = document.head.querySelector('link[rel="canonical"]');
    expect(canonical).toBeTruthy();
    expect(canonical?.getAttribute('href')).toBe('https://ihorshulha.dev/');
  });

  it('should translate ua to BCP-47 uk code for html lang', () => {
    Object.defineProperty(translateService, 'currentLang', {
      value: () => 'ua',
      configurable: true,
    });

    service.sync();

    expect(document.documentElement.getAttribute('lang')).toBe('uk');
    const canonical = document.head.querySelector('link[rel="canonical"]');
    expect(canonical?.getAttribute('href')).toBe('https://ihorshulha.dev/ua');
  });

  it('should format de canonical link correctly', () => {
    Object.defineProperty(translateService, 'currentLang', {
      value: () => 'de',
      configurable: true,
    });

    service.sync();

    expect(document.documentElement.getAttribute('lang')).toBe('de');
    const canonical = document.head.querySelector('link[rel="canonical"]');
    expect(canonical?.getAttribute('href')).toBe('https://ihorshulha.dev/de');
  });
});
