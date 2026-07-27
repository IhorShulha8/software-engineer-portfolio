#!/usr/bin/env node
/**
 * Notifies IndexNow (Bing, Yandex, Naver) that the site's URLs changed so they
 * re-crawl faster. Run manually after a deploy, e.g.:
 *
 *   node scripts/notify-indexnow.mjs
 *
 * The key 2f626bd093ac88245a82f4b351ec97b8 is published at
 * https://ihorshulha.dev/2f626bd093ac88245a82f4b351ec97b8.txt (public/...txt) —
 * IndexNow verifies ownership by fetching that file.
 *
 * Docs: https://www.indexnow.org/documentation
 */
const KEY = '2f626bd093ac88245a82f4b351ec97b8';
const HOST = 'ihorshulha.dev';
const URLS = [
  `https://${HOST}/`,
  `https://${HOST}/de`,
  `https://${HOST}/ua`,
];

const body = {
  host: HOST,
  key: KEY,
  keyLocation: `https://${HOST}/${KEY}.txt`,
  urlList: URLS,
};

const res = await fetch('https://api.indexnow.org/IndexNow', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body: JSON.stringify(body),
});

// 200 = submitted for crawling; 202 = accepted for later processing;
// 422 = validation error (check the published key file).
console.log(`IndexNow responded: ${res.status} ${res.statusText}`);
if (!res.ok && res.status !== 202) {
  const text = await res.text().catch(() => '');
  console.error(text || 'Submission failed — verify the key file is reachable.');
  process.exit(1);
}
console.log(`Notified for ${URLS.length} URLs.`);
