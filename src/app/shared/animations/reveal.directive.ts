import { AfterViewInit, Directive, ElementRef, Input, OnDestroy, inject } from '@angular/core';
import { prefersReducedMotion } from './reduced-motion';

/**
 * Scroll-reveal directive powered by GSAP ScrollTrigger.
 *
 * Usage: `<section appReveal>...</section>` — fades + slides up when scrolled
 * into view. Optional inputs let each call site customise the effect:
 *
 *   <div appReveal [revealDelay]="0.2" revealFrom="left">…</div>
 *
 * GSAP is loaded via a dynamic import so it never lands in the initial bundle
 * (kept lazy per PLAN.md §1.3). When `prefers-reduced-motion: reduce` is set,
 * the element is shown immediately with no motion.
 *
 * TODO(phase-1): consider registering ScrollTrigger once in an APP_INITIALIZER
 * if many sections use this — current per-instance register is fine for now.
 */
@Directive({
  selector: '[appReveal]',
  standalone: true,
})
export class RevealDirective implements AfterViewInit, OnDestroy {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  /** Direction the element travels from. Default: 'bottom' (slide up). */
  @Input() revealFrom: 'bottom' | 'top' | 'left' | 'right' = 'bottom';

  /** Seconds to wait before revealing (for staggering sibling elements). */
  @Input() revealDelay = 0;

  /** Travel distance in pixels. */
  @Input() revealDistance = 40;

  private cleanup: (() => void) | null = null;

  async ngAfterViewInit(): Promise<void> {
    const el = this.host.nativeElement;

    // Reduced motion: skip animation entirely, show the element.
    if (prefersReducedMotion()) {
      el.style.opacity = '1';
      return;
    }

    // Set the pre-reveal state synchronously to avoid a flash before GSAP loads.
    el.style.opacity = '0';

    try {
      const { gsap } = await import('gsap');
      const { ScrollTrigger } = await import('gsap/ScrollTrigger');
      gsap.registerPlugin(ScrollTrigger);

      const offset = this.axisOffset();

      const tween = gsap.fromTo(
        el,
        { opacity: 0, ...offset.from },
        {
          opacity: 1,
          ...offset.to,
          duration: 0.8,
          delay: this.revealDelay,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: el,
            start: 'top 85%',
            once: true,
          },
        },
      );

      this.cleanup = () => {
        tween.scrollTrigger?.kill();
        tween.kill();
      };
    } catch {
      // If GSAP fails to load, fall back to showing the element.
      el.style.opacity = '1';
    }
  }

  ngOnDestroy(): void {
    this.cleanup?.();
  }

  private axisOffset(): { from: Record<string, number>; to: Record<string, number> } {
    const d = this.revealDistance;
    switch (this.revealFrom) {
      case 'top':    return { from: { y: -d }, to: { y: 0 } };
      case 'left':   return { from: { x: -d }, to: { x: 0 } };
      case 'right':  return { from: { x: d },  to: { x: 0 } };
      case 'bottom':
      default:       return { from: { y: d },  to: { y: 0 } };
    }
  }
}
