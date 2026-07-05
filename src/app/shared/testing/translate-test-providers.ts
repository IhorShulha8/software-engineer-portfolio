import { EnvironmentProviders, Provider, provideZonelessChangeDetection } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideTranslateService } from '@ngx-translate/core';

/**
 * Shared providers for component specs that depend on translation.
 *
 * Registers @ngx-translate with an empty loader so tests don't fire real HTTP
 * requests, plus the HttpClient testing backend. Includes zoneless change
 * detection since the app runs without zone.js. Components that read
 * translations should inject TranslateService and call `setTranslation()` in
 * the test when specific keys are needed.
 */
export function provideTranslationTesting(): Array<Provider | EnvironmentProviders> {
  return [
    provideZonelessChangeDetection(),
    provideHttpClient(),
    provideHttpClientTesting(),
    provideTranslateService({ lang: 'en', fallbackLang: 'en' }),
  ];
}
