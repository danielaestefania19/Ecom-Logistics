import React from "react";
import PropTypes from "prop-types";
import { Link as ReactRouterLink } from "react-router-dom";
import { categoryLabel } from "./blogCategories";
import { localized, postSlug } from "./blogApi";

// Reusable card for the blog listing grid. Mirrors the visual language used in
// Pricing.jsx (rounded-2xl cards, teal accents) but on the site's dark theme.
const BlogCard = ({ post, lang }) => {
  const title = localized(post, "title", lang);
  const excerpt = localized(post, "excerpt", lang);
  const slug = postSlug(post, lang);
  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString(
        lang === "es" ? "es-ES" : "en-US",
        { year: "numeric", month: "short", day: "numeric" }
      )
    : "";

  return (
    <ReactRouterLink
      to={`/blog/${slug}`}
      className="group flex flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition duration-300 hover:border-third/50 hover:bg-white/[0.06]"
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-third-dark/30">
        {post.cover_image_url ? (
          <img
            src={post.cover_image_url}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-third to-third-dark">
            <span className="text-2xl font-bold text-white/90">
              Ecom Logistics
            </span>
          </div>
        )}
        <span className="absolute left-3 top-3 rounded-full bg-primary/80 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-third backdrop-blur">
          {categoryLabel(post.category, lang)}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {date && (
          <p className="mb-2 text-xs font-medium text-gray-400">{date}</p>
        )}
        <h3 className="mb-2 text-lg font-bold leading-snug text-white transition-colors group-hover:text-third">
          {title}
        </h3>
        {excerpt && (
          <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-gray-300">
            {excerpt}
          </p>
        )}
        <span className="mt-auto inline-flex items-center gap-1 text-sm font-semibold text-third">
          {lang === "es" ? "Leer más" : "Read more"}
          <svg
            className="h-4 w-4 transition-transform group-hover:translate-x-1"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M5 12h14M13 5l7 7-7 7" />
          </svg>
        </span>
      </div>
    </ReactRouterLink>
  );
};

BlogCard.propTypes = {
  post: PropTypes.object.isRequired,
  lang: PropTypes.oneOf(["en", "es"]).isRequired,
};

export default BlogCard;
