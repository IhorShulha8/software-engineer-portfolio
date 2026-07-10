import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Router, provideRouter } from '@angular/router';

import { NavComponent } from './nav.component';
import { provideTranslationTesting } from '../../shared/testing/translate-test-providers';

describe('NavComponent', () => {
  let component: NavComponent;
  let fixture: ComponentFixture<NavComponent>;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NavComponent],
      providers: [
        provideTranslationTesting(),
        provideRouter([]),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(NavComponent);
    component = fixture.componentInstance;
    router = TestBed.inject(Router);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render language switcher buttons in the header', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const headerLangButtons = compiled.querySelectorAll('.nav__lang button');
    expect(headerLangButtons.length).toBe(3);
    expect(headerLangButtons[0].textContent?.trim()).toBe('EN');
    expect(headerLangButtons[1].textContent?.trim()).toBe('DE');
    expect(headerLangButtons[2].textContent?.trim()).toBe('UA');
  });

  it('should navigate to the correct locale when setLang is called', async () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    
    component.setLang('de');
    expect(navigateSpy).toHaveBeenCalledWith(['de']);
    expect(component['menuOpen']()).toBe(false);

    component.setLang('ua');
    expect(navigateSpy).toHaveBeenCalledWith(['ua']);
  });

  it('should toggle mobile menu open/closed state', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const burgerButton = compiled.querySelector('.nav__burger') as HTMLButtonElement;
    const mobileMenu = compiled.querySelector('.nav__mobile') as HTMLElement;

    // Default closed
    expect(component['menuOpen']()).toBe(false);
    expect(mobileMenu.classList.contains('open')).toBe(false);
    expect(burgerButton.getAttribute('aria-expanded')).toBe('false');

    // Click to open
    burgerButton.click();
    fixture.detectChanges();
    expect(component['menuOpen']()).toBe(true);
    expect(mobileMenu.classList.contains('open')).toBe(true);
    expect(burgerButton.getAttribute('aria-expanded')).toBe('true');

    // Click again to close
    burgerButton.click();
    fixture.detectChanges();
    expect(component['menuOpen']()).toBe(false);
    expect(mobileMenu.classList.contains('open')).toBe(false);
    expect(burgerButton.getAttribute('aria-expanded')).toBe('false');
  });
});
