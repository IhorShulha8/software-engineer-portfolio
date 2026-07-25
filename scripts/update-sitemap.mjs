#!/usr/bin/env node
/**
 * Updates every <lastmod>...</lastmod> in public/sitemap.xml to today's date
 * (ISO yyyy-mm-dd), in place. Run automatically via the `prebuild` npm hook so
 * each deploy ships a fresh lastmod — search engines and AI crawlers favor it.
 *
 * Pure Node (no deps) so it runs in any Node toolchain the build already uses.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SITEMAP_PATH = resolve(__dirname, '..', 'public', 'sitemap.xml');

const today = new Date().toISOString().slice(0, 10); // yyyy-mm-dd
const original = readFileSync(SITEMAP_PATH, 'utf8');
const updated = original.replace(/<lastmod>[^<]*<\/lastmod>/g, `<lastmod>${today}</lastmod>`);

if (updated === original) {
  console.log(`[sitemap] no <lastmod> entries found (date ${today}).`);
} else {
  writeFileSync(SITEMAP_PATH, updated, 'utf8');
  console.log(`[sitemap] updated <lastmod> -> ${today}.`);
}
