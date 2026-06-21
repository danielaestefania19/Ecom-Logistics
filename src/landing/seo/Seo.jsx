import { Helmet } from "react-helmet-async";
import { SITE } from "./siteData";

/**
 * Centralized SEO head manager. Owns title, meta description, canonical,
 * Open Graph, Twitter Cards and JSON-LD structured data for a page.
 *
 * Use ONE <Seo> per page. Do not also set <title>/<meta name="description">
 * or <link rel="canonical"> elsewhere on the same page.
 *
 * @param {string}  title        Full <title> for the page.
 * @param {string}  description  Meta description.
 * @param {string}  path         Route path, e.g. "/prep-center". Used for canonical + og:url.
 * @param {string}  [image]      Absolute or root-relative OG image. Defaults to SITE.ogImage.
 * @param {string}  [type]       Open Graph type. Defaults to "website".
 * @param {object|object[]} [schema] One or more JSON-LD objects to inject.
 * @param {string}  [lang]       Document language ("en" | "es"). Defaults to "en".
 * @param {{lang:string, href:string}[]} [alternates] hreflang alternates (e.g. EN/ES versions).
 */
const Seo = ({
  title,
  description,
  path = "/",
  image,
  type = "website",
  schema,
  lang = "en",
  alternates = [],
}) => {
  const url = `${SITE.baseUrl}${path}`;
  const metaDescription = description || SITE.defaultDescription;
  const ogImage = image
    ? image.startsWith("http")
      ? image
      : `${SITE.baseUrl}${image}`
    : `${SITE.baseUrl}${SITE.ogImage}`;

  const schemas = schema ? (Array.isArray(schema) ? schema : [schema]) : [];

  return (
    <Helmet>
      <html lang={lang} />
      <title>{title || SITE.defaultTitle}</title>
      <meta name="description" content={metaDescription} />
      <meta name="author" content={SITE.name} />
      <meta name="robots" content="index, follow" />
      <link rel="canonical" href={url} />

      {/* hreflang alternates (bilingual EN/ES) */}
      {alternates.map((a) => (
        <link
          key={a.lang}
          rel="alternate"
          hrefLang={a.lang}
          href={a.href}
        />
      ))}
      {alternates.length > 0 && (
        <link
          rel="alternate"
          hrefLang="x-default"
          href={
            (alternates.find((a) => a.lang === "en") || alternates[0]).href
          }
        />
      )}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE.name} />
      <meta property="og:title" content={title || SITE.defaultTitle} />
      <meta property="og:description" content={metaDescription} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content={lang === "es" ? "es_ES" : "en_US"} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title || SITE.defaultTitle} />
      <meta name="twitter:description" content={metaDescription} />
      <meta name="twitter:image" content={ogImage} />

      {/* Structured data */}
      {schemas.map((s, i) => (
        <script type="application/ld+json" key={i}>
          {JSON.stringify(s)}
        </script>
      ))}
    </Helmet>
  );
};

export default Seo;
