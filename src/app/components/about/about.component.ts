import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';

import { RevealDirective } from '../../shared/animations/reveal.directive';

@Component({
    selector: 'app-about',
    imports: [CommonModule, TranslatePipe, RevealDirective],
    templateUrl: './about.component.html',
    styleUrl: './about.component.scss'
})
export class AboutComponent {}
