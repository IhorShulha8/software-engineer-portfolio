import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Meta, Title } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';

const SITE_ORIGIN = 'https://ihorshulha.dev';

/**
 * Keeps the document head in sync with the active locale:
 *  - <title>
 *  - meta description (and og:description / og:title)
 *  - <html lang="..."> attribute (ISO code: en / de / uk for UA)
 *  - <link rel="canonical"> and og:url pointing at the canonical locale URL
 *
 * Canonical contract (BRIEF.md §2.1):
 *   EN → `https://ihorshulha.dev/`   (root, no `/en`)
 *   DE → `https://ihorshulha.dev/de`
 *   UA → `https://ihorshulha.dev/ua`
 *
 * The hreflang alternates in index.html are static (they list all three
 * locales at once), so they don't need updating per route.
 */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly document = inject(DOCUMENT);
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly translate = inject(TranslateService);

  /** Apply SEO metadata for the currently active language. */
  sync(): void {
    const t = this.translate.instant('SEO.TITLE') as string | undefined;
    const d = this.translate.instant('SEO.DESCRIPTION') as string | undefined;
    const lang = this.translate.currentLang() ?? 'en';

    if (t) {
      this.title.setTitle(t);
      this.meta.updateTag({ property: 'og:title', content: t });
    }
    if (d) {
      this.meta.updateTag({ name: 'description', content: d });
      this.meta.updateTag({ property: 'og:description', content: d });
    }

    // <html lang>: UA URL segment is "ua" but the BCP-47 code is "uk".
    const isoLang = lang === 'ua' ? 'uk' : lang;
    this.document.documentElement.setAttribute('lang', isoLang);

    // Canonical + og:url. EN canonical is the root `/` (no `/en`); DE/UA keep
    // their segment. All end without trailing slash inconsistency: root has
    // a trailing slash, locale URLs do not.
    const url = lang === 'en' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}/${lang}`;
    this.upsertLink('canonical', url);
    this.meta.updateTag({ property: 'og:url', content: url });

    // Structured data (per-locale, so each prerendered locale HTML carries
    // its own localized FAQ + case-study graph for AI search engines).
    this.upsertJsonLd('faq', this.buildFaqSchema(isoLang));
    this.upsertJsonLd('cases', this.buildCaseStudiesSchema());
  }

  /** Create or update a <link rel="..."> element in <head>. */
  private upsertLink(rel: string, href: string): void {
    let link = this.document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
    if (!link) {
      link = this.document.createElement('link');
      link.setAttribute('rel', rel);
      this.document.head.appendChild(link);
    }
    link.setAttribute('href', href);
  }

  /**
   * Create or replace a JSON-LD `<script>` block in `<head>`, tagged with a
   * `data-jsonld` attribute so re-runs (locale switches) replace in place
   * instead of stacking duplicates. Idempotent per `id`.
   */
  private upsertJsonLd(id: string, data: unknown): void {
    const selector = `script[type="application/ld+json"][data-jsonld="${id}"]`;
    let script = this.document.head.querySelector<HTMLScriptElement>(selector);
    if (!script) {
      script = this.document.createElement('script');
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-jsonld', id);
      this.document.head.appendChild(script);
    }
    script.textContent = JSON.stringify(data);
  }

  /** Build a schema.org FAQPage from the localized FAQ.LIST i18n entries. */
  private buildFaqSchema(inLanguage: string): unknown {
    const list = this.translate.instant('FAQ.LIST') as
      | Array<{ QUESTION: string; ANSWER: string }>
      | undefined;
    if (!Array.isArray(list) || list.length === 0) {
      return null;
    }
    return {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      inLanguage,
      mainEntity: list.map((item) => ({
        '@type': 'Question',
        name: item.QUESTION,
        acceptedAnswer: { '@type': 'Answer', text: item.ANSWER },
      })),
    };
  }

  /**
   * Build an ItemList of schema.org CreativeWork entries from the localized
   * WORK.LIST i18n entries. Each case study is anonymized (no named
   * organization) but carries its industry (TAG), stack (keywords) and the
   * result statement as description — facts AI search engines can cite.
   */
  private buildCaseStudiesSchema(): unknown {
    const cases = this.translate.instant('WORK.LIST') as
      | Array<{ TITLE: string; TAG: string; STACK: string[]; RESULT: string }>
      | undefined;
    if (!Array.isArray(cases) || cases.length === 0) {
      return null;
    }
    return {
      '@context': 'https://schema.org',
      '@type': 'ItemList',
      name: 'Selected Work',
      itemListElement: cases.map((c, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        item: {
          '@type': 'CreativeWork',
          name: c.TITLE,
          description: c.RESULT,
          about: c.TAG,
          keywords: c.STACK.join(', '),
          author: { '@id': 'https://ihorshulha.dev/#person' },
        },
      })),
    };
  }
}
