"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { tools, getToolBySlug } from "@/lib/tools-registry";

// Favorite Helpers
export function toggleFavorite(slug) {
  if (typeof window === "undefined") return [];
  const stored = JSON.parse(localStorage.getItem("freetooly_favs") || "[]");
  let updated;
  if (stored.includes(slug)) {
    updated = stored.filter((s) => s !== slug);
  } else {
    updated = [slug, ...stored];
  }
  localStorage.setItem("freetooly_favs", JSON.stringify(updated));
  window.dispatchEvent(new Event("favsUpdated"));
  return updated;
}

export function isFavorite(slug) {
  if (typeof window === "undefined") return false;
  const stored = JSON.parse(localStorage.getItem("freetooly_favs") || "[]");
  return stored.includes(slug);
}

// Recently Viewed Helpers
export function recordRecentTool(slug) {
  if (typeof window === "undefined" || !slug) return;
  const stored = JSON.parse(localStorage.getItem("freetooly_recents") || "[]");
  const filtered = stored.filter((s) => s !== slug);
  const updated = [slug, ...filtered].slice(0, 8); // Keep last 8 viewed tools
  localStorage.setItem("freetooly_recents", JSON.stringify(updated));
  window.dispatchEvent(new Event("recentsUpdated"));
}

export default function FavoritesBar() {
  const [favSlugs, setFavSlugs] = useState([]);
  const [recentSlugs, setRecentSlugs] = useState([]);

  useEffect(() => {
    const loadData = () => {
      const storedFavs = JSON.parse(localStorage.getItem("freetooly_favs") || "[]");
      const storedRecents = JSON.parse(localStorage.getItem("freetooly_recents") || "[]");
      setFavSlugs(storedFavs);
      setRecentSlugs(storedRecents);
    };

    loadData();
    window.addEventListener("favsUpdated", loadData);
    window.addEventListener("recentsUpdated", loadData);
    return () => {
      window.removeEventListener("favsUpdated", loadData);
      window.removeEventListener("recentsUpdated", loadData);
    };
  }, []);

  const favTools = tools.filter((t) => favSlugs.includes(t.slug));
  const recentTools = recentSlugs
    .map((slug) => getToolBySlug(slug))
    .filter(Boolean);

  // If nothing is starred and nothing recently viewed, hide bar
  if (!favTools.length && !recentTools.length) return null;

  return (
    <div className="w-full max-w-full bg-slate-100/95 dark:bg-[#0f1724]/95 border-b border-slate-200/80 dark:border-[#1e2c3e] py-2 px-3 sm:px-6 backdrop-blur-md overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-2 text-xs">
        {/* Chips Area with smooth touch horizontal scroll */}
        <div className="w-full flex items-center gap-2.5 overflow-x-auto no-scrollbar py-0.5 min-w-0">
          {/* Starred Favorites Section */}
          {favTools.length > 0 && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="font-extrabold text-amber-600 dark:text-amber-400 flex items-center gap-1 text-[11px] uppercase tracking-wider pr-1">
                <span>⭐</span> Starred ({favTools.length}):
              </span>
              <div className="flex items-center gap-1.5 flex-nowrap">
                {favTools.map((tool) => (
                  <Link
                    key={`fav-${tool.slug}`}
                    href={`/tools/${tool.slug}`}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#162334] border border-amber-300 dark:border-amber-400/40 text-slate-800 dark:text-amber-200 font-semibold hover:bg-amber-50 dark:hover:bg-amber-400/15 transition-all flex items-center gap-1.5 flex-shrink-0 shadow-xs"
                  >
                    <span>{tool.icon || "🔧"}</span>
                    <span className="truncate max-w-[120px]">{tool.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Divider between Starred and Recents */}
          {favTools.length > 0 && recentTools.length > 0 && (
            <div className="w-[1px] h-4 bg-slate-300 dark:bg-[#23354c] flex-shrink-0 mx-1" />
          )}

          {/* Recently Viewed Section */}
          {recentTools.length > 0 && (
            <div className="flex items-center gap-1.5 flex-shrink-0">
              <span className="font-extrabold text-blue-600 dark:text-cyan-400 flex items-center gap-1 text-[11px] uppercase tracking-wider pr-1">
                <span>🕒</span> Recent:
              </span>
              <div className="flex items-center gap-1.5 flex-nowrap">
                {recentTools.map((tool) => (
                  <Link
                    key={`recent-${tool.slug}`}
                    href={`/tools/${tool.slug}`}
                    className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#141f2d] border border-slate-200 dark:border-[#223347] text-slate-700 dark:text-slate-200 font-semibold hover:bg-blue-50 dark:hover:bg-cyan-500/15 transition-all flex items-center gap-1.5 flex-shrink-0 shadow-xs"
                  >
                    <span>{tool.icon || "🔧"}</span>
                    <span className="truncate max-w-[120px]">{tool.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Clear Action Buttons */}
        <div className="flex items-center gap-3 flex-shrink-0 justify-end text-[10px] sm:text-[11px] pt-0.5 md:pt-0">
          {favTools.length > 0 && (
            <button
              onClick={() => {
                localStorage.setItem("freetooly_favs", "[]");
                window.dispatchEvent(new Event("favsUpdated"));
              }}
              className="text-slate-500 dark:text-slate-400 hover:text-amber-600 dark:hover:text-amber-300 hover:underline font-medium cursor-pointer"
            >
              Clear Starred
            </button>
          )}

          {recentTools.length > 0 && (
            <button
              onClick={() => {
                localStorage.setItem("freetooly_recents", "[]");
                window.dispatchEvent(new Event("recentsUpdated"));
              }}
              className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-cyan-400 hover:underline font-medium cursor-pointer"
            >
              Clear History
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
