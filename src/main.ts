import appConfig from './app/app.config';
import { AppComponent } from './app/app.component';
import { bootstrapApplication } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

bootstrapApplication(AppComponent, appConfig)
  .then((ref) => {
    const translate = ref.injector.get(TranslateService);
    translate.setDefaultLang('en');
    translate.use('en');
  })
  .catch(err => console.error(err));