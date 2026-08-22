"use client";

import { useState } from "react";
import CopyButton from "@/components/CopyButton";

export default function SnakeCamelConverter() {
  const [input, setInput] = useState("user_first_name_and_last_name");
  const [conversionType, setConversionType] = useState("snake-to-camel");

  const convert = (str, type) => {
    if (!str.trim()) return "";
    switch (type) {
      case "snake-to-camel":
        return str
          .toLowerCase()
          .replace(/_([a-z0-9])/g, (_, letter) => letter.toUpperCase());
      case "camel-to-snake":
        return str
          .replace(/([A-Z])/g, "_$1")
          .toLowerCase()
          .replace(/^_/, "");
      case "snake-to-pascal":
        return str
          .toLowerCase()
          .replace(/(^|_)([a-z0-9])/g, (_, __, letter) => letter.toUpperCase());
      case "snake-to-kebab":
        return str.toLowerCase().replace(/_/g, "-");
      default:
        return str;
    }
  };

  const output = convert(input, conversionType);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-xl font-bold text-slate-800 mb-2">Snake Case & Camel Case Converter</h2>
        <p className="text-sm text-slate-500 mb-6">
          Convert variable naming conventions between snake_case, camelCase, PascalCase, and kebab-case.
        </p>

        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {[
              { label: "snake_case → camelCase", val: "snake-to-camel" },
              { label: "camelCase → snake_case", val: "camel-to-snake" },
              { label: "snake_case → PascalCase", val: "snake-to-pascal" },
              { label: "snake_case → kebab-case", val: "snake-to-kebab" },
            ].map((mode) => (
              <button
                key={mode.val}
                onClick={() => setConversionType(mode.val)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold ${
                  conversionType === mode.val
                    ? "bg-blue-600 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 uppercase mb-1.5">Input Text / Code</label>
            <textarea
              rows={4}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Enter text to convert..."
              className="w-full p-3.5 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 font-mono"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-semibold text-slate-600 uppercase">Converted Result</label>
              {output && <CopyButton text={output} />}
            </div>
            <textarea
              readOnly
              rows={4}
              value={output}
              placeholder="Output will appear here..."
              className="w-full p-3.5 text-sm bg-slate-100 border border-slate-200 rounded-xl font-mono text-slate-800"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
