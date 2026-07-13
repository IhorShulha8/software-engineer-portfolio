import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactComponent } from './contact.component';
import { provideTranslationTesting } from '../../shared/testing/translate-test-providers';

describe('ContactComponent', () => {
  let component: ContactComponent;
  let fixture: ComponentFixture<ContactComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ContactComponent],
      providers: [provideTranslationTesting()],
    }).compileComponents();

    fixture = TestBed.createComponent(ContactComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate form and not call fetch when invalid', async () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal('fetch', fetchSpy);

    component['submit']();
    expect(fetchSpy).not.toHaveBeenCalled();

    vi.unstubAllGlobals();
  });

  it('should call fetch with correct URL-encoded payload on valid submit', async () => {
    const fetchSpy = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchSpy);

    component['form'].setValue({
      name: 'Igor',
      email: 'test@example.com',
      message: 'Tests text contact',
      'bot-field': '',
    });

    component['submit']();

    expect(fetchSpy).toHaveBeenCalledWith(
      '/__form.html',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    );

    const bodyArg = fetchSpy.mock.calls[0][1].body as string;
    const parsedParams = new URLSearchParams(bodyArg);
    expect(parsedParams.get('form-name')).toBe('inquiry');
    expect(parsedParams.get('name')).toBe('Igor');
    expect(parsedParams.get('email')).toBe('test@example.com');
    expect(parsedParams.get('message')).toBe('Tests text contact');
    expect(parsedParams.get('bot-field')).toBe('');

    vi.unstubAllGlobals();
  });
});
