/**
 * Build-time static head injection (no headless browser).
 *
 * After `vite build`, this writes a per-route copy of dist/index.html with a
 * fully-populated <head> (title, description, canonical, Open Graph, Twitter,
 * JSON-LD) so non-JS crawlers and social scrapers see correct metadata for
 * each route. Tags are marked data-rh="true" so react-helmet-async cleanly
 * takes them over on client mount (no duplicates).
 *
 * Mirrors src/landing/seo/Seo.jsx exactly. Non-fatal: any failure logs a
 * warning and exits 0 so a metadata hiccup never breaks the deploy.
 */
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");
const dist = join(root, "dist");

async function main() {
  const {
    SITE,
    localBusinessSchema,
    buildServiceSchema,
    buildFaqSchema,
    buildBlogPostingSchema,
  } = await import("../src/landing/seo/siteData.js");
  const { translations } = await import(
    "../src/landing/i18n/translations.js"
  );
  const en = translations.en;

  const prepDescription =
    "Ecom Logistics is your Amazon FBA Prep Center in Hayward, CA. We offer expert inspection, FNSKU labeling, efficient packaging, and direct shipping to Amazon. Optimize your FBA prep!";
  const amazonDescription =
    "Streamline your LTL & FTL shipments with Ecom Logistics. As an Amazon Freight Partner in Hayward, CA, we offer efficient, cost-effective freight to Amazon FBA warehouses and beyond.";
  const tiktokDescription =
    "Streamline your e-commerce with Ecom Logistics' 3PL services in Hayward, CA. Expert third-party fulfillment, warehousing & pick and pack for growing brands.";
  const pricingDescription =
    "Ecom Logistics pricing: FBA prep, 3PL pick & pack, storage and freight in Hayward, CA. Transparent rates with automatic volume discounts, no monthly fees and no hidden costs.";

  const routes = [
    {
      path: "/home",
      title: "Ecom Logistics | E-commerce 3PL & FBA Prep Center in Hayward, CA",
      description: SITE.defaultDescription,
      schema: localBusinessSchema,
    },
    {
      path: "/about-us",
      title: "About Ecom Logistics | 3PL & FBA Prep Center in Hayward, CA",
      description:
        "Discover Ecom Logistics: founded by e-commerce entrepreneurs. We offer scalable 3PL, FBA prep, and LTL/FTL shipping from Hayward, CA. Your reliable partner in growth.",
      schema: localBusinessSchema,
    },
    {
      path: "/amazon-freight-partner-shipping",
      title: "Amazon Freight Partner | LTL & FTL Shipping | Ecom Logistics",
      description: amazonDescription,
      schema: [
        buildServiceSchema({
          name: "Amazon Freight Partner LTL & FTL Shipping",
          description: amazonDescription,
          path: "/amazon-freight-partner-shipping",
        }),
        buildFaqSchema(en.faq?.questions),
      ].filter(Boolean),
    },
    {
      path: "/prep-center",
      title: "Amazon FBA Prep Center | Hayward, CA & Nationwide | Ecom Logistics",
      description: prepDescription,
      schema: [
        buildServiceSchema({
          name: "Amazon FBA Prep Center",
          description: prepDescription,
          path: "/prep-center",
        }),
        buildFaqSchema(en.prepCenter?.faqItems),
      ].filter(Boolean),
    },
    {
      path: "/3pl-services",
      title: "Amazon 3PL & E-commerce Fulfillment | Pick & Pack | Ecom Logistics",
      description: tiktokDescription,
      schema: [
        buildServiceSchema({
          name: "3PL E-commerce Fulfillment Services",
          description: tiktokDescription,
          path: "/3pl-services",
        }),
        buildFaqSchema(en.faqTiktok?.questions),
      ].filter(Boolean),
    },
    {
      path: "/pricing",
      title: "FBA Prep & 3PL Pricing | Volume Discounts | Ecom Logistics",
      description: pricingDescription,
      schema: [
        buildServiceSchema({
          name: "FBA Prep & 3PL Fulfillment Pricing",
          description: pricingDescription,
          path: "/pricing",
        }),
        buildFaqSchema(en.pricingPage?.faq),
      ].filter(Boolean),
    },
    {
      path: "/blog",
      title: "Blog | FBA Prep, 3PL & Amazon Logistics | Ecom Logistics",
      description:
        "Ecom Logistics blog: guides and news on Amazon FBA prep, 3PL fulfillment, TikTok Shop and freight to Amazon warehouses from Hayward, CA.",
      schema: localBusinessSchema,
    },
  ];

  const indexPath = join(dist, "index.html");
  if (!existsSync(indexPath)) {
    console.warn(
      "[prerender-head] dist/index.html not found — skipping (build may have failed)."
    );
    return;
  }
  const baseHtml = await readFile(indexPath, "utf8");

  const esc = (s) =>
    String(s)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");

  const buildHead = ({
    path,
    title,
    description,
    schema,
    type = "website",
    image,
    locale = "en_US",
    alternates = [],
  }) => {
    const url = `${SITE.baseUrl}${path}`;
    const metaDescription = description || SITE.defaultDescription;
    const ogImage = image
      ? image.startsWith("http")
        ? image
        : `${SITE.baseUrl}${image}`
      : `${SITE.baseUrl}${SITE.ogImage}`;
    const pageTitle = title || SITE.defaultTitle;
    const schemas = schema ? (Array.isArray(schema) ? schema : [schema]) : [];

    const altTags = alternates.map(
      (a) =>
        `<link data-rh="true" rel="alternate" hreflang="${esc(
          a.lang
        )}" href="${esc(a.href)}">`
    );
    if (alternates.length > 0) {
      const xDefault =
        alternates.find((a) => a.lang === "en") || alternates[0];
      altTags.push(
        `<link data-rh="true" rel="alternate" hreflang="x-default" href="${esc(
          xDefault.href
        )}">`
      );
    }

    const tags = [
      `<title data-rh="true">${esc(pageTitle)}</title>`,
      `<meta data-rh="true" name="description" content="${esc(metaDescription)}">`,
      `<link data-rh="true" rel="canonical" href="${esc(url)}">`,
      ...altTags,
      `<meta data-rh="true" property="og:type" content="${esc(type)}">`,
      `<meta data-rh="true" property="og:site_name" content="${esc(SITE.name)}">`,
      `<meta data-rh="true" property="og:title" content="${esc(pageTitle)}">`,
      `<meta data-rh="true" property="og:description" content="${esc(metaDescription)}">`,
      `<meta data-rh="true" property="og:url" content="${esc(url)}">`,
      `<meta data-rh="true" property="og:image" content="${esc(ogImage)}">`,
      `<meta data-rh="true" property="og:locale" content="${esc(locale)}">`,
      `<meta data-rh="true" name="twitter:card" content="summary_large_image">`,
      `<meta data-rh="true" name="twitter:title" content="${esc(pageTitle)}">`,
      `<meta data-rh="true" name="twitter:description" content="${esc(metaDescription)}">`,
      `<meta data-rh="true" name="twitter:image" content="${esc(ogImage)}">`,
      ...schemas.map(
        (s) =>
          `<script data-rh="true" type="application/ld+json">${JSON.stringify(
            s
          )}</script>`
      ),
    ];
    return tags.join("\n    ");
  };

  const renderHtmlWithHead = (head) => {
    let html = baseHtml.replace(/\s*<title>[\s\S]*?<\/title>/i, "");
    return html.replace(/<\/head>/i, `    ${head}\n  </head>`);
  };

  const renderPage = (route) => renderHtmlWithHead(buildHead(route));

  let count = 0;
  for (const route of routes) {
    const html = renderPage(route);
    const outDir = join(dist, route.path.replace(/^\//, ""));
    await mkdir(outDir, { recursive: true });
    await writeFile(join(outDir, "index.html"), html, "utf8");
    count++;
  }

  // --- Per-post static heads (blog) ---------------------------------------
  // Fetch published posts from Supabase at build time and write a static
  // dist/blog/<slug>/index.html per language, each with a post-specific head
  // (title, description, canonical, OG/Twitter, hreflang EN↔ES, BlogPosting
  // JSON-LD). `serve` serves these files directly; the serve.json rewrite only
  // covers posts published AFTER the last build (react-helmet fixes those
  // client-side). Fully non-fatal: a Supabase hiccup never breaks the deploy.
  let postCount = 0;
  const diag = {
    ranAt: new Date().toISOString(),
    hasSupabaseUrl: Boolean(process.env.VITE_SUPABASE_URL),
    hasSupabaseKey: Boolean(process.env.VITE_SUPABASE_ANON_KEY),
    fetched: null,
    slugs: [],
    error: null,
  };
  try {
    const supabaseUrl = process.env.VITE_SUPABASE_URL;
    const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !supabaseKey) {
      diag.error = "missing-env-vars";
      console.warn(
        "[prerender-head] No Supabase env vars at build time — skipping per-post heads."
      );
    } else {
      // Hit the Supabase REST API directly with global fetch. This avoids the
      // @supabase/supabase-js client (whose realtime/websocket init can return
      // an empty result inside a CI/Nixpacks build sandbox) and uses the exact
      // anon-key REST call that RLS already exposes for published posts.
      const select =
        "slug_en,slug_es,title_en,title_es,excerpt_en,excerpt_es,cover_image_url,published_at";
      const endpoint = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/blog_posts?select=${select}&published=eq.true`;
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 15000);
      let posts = [];
      try {
        const res = await fetch(endpoint, {
          headers: {
            apikey: supabaseKey,
            Authorization: `Bearer ${supabaseKey}`,
          },
          signal: controller.signal,
        });
        if (!res.ok) {
          throw new Error(
            `Supabase REST ${res.status} ${res.statusText}`
          );
        }
        posts = await res.json();
      } finally {
        clearTimeout(timer);
      }
      diag.fetched = Array.isArray(posts) ? posts.length : 0;
      console.log(
        `[prerender-head] Fetched ${
          Array.isArray(posts) ? posts.length : 0
        } published post(s) from Supabase.`
      );

      for (const post of posts ?? []) {
        const alternates = [];
        if (post.slug_en)
          alternates.push({
            lang: "en",
            href: `${SITE.baseUrl}/blog/${post.slug_en}`,
          });
        if (post.slug_es)
          alternates.push({
            lang: "es",
            href: `${SITE.baseUrl}/blog/${post.slug_es}`,
          });

        for (const lang of ["en", "es"]) {
          const slug = post[`slug_${lang}`];
          if (!slug) continue;
          const title = post[`title_${lang}`] || post.title_en;
          const excerpt =
            post[`excerpt_${lang}`] || post.excerpt_en || title;
          const head = buildHead({
            path: `/blog/${slug}`,
            title: `${title} | Ecom Logistics`,
            description: excerpt,
            type: "article",
            image: post.cover_image_url || undefined,
            locale: lang === "es" ? "es_ES" : "en_US",
            alternates,
            schema: buildBlogPostingSchema(post, lang),
          });
          const outDir = join(dist, "blog", slug);
          await mkdir(outDir, { recursive: true });
          await writeFile(join(outDir, "index.html"), renderHtmlWithHead(head), "utf8");
          diag.slugs.push(slug);
          postCount++;
        }
      }
    }
  } catch (err) {
    diag.error = err?.message || String(err);
    console.warn(
      "[prerender-head] Non-fatal: per-post heads skipped:",
      err?.message || err
    );
  }
  // Diagnostic file (curlable at /prerender-status.json) — lets us see exactly
  // what happened to per-post generation in the live build without log access.
  diag.postCount = postCount;
  try {
    await writeFile(
      join(dist, "prerender-status.json"),
      JSON.stringify(diag, null, 2),
      "utf8"
    );
  } catch {}

  // Root index.html (/) redirects client-side to /home → give it the home head.
  const homeRoute = routes.find((r) => r.path === "/home");
  await writeFile(indexPath, renderPage(homeRoute), "utf8");

  // 404.html — served by `serve` for unknown paths with a real 404 status.
  // Boots the SPA (branded NotFound renders) but tells crawlers not to index.
  let notFoundHtml = baseHtml.replace(/\s*<title>[\s\S]*?<\/title>/i, "");
  const notFoundHead = [
    `<title data-rh="true">Page Not Found | ${esc(SITE.name)}</title>`,
    `<meta name="robots" content="noindex">`,
  ].join("\n    ");
  notFoundHtml = notFoundHtml.replace(
    /<\/head>/i,
    `    ${notFoundHead}\n  </head>`
  );
  await writeFile(join(dist, "404.html"), notFoundHtml, "utf8");

  console.log(
    `[prerender-head] Injected head for ${count} routes + ${postCount} blog post pages + root index.html + 404.html.`
  );
}

main().catch((err) => {
  console.warn(
    "[prerender-head] Non-fatal: head injection skipped due to error:",
    err?.message || err
  );
  process.exitCode = 0;
});
