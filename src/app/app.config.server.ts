import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering } from '@angular/platform-server';
import { TranslateLoader, provideTranslateService } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import * as fs from 'fs';
import * as path from 'path';
import { appConfig } from './app.config';

// Custom loader to read translation JSON files from local filesystem on the server
export class TranslateServerLoader implements TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    try {
      const assetsFolder = path.join(process.cwd(), 'src/assets/i18n');
      const filePath = path.join(assetsFolder, `${lang}.json`);
      const content = fs.readFileSync(filePath, 'utf8');
      return of(JSON.parse(content));
    } catch (e) {
      console.error(`[SSR] Could not read translation file for lang "${lang}":`, e);
      return of({});
    }
  }
}

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(),
    // Override only the TranslateLoader token to use filesystem loading on the server
    {
      provide: TranslateLoader,
      useClass: TranslateServerLoader
    }
  ]
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
