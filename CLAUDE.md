# Ecom Logistics — Project Context for Claude

## What is this project?
Website for **Ecom Logistics**, a 3PL / FBA prep center / Amazon Freight Partner based in **Hayward, CA** (Bay Area). Serves e-commerce sellers on Amazon, TikTok Shop, and other platforms.

**Live site:** https://ecomlogisticsus.com (apex domain — `www` does NOT resolve)  
**Repo:** https://github.com/danielaestefania19/Ecom-Logistics  
**Deploy:** Railway — auto-deploys on every push to `main`

---

## Tech Stack

| Layer | Tech |
|-------|------|
| Framework | Vite + React 19 (SPA, no SSR) |
| Routing | react-router-dom v6 |
| UI Components | @heroui/react (HeroUI) |
| Styling | Tailwind CSS |
| SEO | react-helmet-async |
| i18n | Custom context (`useLanguage` + `translations.js`) — EN/ES |
| Database | Supabase (PostgreSQL) |
| Fonts | @fontsource/montserrat (self-hosted, weights 300/400/600/700) |

**Important HeroUI bug:** `<Link as={ReactRouterLink}>` renders without `href` — Google can't crawl it. Always use `<ReactRouterLink className="...">` directly for navigation links.

---

## Tailwind Custom Colors

```js
primary: '#070A0F'      // dark background
third: '#2D596D'        // teal accent
third-dark: '#21414F'   // dark teal (gradients)
```

---

## Routes (5 pages + upcoming)

| URL | Component | Description |
|-----|-----------|-------------|
| `/` | `Home.jsx` | Landing page |
| `/amazon-freight-partner-shipping` | `AmazonPartner/` | Amazon LTL/FTL freight |
| `/prep-center` | `PrepCenter/` | Amazon FBA prep center |
| `/3pl-services` | `TikTokShop/` | 3PL fulfillment (TikTok Shop) |
| `/about-us` | `AboutUs/` | About the company |
| `/pricing` | `Pricing.jsx` | Pricing with tabbed cards |
| `/blog` | *(pending build)* | Blog — EN/ES bilingual |
| `/blog/:slug` | *(pending build)* | Individual blog post |

---

## i18n System

All UI text lives in `src/landing/i18n/translations.js` under `en` and `es` keys.  
Use the hook anywhere: `const { t, language } = useLanguage();`  
Language toggle is in the Navbar — no URL change, context-based.

---

## NAP (Canonical Business Info)

Always use these exact formats across the site and schema:

- **Name:** Ecom Logistics
- **Address:** 26250 Industrial Blvd, Hayward, CA 94545
- **Phone:** +1 (341) 208-9445
- **Email:** *(confirm in Google Business Profile)*
- **Canonical URL:** https://ecomlogisticsus.com

---

## SEO Status (as of June 2025)

- **SEO score:** 92/100 across all pages (Lighthouse)
- **Canonical links:** apex domain (no www)
- **Sitemap:** /public/sitemap.xml
- **Robots.txt:** /public/robots.txt
- **Images:** All converted to WebP (50 MB savings vs original PNG/JPG)
- **Nav links:** All use `<ReactRouterLink>` with real `href` (crawlable)
- **JSON-LD / Schema.org:** Not yet implemented (next priority)
- **Open Graph:** Not yet implemented (next priority)

---

## Blog System (Supabase)

**Status:** Pending implementation  
**CMS:** Supabase — posts stored in DB, fetched at runtime (no deploy per post)  
**Languages:** Bilingual EN + ES (separate title/content/slug per language)  
**Categories:** `fba`, `3pl`, `amazon-freight`, `tiktok-shop`, `seller-problems`, `news`

### Expected Supabase table: `blog_posts`

```sql
id, slug_en, slug_es, title_en, title_es,
content_en, content_es, excerpt_en, excerpt_es,
category, cover_image_url, published, published_at, created_at
```

### Blog generation workflow
1. Open a Claude session with this repo
2. Run `/blog-writer` skill (available locally in Claude)
3. Provide: topic, language focus, target keyword
4. Claude generates full SEO post (EN + ES)
5. Claude inserts directly into Supabase via MCP
6. Post is live immediately at /blog/[slug] — no deploy needed

---

## Key Files

```
src/
├── landing/
│   ├── i18n/
│   │   ├── LanguageContext.jsx     # useLanguage hook
│   │   └── translations.js        # All UI strings EN + ES
│   ├── home/
│   │   ├── Hero.jsx               # Home hero (ImageHero.webp)
│   │   ├── Navbar.jsx             # Nav — use ReactRouterLink not HeroUI Link
│   │   └── Footer.jsx             # NAP info, copyright
│   ├── pricing/
│   │   ├── Pricing.jsx            # Tabbed cards design
│   │   └── pricingData.js         # Single source of truth for all prices
│   └── services/
│       ├── AmazonPartner/         # /amazon-freight-partner-shipping
│       ├── PrepCenter/            # /prep-center
│       └── TikTokShop/            # /3pl-services
├── assets/                        # All images now in .webp format
public/
├── robots.txt
└── sitemap.xml
```

---

## Environment Variables (Railway)

```
VITE_SUPABASE_URL=...
VITE_SUPABASE_ANON_KEY=...
```

These must be set in Railway dashboard — never commit to repo.

---

## Pending Work (Next Sessions)

- [ ] JSON-LD schema (LocalBusiness + Service + FAQPage)
- [ ] Open Graph / Twitter Cards meta tags
- [ ] Build blog infrastructure (routes, components, Supabase table)
- [ ] Google Search Console setup + sitemap submission
- [ ] Geo landing pages (FBA Prep Hayward CA, 3PL Bay Area)
