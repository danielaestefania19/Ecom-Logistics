import { supabase } from "../../lib/supabaseClient";

// Columns needed for the listing grid (no heavy content fields).
const LIST_COLUMNS =
  "id, slug_en, slug_es, title_en, title_es, excerpt_en, excerpt_es, category, cover_image_url, published_at";

// Fetch all published posts, newest first. Optionally filter by category id.
export async function fetchPublishedPosts({ category } = {}) {
  let query = supabase
    .from("blog_posts")
    .select(LIST_COLUMNS)
    .eq("published", true)
    .order("published_at", { ascending: false });

  if (category) query = query.eq("category", category);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

// Fetch a single published post by either its English or Spanish slug.
export async function fetchPostBySlug(slug) {
  const { data, error } = await supabase
    .from("blog_posts")
    .select("*")
    .eq("published", true)
    .or(`slug_en.eq.${slug},slug_es.eq.${slug}`)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// Helpers to read a localized field with English fallback.
export const localized = (post, base, lang) =>
  post?.[`${base}_${lang}`] || post?.[`${base}_en`] || "";

export const postSlug = (post, lang) =>
  post?.[`slug_${lang}`] || post?.slug_en;
