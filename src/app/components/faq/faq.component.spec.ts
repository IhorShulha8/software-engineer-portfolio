import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateService } from '@ngx-translate/core';

import { FaqComponent } from './faq.component';
import { provideTranslationTesting } from '../../shared/testing/translate-test-providers';

describe('FaqComponent', () => {
  let component: FaqComponent;
  let fixture: ComponentFixture<FaqComponent>;
  let translate: TranslateService;

  const FAQ_FIXTURE = {
    LIST: [
      { QUESTION: 'What do you do?', ANSWER: 'Backend and AI.' },
      { QUESTION: 'Where are you?', ANSWER: 'Germany.' },
    ],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqComponent],
      providers: [provideTranslationTesting()],
    }).compileComponents();

    translate = TestBed.inject(TranslateService);
    translate.setTranslation('en', { FAQ: FAQ_FIXTURE }, true);
    translate.use('en');

    fixture = TestBed.createComponent(FaqComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should expose the FAQ items from translations', () => {
    expect(component['items']()).toEqual(FAQ_FIXTURE.LIST);
  });

  it('should render a <details> accordion with the questions', () => {
    const summaries = (fixture.nativeElement as HTMLElement).querySelectorAll(
      'summary.faq__question'
    );
    expect(summaries.length).toBe(2);
    expect(summaries[0].textContent?.trim()).toBe('What do you do?');
  });

  it('should fall back to an empty list when translations are missing', () => {
    translate.setTranslation('en', { FAQ: { LIST: undefined } }, true);
    translate.use('en');
    fixture.detectChanges();
    expect(component['items']()).toEqual([]);
  });
});
