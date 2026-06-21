// Single source of truth for blog categories. The `id` values must match the
// CHECK constraint on blog_posts.category in Supabase:
//   fba | 3pl | amazon-freight | tiktok-shop | seller-problems | news
export const BLOG_CATEGORIES = [
  { id: "fba", label: { en: "FBA Prep", es: "Preparación FBA" } },
  { id: "3pl", label: { en: "3PL", es: "3PL" } },
  { id: "amazon-freight", label: { en: "Amazon Freight", es: "Carga Amazon" } },
  { id: "tiktok-shop", label: { en: "TikTok Shop", es: "TikTok Shop" } },
  { id: "seller-problems", label: { en: "Seller Problems", es: "Problemas del Vendedor" } },
  { id: "news", label: { en: "News", es: "Noticias" } },
];

const CATEGORY_MAP = Object.fromEntries(BLOG_CATEGORIES.map((c) => [c.id, c]));

// Human label for a category id in the active language (falls back to the id).
export function categoryLabel(id, lang = "en") {
  return CATEGORY_MAP[id]?.label[lang] ?? id;
}
