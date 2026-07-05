import {
  AfterViewInit,
  Component,
  ElementRef,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { prefersReducedMotion } from '../../shared/animations/reduced-motion';

/**
 * Hero section: animated particle background (canvas 2D) + a GSAP-driven
 * title reveal. The canvas is intentionally lightweight (2D, no WebGL) so it
 * stays within the bundle budget and works on low-end devices.
 *
 * Per BRIEF.md §7.2 no portrait is shown — the visual interest comes from the
 * animated background and typography.
 */
@Component({
  selector: 'app-hero',
  standalone: true,
  imports: [CommonModule, TranslatePipe],
  templateUrl: './hero.component.html',
  styleUrl: './hero.component.scss',
})
export class HeroComponent implements AfterViewInit, OnDestroy {
  @ViewChild('canvas', { static: true })
  private canvasRef!: ElementRef<HTMLCanvasElement>;

  private rafId = 0;
  private resizeObserver?: ResizeObserver;
  private particles: Particle[] = [];
  private animationCleanup: (() => void) | null = null;

  ngAfterViewInit(): void {
    this.initCanvas();
    this.playIntro();
  }

  ngOnDestroy(): void {
    cancelAnimationFrame(this.rafId);
    this.resizeObserver?.disconnect();
    this.animationCleanup?.();
  }

  // --- Smooth-scroll CTA handlers ----------------------------------------
  scrollTo(id: 'work' | 'contact'): void {
    const behavior = prefersReducedMotion() ? 'auto' : 'smooth';
    document.getElementById(id)?.scrollIntoView({ behavior });
  }

  // --- Canvas particle background ----------------------------------------
  private initCanvas(): void {
    const canvas = this.canvasRef.nativeElement;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reduceMotion = prefersReducedMotion();

    const resize = () => {
      const { clientWidth: w, clientHeight: h } = canvas;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.seedParticles(w, h);
    };
    resize();

    this.resizeObserver = new ResizeObserver(resize);
    this.resizeObserver.observe(canvas);

    // Static render only when reduced motion is requested.
    if (reduceMotion) {
      this.render(ctx);
      return;
    }

    const tick = () => {
      this.render(ctx);
      this.rafId = requestAnimationFrame(tick);
    };
    tick();
  }

  private seedParticles(w: number, h: number): void {
    // Density scales with area, capped for performance.
    const count = Math.min(80, Math.floor((w * h) / 16000));
    this.particles = Array.from({ length: count }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 1.6 + 0.4,
    }));
  }

  private render(ctx: CanvasRenderingContext2D): void {
    const canvas = this.canvasRef.nativeElement;
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    ctx.clearRect(0, 0, w, h);

    // Link nearby particles, tinting with the violet/cyan accent mix.
    const linkDist = 130;
    for (let i = 0; i < this.particles.length; i++) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > w) p.vx *= -1;
      if (p.y < 0 || p.y > h) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(168, 85, 247, 0.55)';
      ctx.fill();

      for (let j = i + 1; j < this.particles.length; j++) {
        const q = this.particles[j];
        const dx = p.x - q.x;
        const dy = p.y - q.y;
        const dist = Math.hypot(dx, dy);
        if (dist < linkDist) {
          const alpha = (1 - dist / linkDist) * 0.18;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(q.x, q.y);
          ctx.strokeStyle = `rgba(34, 211, 238, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
  }

  // --- GSAP intro timeline (lazy-loaded) ---------------------------------
  private async playIntro(): Promise<void> {
    const reduceMotion = prefersReducedMotion();
    if (reduceMotion) return;

    try {
      const { gsap } = await import('gsap');
      const tl = gsap.timeline({ defaults: { ease: 'power3.out' } });
      tl.from('.hero__eyebrow', { y: 20, opacity: 0, duration: 0.6 })
        .from(
          '.hero__title-line',
          { yPercent: 120, opacity: 0, duration: 0.9, stagger: 0.12 },
          '-=0.3',
        )
        .from('.hero__lead', { y: 20, opacity: 0, duration: 0.7 }, '-=0.4')
        .from(
          '.hero__cta',
          { y: 16, opacity: 0, duration: 0.5, stagger: 0.1 },
          '-=0.4',
        );

      this.animationCleanup = () => tl.kill();
    } catch {
      // GSAP unavailable — content stays visible (no opacity:0 pre-state set).
    }
  }
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
}
