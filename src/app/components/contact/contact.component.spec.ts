import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ContactComponent } from './contact.component';
import { provideTranslationTesting } from '../../shared/testing/translate-test-providers';

/** Shared valid payload used across the "submit" scenarios below. */
const VALID_PAYLOAD = {
  name: 'Igor',
  email: 'test@example.com',
  message: 'A sufficiently long valid message body.',
  'bot-field': '',
} as const;

/**
 * Stub `globalThis.fetch`. `impl` may resolve to a Partial<Response>
 * (e.g. `{ ok: true }`) or reject. Cleanup is handled in afterEach.
 */
function stubFetch(impl: () => Promise<unknown> = () => Promise.resolve({ ok: true })) {
  const spy = vi.fn(impl);
  vi.stubGlobal('fetch', spy);
  return spy;
}

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

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate form and not call fetch when invalid', () => {
    const fetchSpy = stubFetch();

    component['submit']();
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  it('should not call fetch when name is invalid (email-shaped)', () => {
    const fetchSpy = stubFetch();
    component['form'].setValue({ ...VALID_PAYLOAD, name: 'test@test.com' });

    component['submit']();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(component['errorKey']('name')).toBe('FORM.NAME_INVALID');
  });

  it('should not call fetch when name is too short', () => {
    const fetchSpy = stubFetch();
    component['form'].setValue({ ...VALID_PAYLOAD, name: 'A' });

    component['submit']();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(component['errorKey']('name')).toBe('FORM.NAME_TOO_SHORT');
  });

  it('should not call fetch when email format is invalid', () => {
    const fetchSpy = stubFetch();
    component['form'].setValue({ ...VALID_PAYLOAD, email: 'not-an-email' });

    component['submit']();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(component['errorKey']('email')).toBe('FORM.EMAIL_INVALID');
  });

  it('should not call fetch when message is too short', () => {
    const fetchSpy = stubFetch();
    component['form'].setValue({ ...VALID_PAYLOAD, message: 'short' });

    component['submit']();
    expect(fetchSpy).not.toHaveBeenCalled();
    expect(component['errorKey']('message')).toBe('FORM.MESSAGE_TOO_SHORT');
  });

  it('should pretend success and NOT send when the honeypot is filled', () => {
    const fetchSpy = stubFetch();
    component['form'].setValue({ ...VALID_PAYLOAD, 'bot-field': 'i-am-a-bot' });

    component['submit']();

    expect(fetchSpy).not.toHaveBeenCalled();
    expect(component['state']()).toBe('success');
  });

  it('should call fetch with correct URL-encoded payload on valid submit', () => {
    const fetchSpy = stubFetch();
    component['form'].setValue(VALID_PAYLOAD);

    component['submit']();

    expect(fetchSpy).toHaveBeenCalledWith(
      '/__form.html',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      })
    );

    const bodyArg = (fetchSpy.mock.calls[0] as unknown as [string, { body: string }])[1].body;
    const parsedParams = new URLSearchParams(bodyArg);
    expect(parsedParams.get('form-name')).toBe('inquiry');
    expect(parsedParams.get('name')).toBe('Igor');
    expect(parsedParams.get('email')).toBe('test@example.com');
    expect(parsedParams.get('message')).toBe('A sufficiently long valid message body.');
    expect(parsedParams.get('bot-field')).toBe('');
  });

  it('should set success state and reset the form after a successful submit', async () => {
    stubFetch();
    component['form'].setValue(VALID_PAYLOAD);

    component['submit']();
    await Promise.resolve();

    expect(component['state']()).toBe('success');
    expect(component['form'].controls.name.value).toBe('');
  });

  it('should set error state when the server responds not ok', async () => {
    stubFetch(() => Promise.resolve({ ok: false, status: 500 }));
    component['form'].setValue(VALID_PAYLOAD);

    component['submit']();
    await Promise.resolve();

    expect(component['state']()).toBe('error');
  });

  it('should set error state when fetch rejects', async () => {
    stubFetch(() => Promise.reject(new Error('network')));
    component['form'].setValue(VALID_PAYLOAD);

    component['submit']();
    // A rejected fetch promise needs an extra microtask flush to reach .catch.
    await Promise.resolve();
    await Promise.resolve();

    expect(component['state']()).toBe('error');
  });

  it('should debounce a second submission within the cooldown window', () => {
    const fetchSpy = stubFetch();
    component['form'].setValue(VALID_PAYLOAD);

    component['submit'](); // first — accepted
    expect(fetchSpy).toHaveBeenCalledTimes(1);

    component['form'].setValue(VALID_PAYLOAD);
    component['submit'](); // second — within cooldown, dropped
    expect(fetchSpy).toHaveBeenCalledTimes(1);
  });
});
