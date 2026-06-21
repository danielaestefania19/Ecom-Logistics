import React, { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useParams, useNavigate, Link as ReactRouterLink } from "react-router-dom";
import Seo from "../seo/Seo";
import { SITE, buildBlogPostingSchema } from "../seo/siteData";
import { useLanguage } from "../i18n/LanguageContext";
import Navbar from "../home/Navbar";
import Footer from "../home/Footer";
import { categoryLabel } from "./blogCategories";
import { fetchPostBySlug, localized, postSlug } from "./blogApi";

// Markdown → styled elements on the dark theme. Kept readable: generous spacing,
// teal links/accents, no decorative noise.
const mdComponents = {
  h1: (p) => <h1 className="mt-10 mb-4 text-3xl font-bold text-white" {...p} />,
  h2: (p) => <h2 className="mt-10 mb-4 text-2xl font-bold text-white" {...p} />,
  h3: (p) => <h3 className="mt-8 mb-3 text-xl font-bold text-white" {...p} />,
  p: (p) => <p className="mb-5 leading-relaxed text-gray-200" {...p} />,
  ul: (p) => <ul className="mb-5 ml-5 list-disc space-y-2 text-gray-200 marker:text-third" {...p} />,
  ol: (p) => <ol className="mb-5 ml-5 list-decimal space-y-2 text-gray-200 marker:text-third" {...p} />,
  li: (p) => <li className="leading-relaxed" {...p} />,
  a: (p) => <a className="text-third underline underline-offset-2 hover:text-white" {...p} />,
  strong: (p) => <strong className="font-bold text-white" {...p} />,
  blockquote: (p) => (
    <blockquote className="my-6 border-l-4 border-third bg-white/[0.03] py-2 pl-5 pr-4 italic text-gray-300" {...p} />
  ),
  code: (p) => <code className="rounded bg-white/10 px-1.5 py-0.5 text-sm text-third" {...p} />,
  table: (p) => (
    <div className="my-6 overflow-x-auto">
      <table className="w-full border-collapse text-left text-sm text-gray-200" {...p} />
    </div>
  ),
  th: (p) => <th className="border border-white/15 bg-white/5 px-3 py-2 font-semibold text-white" {...p} />,
  td: (p) => <td className="border border-white/10 px-3 py-2" {...p} />,
  hr: () => <hr className="my-10 border-white/10" />,
};

const BlogPost = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { language, setLanguage } = useLanguage();
  const lang = language === "es" ? "es" : "en";

  const [post, setPost] = useState(null);
  const [status, setStatus] = useState("loading"); // loading | ready | notfound | error

  // Fetch the post whenever the URL slug changes. The slug may be EN or ES.
  useEffect(() => {
    let active = true;
    setStatus("loading");
    fetchPostBySlug(slug)
      .then((data) => {
        if (!active) return;
        if (!data) {
          setStatus("notfound");
          return;
        }
        setPost(data);
        setStatus("ready");
        // The slug encodes a language: if the visitor opened the Spanish slug,
        // switch the whole site to Spanish (and vice versa) for a coherent read.
        const matchedLang = data.slug_es === slug ? "es" : "en";
        if (matchedLang !== language) setLanguage(matchedLang);
      })
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  // Keep the URL in sync with the active language: toggling EN/ES swaps the slug.
  useEffect(() => {
    if (status !== "ready" || !post) return;
    const target = postSlug(post, lang);
    if (target && target !== slug) {
      navigate(`/blog/${target}`, { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lang, status]);

  const backLabel = lang === "es" ? "Volver al blog" : "Back to blog";

  return (
    <div className="bg-primary text-white min-h-screen">
      <Navbar />

      {status === "ready" && post && (
        <PostBody post={post} lang={lang} backLabel={backLabel} />
      )}

      {status === "loading" && (
        <div className="max-w-3xl mx-auto px-6 py-32 text-center text-gray-400">
          {lang === "es" ? "Cargando…" : "Loading…"}
        </div>
      )}

      {status === "notfound" && (
        <div className="max-w-3xl mx-auto px-6 py-32 text-center">
          <Seo
            title={`Post not found | ${SITE.name}`}
            description="The blog post you are looking for does not exist."
            path={`/blog/${slug}`}
            lang={lang}
          />
          <h1 className="text-2xl font-bold mb-4">
            {lang === "es" ? "Post no encontrado" : "Post not found"}
          </h1>
          <ReactRouterLink to="/blog" className="text-third font-semibold underline">
            {backLabel}
          </ReactRouterLink>
        </div>
      )}

      {status === "error" && (
        <div className="max-w-3xl mx-auto px-6 py-32 text-center text-gray-400">
          {lang === "es"
            ? "No pudimos cargar este post. Inténtalo más tarde."
            : "We couldn't load this post. Please try again later."}
        </div>
      )}

      <Footer />
    </div>
  );
};

const PostBody = ({ post, lang, backLabel }) => {
  const title = localized(post, "title", lang);
  const excerpt = localized(post, "excerpt", lang);
  const content = localized(post, "content", lang);
  const slug = postSlug(post, lang);

  // hreflang alternates: link the EN and ES versions of this same post.
  const alternates = [];
  if (post.slug_en)
    alternates.push({ lang: "en", href: `${SITE.baseUrl}/blog/${post.slug_en}` });
  if (post.slug_es)
    alternates.push({ lang: "es", href: `${SITE.baseUrl}/blog/${post.slug_es}` });

  const schema = buildBlogPostingSchema(post, lang);

  const date = post.published_at
    ? new Date(post.published_at).toLocaleDateString(
        lang === "es" ? "es-ES" : "en-US",
        { year: "numeric", month: "long", day: "numeric" }
      )
    : "";

  return (
    <article>
      <Seo
        title={title}
        description={excerpt || title}
        path={`/blog/${slug}`}
        image={post.cover_image_url}
        type="article"
        lang={lang}
        schema={schema}
        alternates={alternates}
        author={SITE.blogAuthor.name}
      />

      {/* Header */}
      <header className="px-6 sm:px-8 pt-14 pb-10 border-b border-white/10">
        <div className="max-w-3xl mx-auto">
          <ReactRouterLink
            to="/blog"
            className="inline-flex items-center gap-1 text-sm font-semibold text-third hover:text-white mb-6"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            {backLabel}
          </ReactRouterLink>

          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className="rounded-full bg-third/15 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-third">
              {categoryLabel(post.category, lang)}
            </span>
            {date && <span className="text-sm text-gray-400">{date}</span>}
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold leading-tight text-white">
            {title}
          </h1>
          {excerpt && (
            <p className="mt-4 text-lg text-gray-300 leading-relaxed">{excerpt}</p>
          )}
        </div>
      </header>

      {post.cover_image_url && (
        <div className="max-w-4xl mx-auto px-6 sm:px-8 pt-10">
          <img
            src={post.cover_image_url}
            alt={title}
            className="w-full rounded-2xl border border-white/10 object-cover"
          />
        </div>
      )}

      {/* Body */}
      <div className="px-6 sm:px-8 py-12">
        <div className="max-w-3xl mx-auto">
          <ReactMarkdown remarkPlugins={[remarkGfm]} components={mdComponents}>
            {content}
          </ReactMarkdown>
        </div>
      </div>

      {/* Author */}
      <div className="px-6 sm:px-8 pb-4">
        <div className="max-w-3xl mx-auto flex items-center gap-4 rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <img
            src={SITE.blogAuthor.photo}
            alt={SITE.blogAuthor.name}
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
            className="h-16 w-16 flex-shrink-0 rounded-full border border-white/15 object-cover"
          />
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-third">
              {lang === "es" ? "Escrito y revisado por" : "Written and reviewed by"}
            </p>
            <p className="text-lg font-bold text-white">{SITE.blogAuthor.name}</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-400">
              {lang === "es"
                ? "Sofia es experta en e-commerce y noticias del sector en Ecom Logistics. Investiga, analiza y redacta los mejores posts sobre Amazon FBA, TikTok Shop y fulfillment 3PL para nuestros lectores."
                : SITE.blogAuthor.bio}
            </p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 sm:px-8 pb-16">
        <div className="max-w-3xl mx-auto rounded-2xl bg-gradient-to-r from-third to-third-dark p-7 sm:p-9 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">
            {lang === "es"
              ? "¿Necesitas un prep center FBA en el Bay Area?"
              : "Need an FBA prep center in the Bay Area?"}
          </h2>
          <p className="text-white/90 mb-6 max-w-xl mx-auto">
            {lang === "es"
              ? "Ecom Logistics prepara, etiqueta y envía tu inventario a Amazon desde Hayward, CA. Sin cuotas mensuales, sin contratos."
              : "Ecom Logistics preps, labels and ships your inventory to Amazon from Hayward, CA. No monthly fees, no contracts."}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <ReactRouterLink
              to="/prep-center"
              className="bg-white text-primary font-semibold px-7 py-3 rounded-xl hover:bg-gray-100 transition"
            >
              {lang === "es" ? "Ver Prep Center" : "View Prep Center"}
            </ReactRouterLink>
            <a
              href={SITE.nap.phoneHref}
              className="border border-white/70 text-white font-semibold px-7 py-3 rounded-xl hover:bg-white hover:text-primary transition"
            >
              {SITE.nap.phone}
            </a>
          </div>
        </div>
      </div>
    </article>
  );
};

export default BlogPost;
