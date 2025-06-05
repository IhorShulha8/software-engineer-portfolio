import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateService, TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './skills.component.html',
  styleUrls: ['./skills.component.scss']
})
export class SkillsComponent {
  skills: string[] = [];

  constructor(private translate: TranslateService) {
    this.translate.onLangChange.subscribe(() => this.updateSkills());
    this.updateSkills(); // Викликаємо одразу при ініціалізації
  }

  updateSkills() {
    this.translate.get('SKILLS.LIST').subscribe((val: any) => {
      this.skills = Array.isArray(val) ? val : [];
    });
  }
}