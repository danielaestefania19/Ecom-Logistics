// Central source of truth for NAP (Name, Address, Phone), site URLs and
// structured-data (schema.org) used across the site for SEO / GEO.
//
// IMPORTANT: keep these values in sync with Google Business Profile.
// Any NAP change must be made HERE, never hardcoded in components.

export const SITE = {
  // Canonical domain is the apex (www does not resolve in DNS).
  baseUrl: "https://ecomlogisticsus.com",

  // Brand. We use "Ecom Logistics US" in metadata to differentiate from the
  // established Canadian 3PL (ecomlogistics.ca).
  name: "Ecom Logistics",
  legalName: "Ecom Logistics US",
  defaultTitle: "Ecom Logistics | E-commerce 3PL & FBA Prep Center in Hayward, CA",
  defaultDescription:
    "Ecom Logistics is a Hayward, CA based 3PL offering end-to-end e-commerce logistics: FBA prep, pick & pack fulfillment and Amazon LTL/FTL freight across the Bay Area and the USA.",

  // Default social share image (1200x630). Lives in /public.
  ogImage: "/og-image.jpg",

  // NAP — the ONE canonical version.
  nap: {
    phone: "+1 (341) 208-9445",
    phoneHref: "tel:+13412089445",
    email: "sales@ecomlogisticsus.com",
    streetAddress: "25509 Industrial Blvd, Suite E3",
    addressLocality: "Hayward",
    addressRegion: "CA",
    postalCode: "94545",
    addressCountry: "US",
  },

  geo: {
    latitude: 37.6357763,
    longitude: -122.1169308,
  },

  // Google Maps place (CID from the existing embed).
  mapsUrl:
    "https://www.google.com/maps?cid=3277432369041198767",

  openingHours: [
    {
      days: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "17:00",
    },
  ],

  social: {
    facebook: "https://www.facebook.com/ecomlogistics",
    instagram: "https://www.instagram.com/ecomlogistics",
    tiktok: "https://www.tiktok.com/@ecomlogistics",
  },
};

// Human-readable single-line address (for footers, contact blocks).
export const fullAddress = `${SITE.nap.streetAddress}, ${SITE.nap.addressLocality}, ${SITE.nap.addressRegion} ${SITE.nap.postalCode}`;

// schema.org PostalAddress, reused by several schema builders.
const postalAddress = {
  "@type": "PostalAddress",
  streetAddress: SITE.nap.streetAddress,
  addressLocality: SITE.nap.addressLocality,
  addressRegion: SITE.nap.addressRegion,
  postalCode: SITE.nap.postalCode,
  addressCountry: SITE.nap.addressCountry,
};

const openingHoursSpecification = SITE.openingHours.map((h) => ({
  "@type": "OpeningHoursSpecification",
  dayOfWeek: h.days,
  opens: h.opens,
  closes: h.closes,
}));

// LocalBusiness — the core entity for local/GEO SEO.
export const localBusinessSchema = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  "@id": `${SITE.baseUrl}/#organization`,
  name: SITE.name,
  legalName: SITE.legalName,
  url: SITE.baseUrl,
  image: `${SITE.baseUrl}${SITE.ogImage}`,
  logo: `${SITE.baseUrl}/Icon-ecologistic.png`,
  telephone: SITE.nap.phone,
  email: SITE.nap.email,
  priceRange: "$$",
  address: postalAddress,
  geo: {
    "@type": "GeoCoordinates",
    latitude: SITE.geo.latitude,
    longitude: SITE.geo.longitude,
  },
  hasMap: SITE.mapsUrl,
  areaServed: [
    { "@type": "City", name: "Hayward" },
    { "@type": "AdministrativeArea", name: "San Francisco Bay Area" },
    { "@type": "State", name: "California" },
    { "@type": "Country", name: "United States" },
  ],
  openingHoursSpecification,
  sameAs: [SITE.social.facebook, SITE.social.instagram, SITE.social.tiktok],
};

// Build a Service schema for a service page.
export function buildServiceSchema({ name, description, path }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name,
    description,
    serviceType: name,
    url: `${SITE.baseUrl}${path}`,
    provider: {
      "@type": "LocalBusiness",
      "@id": `${SITE.baseUrl}/#organization`,
      name: SITE.name,
    },
    areaServed: [
      { "@type": "AdministrativeArea", name: "San Francisco Bay Area" },
      { "@type": "State", name: "California" },
      { "@type": "Country", name: "United States" },
    ],
  };
}

// Build a FAQPage schema from an array of { question, answer }.
export function buildFaqSchema(faqs = []) {
  if (!faqs.length) return null;
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
}
