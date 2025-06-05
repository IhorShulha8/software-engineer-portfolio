import { Component } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-lang-switcher',
  standalone: true,
  templateUrl: './lang-switcher.component.html',
  styleUrls: ['./lang-switcher.component.scss']
})
export class LangSwitcherComponent {
  constructor(public translate: TranslateService) { }

  setLang(lang: string) {
    this.translate.use(lang);
  }

  get activeLang(): string {
    return this.translate.currentLang || this.translate.defaultLang || 'en';
  }
}