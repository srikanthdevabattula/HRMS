import React from 'react';

/**
 * Unique HRMS Brand Logo Component
 * A modern geometric hexagonal emblem featuring an interconnected workforce node
 * Supports full logo or iconOnly mode
 */
export default function Logo({ size = 'default', showSubtitle = true, iconOnly = false }) {
  const isLarge = size === 'large';

  // Emblem icon (hexagonal shield + workforce node)
  const emblem = (
    <div
      className={`relative flex items-center justify-center rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-sky-400 text-white shadow-lg shadow-indigo-500/25 shrink-0 ${
        isLarge ? 'h-14 w-14' : 'h-10 w-10'
      }`}
    >
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={isLarge ? 'h-8 w-8' : 'h-6 w-6'}
      >
        {/* Outer hexagonal shield contour */}
        <path
          d="M24 4L40 13.2V30.8L24 40L8 30.8V13.2L24 4Z"
          stroke="white"
          strokeWidth="2.5"
          strokeLinejoin="round"
          className="opacity-40"
        />
        {/* Stylized interconnected Human/Resource symbol */}
        <circle cx="24" cy="18" r="4.5" fill="white" />
        <path
          d="M15 31C15 26.5 19 25 24 25C29 25 33 26.5 33 31"
          stroke="white"
          strokeWidth="3"
          strokeLinecap="round"
        />
        {/* Accent pulse dot */}
        <circle cx="35" cy="13" r="2" fill="#38bdf8" />
      </svg>
    </div>
  );

  // If icon-only mode requested
  if (iconOnly) {
    return emblem;
  }

  return (
    <div className="flex items-center gap-3 select-none">
      {emblem}

      {/* Brand Typography */}
      <div className="flex flex-col text-left">
        <div className="flex items-center gap-1.5">
          <span
            className={`font-black tracking-wider text-slate-900 dark:text-white uppercase ${
              isLarge ? 'text-2xl' : 'text-lg'
            }`}
          >
            HR<span className="text-indigo-600 dark:text-indigo-400">MS</span>
          </span>
          <span className="rounded bg-indigo-100 dark:bg-indigo-950 px-1.5 py-0.5 text-[10px] font-bold text-indigo-700 dark:text-indigo-300">
            PRO
          </span>
        </div>
        {showSubtitle && (
          <span className="text-[11px] font-medium tracking-tight text-slate-500 dark:text-slate-400">
            Human Resource Management System
          </span>
        )}
      </div>
    </div>
  );
}
