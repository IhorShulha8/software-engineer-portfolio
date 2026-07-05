import { Component } from '@angular/core';
import { AboutComponent } from './components/about/about.component';
import { SkillsComponent } from './components/skills/skills.component';
import { ProjectsComponent } from './components/projects/projects.component';
import { ContactComponent } from './components/contact/contact.component';
import { LangSwitcherComponent } from './components/lang-switcher/lang-switcher.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    LangSwitcherComponent,
    AboutComponent,
    SkillsComponent,
    ProjectsComponent,
    ContactComponent
  ],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {}