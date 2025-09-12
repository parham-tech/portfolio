// src/components/ProjectCard.jsx
import React from "react";

export default function ProjectCard({
  title,
  techs = [],
  preview,
  onOpen,
  github,
  className = "",
  themeClasses = {},
  theme = "default",
}) {
  return (
    <div
      onClick={onOpen}
      role="button"
      className={`cursor-pointer p-4 rounded-lg shadow-lg transition-transform hover:scale-102 transform-gpu ${className} ${themeClasses[theme] || "bg-gray-800"}`}
    >
      <h3 className="text-white text-lg font-semibold mb-1">{title}</h3>
      <p className="text-sm text-gray-300 mb-3">{techs.join(" • ")}</p>

      <div className="h-36 rounded-md overflow-hidden bg-black/30 mb-3 flex items-center justify-center">
        {preview || <div className="text-gray-300 text-sm">Click to open demo</div>}
      </div>

      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400">Technologies</span>
        <div className="flex items-center gap-2">
          {github && (
            <a
              href={github}
              target="_blank"
              rel="noreferrer"
              className="text-xs px-2 py-1 rounded bg-indigo-600 text-white"
              onClick={(e) => e.stopPropagation()}
            >
              GitHub
            </a>
          )}
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpen?.();
            }}
            className="text-xs px-2 py-1 rounded bg-gray-700 text-white"
          >
            Open
          </button>
        </div>
      </div>
    </div>
  );
}
