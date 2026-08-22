"use client";

import React, { useState, useEffect, useMemo } from "react";
import ToolGrid from "@/components/ToolGrid";
import { tools } from "@/lib/tools-registry";

function SearchIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
      <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="5" y1="12" x2="19" y2="12"></line>
      <polyline points="12 5 19 12 12 19"></polyline>
    </svg>
  );
}

// 4 Rotating Target Words with custom color styling
const ROTATING_WORDS = [
  {
    text: "Business",
    style: "bg-emerald-100 dark:bg-[#064e3b]/85 text-emerald-800 dark:text-emerald-300 border-emerald-400/60 dark:border-emerald-500/60 shadow-emerald-950/20 dark:shadow-emerald-950/60",
  },
  {
    text: "Your Life",
    style: "bg-rose-100 dark:bg-[#881337]/85 text-rose-800 dark:text-rose-300 border-rose-400/60 dark:border-rose-500/60 shadow-rose-950/20 dark:shadow-rose-950/60",
  },
  {
    text: "Everything",
    style: "bg-amber-100 dark:bg-[#78350f]/85 text-amber-800 dark:text-amber-300 border-amber-400/60 dark:border-amber-500/60 shadow-amber-950/20 dark:shadow-amber-950/60",
  },
  {
    text: "Education",
    style: "bg-blue-100 dark:bg-[#1e3a8a]/85 text-blue-800 dark:text-sky-300 border-blue-400/60 dark:border-sky-500/60 shadow-sky-950/20 dark:shadow-sky-950/60",
  },
];

export default function HeroSection() {
  const [searchVal, setSearchVal] = useState("");
  const [wordIndex, setWordIndex] = useState(0);

  // Exact dynamic tool counts directly from registry
  const categoryCards = useMemo(() => {
    const pdfCount = tools.filter((t) => t.category === "pdf-tools").length;
    const imageCount = tools.filter((t) => t.category === "image-tools").length;
    const writeCount = tools.filter((t) => ["editing", "text-analysis", "writing"].includes(t.category)).length;
    const fileCount = tools.filter((t) => ["word-tools", "converter"].includes(t.category)).length;

    return [
      {
        title: "PDF Tools",
        subtitle: "Solve Your PDF Problems",
        count: `${pdfCount} tools`,
        featuredName: "Merge PDF",
        categorySlug: "pdf-tools",
        gradient: "from-[#6366f1] via-[#5558e6] to-[#4338ca]",
        shadow: "shadow-indigo-900/25",
        icon: (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
          </div>
        ),
      },
      {
        title: "Image Tools",
        subtitle: "Solve Your Image Problems",
        count: `${imageCount} tools`,
        featuredName: "Crop JPG",
        categorySlug: "image-tools",
        gradient: "from-[#f97316] via-[#ea580c] to-[#c2410c]",
        shadow: "shadow-orange-900/25",
        icon: (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="3" rx="2" ry="2"/>
              <circle cx="9" cy="9" r="2"/>
              <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/>
            </svg>
          </div>
        ),
      },
      {
        title: "AI Write",
        subtitle: "Solve Your Text Problems",
        count: `${writeCount} tools`,
        featuredName: "Word Counter",
        categorySlug: "editing",
        gradient: "from-[#0284c7] via-[#0369a1] to-[#075985]",
        shadow: "shadow-sky-900/25",
        icon: (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 20h9"/>
              <path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
          </div>
        ),
      },
      {
        title: "File Tools",
        subtitle: "Solve Your File Problems",
        count: `${fileCount} tools`,
        featuredName: "JSON to CSV",
        categorySlug: "word-tools",
        gradient: "from-[#0d9488] via-[#0f766e] to-[#115e59]",
        shadow: "shadow-teal-900/25",
        icon: (
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/20 flex items-center justify-center text-white backdrop-blur-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
              <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
              <line x1="12" y1="22.08" x2="12" y2="12"/>
            </svg>
          </div>
        ),
      },
    ];
  }, []);

  // Rotate rotating words every 2.4 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2400);
    return () => clearInterval(timer);
  }, []);

  const currentWord = ROTATING_WORDS[wordIndex];

  const handleCategoryClick = (categorySlug) => {
    window.dispatchEvent(new CustomEvent("setCategory", { detail: categorySlug }));
    document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      window.dispatchEvent(new CustomEvent("setQuery", { detail: searchVal }));
    }
    document.getElementById("tools")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0d141e] text-slate-900 dark:text-white transition-colors duration-200">
      {/* -------------------------------------------------------------------- */}
      {/* TinyWow Inspired Hero Header with 3D Confetti Particles             */}
      {/* -------------------------------------------------------------------- */}
      <section className="relative overflow-hidden pt-8 sm:pt-16 pb-10 sm:pb-16 px-3.5 sm:px-6">
        {/* Floating 3D Geometric Confetti Accents */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden select-none">
          <div className="absolute top-8 left-4 sm:left-10 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-tr from-amber-400 to-orange-500 rounded-lg transform rotate-45 opacity-80 animate-float-1 shadow-md" />
          <div className="absolute top-28 left-1/4 w-3.5 h-3.5 sm:w-4 sm:h-4 bg-pink-400 rounded-sm transform rotate-12 opacity-70 animate-float-2" />
          <div className="absolute top-1/2 left-4 sm:left-8 w-0 h-0 border-l-[10px] sm:border-l-[12px] border-l-transparent border-r-[10px] sm:border-r-[12px] border-r-transparent border-b-[16px] sm:border-b-[20px] border-b-cyan-500 transform -rotate-12 opacity-80 animate-float-3" />
          <div className="absolute bottom-12 left-12 sm:left-24 w-5 h-5 sm:w-7 sm:h-7 bg-gradient-to-tr from-purple-500 to-indigo-600 rounded-md transform rotate-45 opacity-80 animate-float-1 shadow-md" />
          <div className="absolute top-10 right-6 sm:right-16 w-6 h-6 sm:w-9 sm:h-9 bg-gradient-to-tr from-pink-500 to-rose-400 rounded-lg transform -rotate-12 opacity-80 animate-float-2 shadow-md" />
          <div className="absolute top-36 right-1/4 w-3 h-3 sm:w-3.5 sm:h-3.5 bg-yellow-400 rounded-sm transform rotate-45 opacity-70 animate-float-1" />
          <div className="absolute top-3/4 right-6 sm:right-12 w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-tr from-indigo-500 to-purple-600 rounded-lg transform rotate-45 opacity-80 animate-float-3 shadow-md" />
        </div>

        <div className="relative z-10 max-w-6xl mx-auto flex flex-col items-center text-center">
          {/* Responsive Headline with 3D Rotating Flipping Word */}
          <h1 className="text-2xl sm:text-4xl md:text-6xl lg:text-7xl font-black tracking-tight text-slate-900 dark:text-white leading-[1.3] max-w-4xl flex flex-wrap items-center justify-center gap-x-1.5 sm:gap-x-3 px-1">
            <span>Free Tools to Make</span>
            <span className="relative inline-flex items-center justify-center my-0.5 sm:my-1" style={{ perspective: "1000px" }}>
              <span
                key={currentWord.text}
                className={`animate-word-flip text-xl sm:text-3xl md:text-5xl lg:text-6xl px-3 sm:px-6 py-0.5 sm:py-2 rounded-xl sm:rounded-2xl border shadow-xl ${currentWord.style} whitespace-nowrap`}
              >
                {currentWord.text}
              </span>
            </span>
            <span>Simple</span>
          </h1>

          {/* Subtitle */}
          <p className="mt-3 sm:mt-5 text-xs sm:text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl font-medium leading-relaxed px-2">
            We offer PDF, image, writing and other online tools to make your life easier
          </p>

          {/* Centered TinyWow Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-6 sm:mt-10 w-full max-w-xl relative flex items-center px-1"
          >
            <div className="w-full relative flex items-center bg-white dark:bg-[#111a27] border-2 border-slate-300 dark:border-[#233348] focus-within:border-cyan-500 rounded-full pl-3.5 sm:pl-5 pr-1.5 sm:pr-2 py-1.5 sm:py-2 shadow-xl shadow-slate-200/50 dark:shadow-black/60 transition-all">
              <SearchIcon />
              <input
                type="text"
                placeholder="Search 130+ tools..."
                value={searchVal}
                onChange={(e) => setSearchVal(e.target.value)}
                className="w-full bg-transparent text-xs sm:text-base text-slate-900 dark:text-white placeholder-slate-400 outline-none pl-2 sm:pl-3 pr-2"
              />
              <button
                type="submit"
                className="px-4 sm:px-8 py-2 sm:py-2.5 rounded-full bg-[#0284c7] hover:bg-[#0369a1] text-white font-bold text-xs sm:text-sm shadow-md shadow-cyan-600/40 transition-all hover:scale-105 active:scale-95 cursor-pointer whitespace-nowrap"
              >
                Search
              </button>
            </div>
          </form>

          {/* ---------------------------------------------------------------- */}
          {/* 4 Vibrant Hero Category Cards (Responsive: 1 col on mobile, 4 on desktop) */}
          {/* ---------------------------------------------------------------- */}
          <div className="mt-8 sm:mt-16 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {categoryCards.map((card) => (
              <div
                key={card.title}
                onClick={() => handleCategoryClick(card.categorySlug)}
                className={`group relative rounded-2xl overflow-hidden bg-gradient-to-b ${card.gradient} p-4 sm:p-5 text-left text-white shadow-xl ${card.shadow} hover:scale-105 hover:-translate-y-1 transition-all duration-200 cursor-pointer flex flex-col justify-between min-h-[160px] sm:min-h-[175px] border border-white/15`}
              >
                {/* Top Row: Icon + Exact Count Badge */}
                <div className="flex items-center justify-between mb-2 sm:mb-3">
                  {card.icon}
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] sm:text-[11px] font-bold bg-white/20 backdrop-blur-md text-white border border-white/20">
                    {card.count}
                  </span>
                </div>

                {/* Middle: Title & Subtitle + Arrow */}
                <div>
                  <div className="flex items-center justify-between">
                    <h3 className="font-heading font-extrabold text-base sm:text-lg text-white leading-tight">
                      {card.title}
                    </h3>
                    <div className="group-hover:translate-x-1 transition-transform">
                      <ArrowRight />
                    </div>
                  </div>
                  <p className="text-[11px] sm:text-xs text-white/85 font-medium mt-0.5">
                    {card.subtitle}
                  </p>
                </div>

                {/* Bottom Dark Glass Bar (Featured Tool) */}
                <div className="mt-3.5 pt-2 border-t border-white/15 flex items-center justify-between text-[10px] sm:text-[11px] bg-black/25 -mx-4 sm:-mx-5 -mb-4 sm:-mb-5 px-4 sm:px-5 py-2 backdrop-blur-xs">
                  <span className="text-white/75 font-semibold text-[10px]">Featured Tool :</span>
                  <span className="font-bold text-white text-[10px] sm:text-[11px] truncate max-w-[120px]">
                    {card.featuredName}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------------- */}
      {/* Tools Grid Section (With Illustration / Picture space preserved)    */}
      {/* -------------------------------------------------------------------- */}
      <section className="max-w-7xl mx-auto px-3.5 sm:px-6 py-8 sm:py-16">
        <ToolGrid tools={tools} />
      </section>
    </div>
  );
}
