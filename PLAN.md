# План реалізації: 4 фази

> Покроковий план переписування портфоліо-сайту на основі `BRIEF.md`.
> Домен: **ihorshulha.dev** · Хостинг: **Netlify**.

---

## Прийняті рішення (контекст)

- **Стек:** Upgrade Angular 18 → **Angular 20** + новий esbuild-білдер (`@angular/build:application`) + **Signals** + **zoneless**.
- **Дизайн:** темна преміум + Violet `#A855F7` / Cyan `#22D3EE` / bg `#0B0B12`, motion (GSAP + Three.js для hero).
- **Структура:** one-pager з URL-роутами `/` (EN), `/de`, `/ua`.
- **CTA:** форма «Start a project» → Netlify Forms.
- **Контакти:** LinkedIn, Email, Impressum, **Discord** (новий), локація «Germany».

---

## Передумова: знайдені проблеми (виправляти по ходу)

| Проблема | Де | Фаза |
|---|---|---|
| Жодних design tokens, дубльовані hex-кольори | 7 SCSS-файлів | 1 |
| `karma.conf.js` + `src/test.ts` referenced, але НЕ існують → `npm test` падає | angular.json:63,66 | 1 |
| Spec-файли не надають `TranslateService` → падають | *.spec.ts | 1 |
| `avatar.jpg` referenced, файл `avatar.png` → 404 | index.html:23,30,48 | 3 |
| `CONTACT.LINKEDIN_URL` з ведучим пробілом | en.json:111 | 3 |
| Breakpoints несталі (650px vs 600px) | contact.scss:22 | 1 |
| Montserrat імпортовано, але не використовується | styles.scss:1,5 | 1 |
| Роутинг порожній, `<router-outlet>` відсутній | app.config.ts:16 | 3 |

---

## ФАЗА 0 — Міграція Angular 18 → 20

### 0.1 Оновлення core
- Створити git-гілку `feature/angular-20-upgrade`.
- `ng update @angular/core@20 @angular/cli@20` (можливо проміжний крок 18→19→20; `ng update` підкаже).
- Оновити `@angular-devkit/build-angular` → новий `@angular/build` (esbuild-білдер).

### 0.2 Перехід на esbuild-білдер
- У `angular.json`: замінити builder `@angular-devkit/build-angular:browser` → `@angular/build:application`.
- Схема: `main` → `browser`, `polyfills` з array-form, інші ключі мігруються автоматично через `ng update`.
- Перевірити `assets`/`styles`/`scripts` — синтаксис сумісний.
- **Користь:** нативний code-splitting для Three.js через dynamic `import()` — кращий за webpack.

### 0.3 Zoneless + Signals
- Додати `provideZonelessChangeDetection()` в `app.config.ts`; прибрати `zone.js` з polyfills.
- Замінити `translate.onLangChange.subscribe(...)` у projects/skills на **Signals** (`toSignal`) або `effect()`.
- Перевірити, що `@ngx-translate` коректно працює zoneless (event-driven; за потреби оновити до сумісної мажорної версії).

### 0.4 Залежності
- Оновити `@ngx-translate/core` + `@ngx-translate/http-loader` до версій, сумісних з Angular 20 (перевірити peerDeps; `legacy-peer-deps=true` лишається).
- **НЕ чіпати** `overrides` у `package.json` (critters/css-select/css-what) — перевірити, чи ще актуальні після оновлення; якщо `ng update` прибере конфлікт — залишити як є.
- Додати `gsap three @types/three`.
- TypeScript має відповідати вимогам Angular 20 (ймовірно TS 5.8+).

### 0.5 Верифікація
- `npm run build` (esbuild) — успішно.
- Дев-сервер `npm start` — працює, зміни гарячо перезавантажуються.
- Вручну: мови перемикаються, контент рендериться.

**Definition of Done (Фаза 0):** Angular 20 + esbuild + zoneless; застосунок стартує і білдиться; існуючий функціонал не зламано.

---

## ФАЗА 1 — Дизайн-система + Hero

### 1.1 Design tokens (фундамент)
- **Новий** `src/styles/_tokens.scss` — Violet `#A855F7`, Cyan `#22D3EE`, bg `#0B0B12`, surface `#13131F`, border `#1F1F2E`, text `#FAFAFF`/`#9CA3AF`; breakpoint-шкала (`$bp-sm: 600px`); timing tokens.
- **Новий** `src/styles/_mixins.scss` — `@mixin card`, `@mixin hover-lift`, `@mixin glow`, `@mixin respond-to($bp)`.
- **Рефактор `src/styles.scss`** — CSS custom properties у `:root`, `@use '_tokens'`, видалити дублікати кольорів (зараз ~10 hex у 7 файлах), стандартизувати breakpoint (зараз 650px vs 600px), видалити невикористаний Montserrat import.

### 1.2 Типографіка
- **Space Grotesk** (display/hero) + **Inter** (body) через Google Fonts з `font-display: swap`; тип-шкала токени (`--fs-hero`...`--fs-body`).
- Альтернатива `@fontsource` для самохостингу — на optimization-прохід (кращий Lighthouse).

### 1.3 Анімаційна інфраструктура
- **Новий** `src/app/shared/animations/reveal.directive.ts` — standalone-директива `appReveal` на GSAP ScrollTrigger.
- **Новий** `src/app/shared/animations/reduced-motion.ts` — util, що вимикає анімації при `prefers-reduced-motion: reduce`.
- Three.js — лише dynamic `import()` у hero (не в initial bundle; esbuild розщепить chunk).

### 1.4 Hero-секція
- **Новий компонент** `src/app/components/hero/` (ts/html/scss/spec).
- Інтерактивний фон: canvas 2D gradient-mesh / particle field як база (легкий); Three.js-варіант opt-in через dynamic import.
- Анімований вхід заголовка (GSAP timeline): імʼя → позиціонування → CTA.
- 2 CTA: «Start a project» (violet, scroll → #contact), «View work» (ghost, scroll → #work).
- Без портрета — абстрактні візуали.

### 1.5 Layout shell + навігація
- **Рефактор `AppComponent`** — липкий nav (anchor-links: Services/Work/About/Contact), мобільний бургер, перемикач мов (перенести з `lang-switcher`).
- `<router-outlet>` додається у Фазі 3.

### 1.6 Тест-інфраструктура
- Створити `src/test.ts` (Jasmine bootstrap) + `karma.conf.js` (або прибрати посилання з `angular.json`) — **зараз referenced, але фізично не існують, `npm test` падає**.
- У всіх spec: надати `TranslateModule.forRoot()` + `provideHttpClient()`, щоб компоненти з `TranslateService` не падали.

**Definition of Done (Фаза 1):** tokens у `:root`, новий Hero з інтерактивним фоном + анімованим заголовком, липкий nav, `npm run build` + `npm test` — успішно.

---

## ФАЗА 2 — Services + Кейси

### 2.1 Services-секція
- **Новий компонент** `src/app/components/services/`.
- 4 картки: **Backend** (Java/Spring + Kotlin/Go/Python), **AI Integration** (LLM/RAG/agents), **Cloud & DevOps** (AWS/Docker/Kafka), **Fullstack** (Angular).
- AI-картка: cyan-акцент + градієнт violet→cyan; SVG-іконки; hover micro-animations; scroll-reveal (`appReveal`).
- Нові ключі `SERVICES.{...}` паралельно EN/DE/UA.

### 2.2 Кейси (Work)
- **Рефактор `projects`** → curated 4-6 анонімних кейсів.
- Нова структура `i18n`: `WORK.LIST[]` з `{TITLE, STACK, ROLE, RESULT}`.
- RESULT — метрики з маркером `TODO: verify metric with owner` (виконавець пропонує, власник підтверджує).
- Основа з поточного `PROJECTS.LIST` (8 backend + 1 fullstack + 2 mobile) → вибір 4-6 з акцентом на результат.

### 2.3 About (оновити)
- Скоротити текст, локація «Germany», абстрактний візуал замість avatar.png.

### 2.4 Skills (оновити)
- Згрупувати chips: Languages / Cloud & Infra / Data / AI / Frontend & Mobile.

**Definition of Done (Фаза 2):** 4 картки послуг з AI-акцентом, 4-6 кейсів з result-метриками, оновлені About/Skills, паритет ключів EN/DE/UA.

---

## ФАЗА 3 — Форма + i18n-роути + SEO

### 3.1 Locale-роутинг (URL = джерело правди)
- **`app.routes.ts`**: `/:locale` з `LocaleGuard` (валідує ∈ {en,de,ua}) + редирект `''`→`/en`, `**`→`/en`.
- **`app.config.ts`**: `provideRouter(routes, withInMemoryScrolling({ anchorScrolling:'enabled', scrollPositionRestoration:'enabled' }))`.
- На зміну `:locale` → `translate.use(lang)` + `localStorage` (на Signals/`effect`). При старті — localStorage/`navigator.language`, але URL канонічний.
- Додати `<router-outlet>` в `AppComponent`; прибрати хардкод `translate.use('en')` з `main.ts`.

### 3.2 Contact-форма (Netlify Forms)
- **Рефактор `contact`** — Reactive Forms, 3 поля (name, email, message) + honeypot `bot-field`.
- Валідація: required + email-формат, повідомлення трьома мовами (i18n).
- **AJAX-submit** (POST на `/`, `application/x-www-form-urlencoded`) — без перезавантаження, success-стан на місці.
- **GOTCHA**: Netlify виявляє форми при білді зі **статичного HTML**. SPA рендерить клієнтськи → додати **приховану статичну форму-приманку** в `index.html` з тими ж `name`-полями, `data-netlify="true"`, `netlify-honeypot="bot-field"`.
- **Контакти:** LinkedIn, Email, Impressum, **Discord** (`TODO: надати username/invite-посилання`), «Germany».

### 3.3 SEO
- `index.html`: оновити description (services-oriented), canonical, JSON-LD Person, виправити `avatar.jpg`→актуальний OG-asset, `hreflang` тепер валідний (реальні `/`,`/de`,`/ua`).
- Динамічні `Title`/`Meta` per locale через Angular `Meta`/`Title`.
- Оновити `src/assets/sitemap.xml` (додати `/de`,`/ua`) та `robots.txt`.

### 3.4 Netlify-конфіг
- **Новий `netlify.toml`**: `[build]` command=`npm run build`, publish=`dist/software-engineer-portfolio` (перевірити новий outputPath під esbuild), Node version для Angular 20 (Node 20+).
- **SPA-redirect**: `public/_redirects` або `netlify.toml` — `/*  /index.html  200`.

### 3.5 Фінальне清理
- Виправити `LINKEDIN_URL` (видалити ведучий пробіл).
- Прибрати/заповнити порожній `EXPERIENCE_BLOCK`.
- `npm run build` без budget-error; ціль Lighthouse ≥ 90.

**Definition of Done (Фаза 3):** URL `/`,`/de`,`/ua` працюють; форма → Netlify Forms; SEO meta/hreflang/sitemap оновлені; `netlify.toml` + `_redirects` закомічені.

---

## Послідовність виконання

Фаза 0 → 1 → 2 → 3 (кожна спирається на попередню). Між фазами — `npm run build` + ручний перегляд `ng serve`.

## TODO для власника (до Фази 3)

1. **Discord username або invite-посилання** (для блоку контактів).
2. Підтвердити сформульовані метрики кейсів (Фаза 2).
