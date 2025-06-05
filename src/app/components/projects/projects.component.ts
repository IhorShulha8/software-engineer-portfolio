import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './projects.component.html',
  styleUrls: ['./projects.component.scss']
})
export class ProjectsComponent {
  backend: any[] = [];
  fullstack: any[] = [];
  mobile: any[] = [];

  constructor(private translate: TranslateService) {
    // Викликати updateProjects як на старті, так і при зміні мови
    this.translate.onLangChange.subscribe(() => this.updateProjects());
    this.updateProjects(); // Це головне!
  }

  updateProjects() {
    this.translate.get('PROJECTS.LIST').subscribe((pr: any) => {
      this.backend = pr?.BACKEND ?? [];
      this.fullstack = pr?.FULLSTACK ?? [];
      this.mobile = pr?.MOBILE ?? [];
    });
  }
}