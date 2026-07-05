import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuildingComponent } from './building.component';
import { provideTranslationTesting } from '../../shared/testing/translate-test-providers';

describe('BuildingComponent', () => {
  let component: BuildingComponent;
  let fixture: ComponentFixture<BuildingComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuildingComponent],
      providers: [provideTranslationTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(BuildingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
