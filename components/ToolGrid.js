"use client";

import { useMemo, useState, useEffect } from "react";
import ToolCard from "@/components/ToolCard";
import { categories, categoryLabels } from "@/lib/tools-registry";

const INITIAL_COUNT = 24;
const LOAD_MORE_COUNT = 24;

export default function ToolGrid({ tools }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [visibleCount, setVisibleCount] = useState(INITIAL_COUNT);
  const [favSlugs, setFavSlugs] = useState([]);

  // Load and listen for favorites
  useEffect(() => {
    const loadFavs = () => {
      const stored = JSON.parse(localStorage.getItem("freetooly_favs") || "[]");
      setFavSlugs(stored);
    };
    loadFavs();
    window.addEventListener("favsUpdated", loadFavs);
    return () => window.removeEventListener("favsUpdated", loadFavs);
  }, []);

  // Listen for category & query change events from hero search bar & header
  useEffect(() => {
    const handleSetCategory = (e) => {
      setCategory(e.detail);
    };
    const handleSetQuery = (e) => {
      setQuery(e.detail);
    };
    window.addEventListener("setCategory", handleSetCategory);
    window.addEventListener("setQuery", handleSetQuery);
    return () => {
      window.removeEventListener("setCategory", handleSetCategory);
      window.removeEventListener("setQuery", handleSetQuery);
    };
  }, []);

  const filtered = useMemo(() => {
    return tools.filter((t) => {
      let matchesCategory = false;
      if (category === "all") {
        matchesCategory = true;
      } else if (category === "favorites") {
        matchesCategory = favSlugs.includes(t.slug);
      } else {
        matchesCategory = t.category === category;
      }

      const matchesQuery =
        query.trim() === "" ||
        t.name.toLowerCase().includes(query.toLowerCase()) ||
        t.description.toLowerCase().includes(query.toLowerCase()) ||
        t.category.toLowerCase().includes(query.toLowerCase());
      return matchesCategory && matchesQuery;
    });
  }, [tools, query, category, favSlugs]);

  useEffect(() => {
    setVisibleCount(INITIAL_COUNT);
  }, [query, category]);

  const visibleTools = filtered.slice(0, visibleCount);

  const clearSearch = () => {
    setQuery("");
    setCategory("all");
  };

  return (
    <div id="tools" className="space-y-6 sm:space-y-10">
      {/* Section Header */}
      <div className="flex flex-col items-center text-center space-y-2.5">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] sm:text-xs font-semibold bg-blue-50 dark:bg-cyan-500/10 text-blue-700 dark:text-cyan-400 border border-blue-200 dark:border-cyan-500/20">
          <span>✨ 130+ Free In-Browser Online Tools</span>
        </div>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Explore All Categories & Tools
        </h2>
      </div>

      {/* Categories Navigation Pills with ⭐ Starred Option */}
      <div className="space-y-4">
        <div id="categories" className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 px-1 max-w-5xl mx-auto">
          {/* Starred Favorites Filter Tab */}
          <button
            onClick={() => setCategory("favorites")}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              category === "favorites"
                ? "bg-amber-500 text-slate-950 shadow-lg shadow-amber-500/30 scale-105"
                : "bg-amber-50 dark:bg-amber-400/10 border border-amber-300 dark:border-amber-400/30 text-amber-900 dark:text-amber-300 hover:bg-amber-100"
            }`}
          >
            <span>⭐ Starred</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] font-extrabold bg-amber-200 dark:bg-amber-400/30 text-amber-950 dark:text-amber-200">
              {favSlugs.length}
            </span>
          </button>

          {categories.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                category === c
                  ? "bg-blue-600 dark:bg-cyan-500 text-white dark:text-slate-950 shadow-lg shadow-blue-500/25 dark:shadow-cyan-500/25 scale-105"
                  : "bg-white dark:bg-[#131d2b] border border-slate-200 dark:border-[#223247] text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-white hover:border-blue-300 dark:hover:border-cyan-500/40 hover:bg-slate-50 dark:hover:bg-[#192738]"
              }`}
            >
              {categoryLabels[c] || c}
            </button>
          ))}
        </div>
      </div>

      {/* Counter and Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs sm:text-sm text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-[#1f2e42] pb-3 sm:pb-4 px-1">
        <div>
          Showing <span className="font-bold text-slate-900 dark:text-white">{visibleTools.length}</span> of{" "}
          <span className="font-bold text-blue-600 dark:text-cyan-400">{filtered.length}</span> free tools
          {query && (
            <span className="ml-1 text-slate-400">
              (Filter: <span className="text-cyan-400 font-semibold">"{query}"</span>)
            </span>
          )}
        </div>
        {(query || category !== "all") && (
          <button onClick={clearSearch} className="text-blue-600 dark:text-cyan-400 hover:underline font-semibold cursor-pointer text-left sm:text-right">
            Clear all filters
          </button>
        )}
      </div>

      {/* Responsive Grid with illustration banners */}
      {filtered.length === 0 ? (
        <div className="bg-white dark:bg-[#121c29] border border-slate-200 dark:border-[#223247] rounded-2xl sm:rounded-3xl p-8 sm:p-16 text-center max-w-md mx-auto shadow-xl">
          <div className="text-4xl sm:text-5xl mb-3">
            {category === "favorites" ? "⭐" : "🔍"}
          </div>
          <h4 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white mb-1">
            {category === "favorites" ? "No Starred Tools Yet" : "No tools found"}
          </h4>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-4">
            {category === "favorites"
              ? "Click the ★ star button on any tool card to add it to your favorites list!"
              : "Try searching for a different keyword or explore another category."}
          </p>
          <button onClick={clearSearch} className="px-5 py-2.5 bg-blue-600 dark:bg-cyan-500 hover:bg-blue-700 dark:hover:bg-cyan-400 text-white dark:text-slate-950 font-bold rounded-xl text-xs sm:text-sm transition-all shadow-md">
            View All Tools
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8">
          {visibleTools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      )}

      {/* Load More Button */}
      {visibleCount < filtered.length && (
        <div className="text-center pt-4 sm:pt-6">
          <button
            onClick={() => setVisibleCount((prev) => prev + LOAD_MORE_COUNT)}
            className="w-full sm:w-auto px-8 py-3.5 bg-white dark:bg-[#131d2b] border border-slate-200 dark:border-[#233348] hover:border-blue-500 dark:hover:border-cyan-400 text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-cyan-400 font-bold rounded-2xl text-xs sm:text-sm shadow-md transition-all cursor-pointer hover:scale-105 active:scale-95"
          >
            Load More Tools ({filtered.length - visibleCount} remaining) ↓
          </button>
        </div>
      )}
    </div>
  );
}
