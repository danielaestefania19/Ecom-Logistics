import React, { useEffect, useState } from "react";
import Seo from "../seo/Seo";
import { useLanguage } from "../i18n/LanguageContext";
import Navbar from "../home/Navbar";
import Footer from "../home/Footer";
import BlogCard from "./BlogCard";
import { BLOG_CATEGORIES } from "./blogCategories";
import { fetchPublishedPosts } from "./blogApi";

const COPY = {
  en: {
    eyebrow: "Ecom Logistics Blog",
    title: "FBA Prep, 3PL & Amazon Logistics Insights",
    subtitle:
      "Guides, news and playbooks for Amazon, TikTok Shop and e-commerce sellers — written by an FBA prep center and 3PL in Hayward, CA.",
    all: "All",
    empty: "No posts in this category yet. Check back soon.",
    loading: "Loading posts…",
    error: "We couldn't load the blog right now. Please try again later.",
  },
  es: {
    eyebrow: "Blog de Ecom Logistics",
    title: "Guías de Preparación FBA, 3PL y Logística Amazon",
    subtitle:
      "Guías, noticias y estrategias para vendedores de Amazon, TikTok Shop y e-commerce — escritas por un prep center FBA y 3PL en Hayward, CA.",
    all: "Todos",
    empty: "Aún no hay posts en esta categoría. Vuelve pronto.",
    loading: "Cargando posts…",
    error: "No pudimos cargar el blog ahora mismo. Inténtalo más tarde.",
  },
};

const BlogPage = () => {
  const { language } = useLanguage();
  const lang = language === "es" ? "es" : "en";
  const c = COPY[lang];

  const [posts, setPosts] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    let active = true;
    setStatus("loading");
    fetchPublishedPosts()
      .then((data) => {
        if (!active) return;
        setPosts(data);
        setStatus("ready");
      })
      .catch(() => active && setStatus("error"));
    return () => {
      active = false;
    };
  }, []);

  // Only show category chips that actually have posts (plus "All").
  const usedCategories = new Set(posts.map((p) => p.category));
  const visibleCategories = BLOG_CATEGORIES.filter((cat) =>
    usedCategories.has(cat.id)
  );

  const filtered =
    activeCategory === "all"
      ? posts
      : posts.filter((p) => p.category === activeCategory);

  const description =
    lang === "es"
      ? "Blog de Ecom Logistics: guías y noticias sobre preparación Amazon FBA, fulfillment 3PL, TikTok Shop y carga a almacenes de Amazon desde Hayward, CA."
      : "Ecom Logistics blog: guides and news on Amazon FBA prep, 3PL fulfillment, TikTok Shop and freight to Amazon warehouses from Hayward, CA.";

  return (
    <>
      <Seo
        title="Blog | FBA Prep, 3PL & Amazon Logistics | Ecom Logistics"
        description={description}
        path="/blog"
        lang={lang}
      />

      <div className="bg-primary text-white">
        <Navbar />

        {/* Hero */}
        <section className="px-6 sm:px-8 py-16 sm:py-20 border-b border-white/10">
          <div className="max-w-5xl mx-auto text-center">
            <span className="inline-block text-third font-semibold tracking-widest uppercase text-sm mb-4">
              {c.eyebrow}
            </span>
            <h1 className="text-3xl sm:text-5xl font-bold leading-tight mb-5">
              {c.title}
            </h1>
            <p className="text-gray-300 text-base sm:text-lg max-w-3xl mx-auto">
              {c.subtitle}
            </p>
          </div>
        </section>

        {/* Filters + grid */}
        <section className="px-6 sm:px-8 py-12 sm:py-16">
          <div className="max-w-6xl mx-auto">
            {visibleCategories.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2.5 mb-10">
                <FilterChip
                  active={activeCategory === "all"}
                  onClick={() => setActiveCategory("all")}
                >
                  {c.all}
                </FilterChip>
                {visibleCategories.map((cat) => (
                  <FilterChip
                    key={cat.id}
                    active={activeCategory === cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                  >
                    {cat.label[lang]}
                  </FilterChip>
                ))}
              </div>
            )}

            {status === "loading" && (
              <p className="text-center text-gray-400 py-16">{c.loading}</p>
            )}
            {status === "error" && (
              <p className="text-center text-gray-400 py-16">{c.error}</p>
            )}
            {status === "ready" && filtered.length === 0 && (
              <p className="text-center text-gray-400 py-16">{c.empty}</p>
            )}

            {status === "ready" && filtered.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filtered.map((post) => (
                  <BlogCard key={post.id} post={post} lang={lang} />
                ))}
              </div>
            )}
          </div>
        </section>

        <Footer />
      </div>
    </>
  );
};

const FilterChip = ({ active, onClick, children }) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-full text-sm font-semibold transition duration-200 ${
      active
        ? "bg-third text-white shadow"
        : "bg-white/5 text-gray-300 hover:bg-white/10 hover:text-white"
    }`}
  >
    {children}
  </button>
);

export default BlogPage;
