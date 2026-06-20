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
  const { SITE, localBusinessSchema, buildServiceSchema } = await import(
    "../src/landing/seo/siteData.js"
  );

  const prepDescription =
    "Ecom Logistics is your Amazon FBA Prep Center in Hayward, CA. We offer expert inspection, FNSKU labeling, efficient packaging, and direct shipping to Amazon. Optimize your FBA prep!";
  const amazonDescription =
    "Streamline your LTL & FTL shipments with Ecom Logistics. As an Amazon Freight Partner in Hayward, CA, we offer efficient, cost-effective freight to Amazon FBA warehouses and beyond.";
  const tiktokDescription =
    "Streamline your e-commerce with Ecom Logistics' 3PL services in Hayward, CA. Expert third-party fulfillment, warehousing & pick and pack for growing brands.";

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
      schema: buildServiceSchema({
        name: "Amazon Freight Partner LTL & FTL Shipping",
        description: amazonDescription,
        path: "/amazon-freight-partner-shipping",
      }),
    },
    {
      path: "/prep-center",
      title: "Amazon FBA Prep Center in Hayward, CA | Ecom Logistics",
      description: prepDescription,
      schema: buildServiceSchema({
        name: "Amazon FBA Prep Center",
        description: prepDescription,
        path: "/prep-center",
      }),
    },
    {
      path: "/3pl-services",
      title: "3PL Services | E-commerce Fulfillment & Warehousing in CA",
      description: tiktokDescription,
      schema: buildServiceSchema({
        name: "3PL E-commerce Fulfillment Services",
        description: tiktokDescription,
        path: "/3pl-services",
      }),
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

  const buildHead = ({ path, title, description, schema, type = "website" }) => {
    const url = `${SITE.baseUrl}${path}`;
    const metaDescription = description || SITE.defaultDescription;
    const ogImage = `${SITE.baseUrl}${SITE.ogImage}`;
    const pageTitle = title || SITE.defaultTitle;
    const schemas = schema ? (Array.isArray(schema) ? schema : [schema]) : [];

    const tags = [
      `<title data-rh="true">${esc(pageTitle)}</title>`,
      `<meta data-rh="true" name="description" content="${esc(metaDescription)}">`,
      `<link data-rh="true" rel="canonical" href="${esc(url)}">`,
      `<meta data-rh="true" property="og:type" content="${esc(type)}">`,
      `<meta data-rh="true" property="og:site_name" content="${esc(SITE.name)}">`,
      `<meta data-rh="true" property="og:title" content="${esc(pageTitle)}">`,
      `<meta data-rh="true" property="og:description" content="${esc(metaDescription)}">`,
      `<meta data-rh="true" property="og:url" content="${esc(url)}">`,
      `<meta data-rh="true" property="og:image" content="${esc(ogImage)}">`,
      `<meta data-rh="true" property="og:locale" content="en_US">`,
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

  const renderPage = (route) => {
    const head = buildHead(route);
    // Remove the static <title> from index.html, then inject our head block
    // right before </head>.
    let html = baseHtml.replace(/\s*<title>[\s\S]*?<\/title>/i, "");
    html = html.replace(/<\/head>/i, `    ${head}\n  </head>`);
    return html;
  };

  let count = 0;
  for (const route of routes) {
    const html = renderPage(route);
    const outDir = join(dist, route.path.replace(/^\//, ""));
    await mkdir(outDir, { recursive: true });
    await writeFile(join(outDir, "index.html"), html, "utf8");
    count++;
  }

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
    `[prerender-head] Injected head for ${count} routes + root index.html + 404.html.`
  );
}

main().catch((err) => {
  console.warn(
    "[prerender-head] Non-fatal: head injection skipped due to error:",
    err?.message || err
  );
  process.exitCode = 0;
});
