import {
  Component,
  ElementRef,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';

import { prefersReducedMotion } from '../../shared/animations/reduced-motion';

/**
 * Sticky top navigation: brand mark, in-page anchor links (Work / Building /
 * About / Contact), a mobile burger menu and the language switcher.
 *
 * Language switching navigates by URL (`/de`, `/ua`, `/en`); the locale guard
 * then applies the change to TranslateService so the URL is the source of
 * truth and stays shareable.
 *
 * Accessibility: the mobile dropdown closes on Escape and on outside-click,
 * and its open state is mirrored to `aria-expanded` (see template).
 */
@Component({
  selector: 'app-nav',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './nav.component.html',
  styleUrl: './nav.component.scss',
})
export class NavComponent {
  protected readonly translate = inject(TranslateService);
  private readonly router = inject(Router);
  private readonly host = inject(ElementRef<HTMLElement>);

  protected readonly menuOpen = signal(false);
  protected readonly langs = ['en', 'de', 'ua'] as const;

  toggleMenu(): void {
    this.menuOpen.update((v) => !v);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  /** Smooth-scroll to a section by id and close the mobile menu. */
  scrollTo(id: string, event?: Event): void {
    if (event) {
      event.preventDefault();
    }
    this.closeMenu();
    // Honor prefers-reduced-motion: instant jump instead of smooth scroll.
    const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
    document.getElementById(id)?.scrollIntoView({ behavior });
  }

  /** Switch language by navigating to the locale URL segment. */
  setLang(lang: string): void {
    this.closeMenu();
    this.router.navigate([lang]);
  }

  /** Close the mobile menu on Escape for keyboard users. */
  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.menuOpen()) this.closeMenu();
  }

  /** Close the mobile menu when clicking outside the nav. */
  @HostListener('document:click', ['$event'])
  onOutsideClick(event: MouseEvent): void {
    if (!this.menuOpen()) return;
    if (!this.host.nativeElement.contains(event.target as Node)) {
      this.closeMenu();
    }
  }
}
