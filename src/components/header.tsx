"use client";

import Link from "next/link";
import { useState } from "react";

export function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="border-b border-white/10 sticky top-0 bg-[#0a0a0b]/80 backdrop-blur-lg z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-white">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7850ff] to-[#00c8ff] flex items-center justify-center text-sm font-bold text-white transition-transform hover:scale-105">
            C
          </div>
          <span className="hidden xs:inline">Cortexia</span>
        </Link>
        <nav className="hidden sm:flex items-center gap-6">
          <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors focus-ring px-1 py-0.5 rounded">
            Accueil
          </Link>
          <Link href="/playground" className="text-sm text-zinc-400 hover:text-white transition-colors focus-ring px-1 py-0.5 rounded">
            Playground
          </Link>
          <Link href="/playground/models" className="text-sm text-zinc-400 hover:text-white transition-colors focus-ring px-1 py-0.5 rounded">
            Modèles
          </Link>
          <Link
            href="/#waitlist"
            className="text-sm font-semibold bg-white text-black px-5 py-2 rounded-md hover:bg-zinc-200 transition-all hover:scale-[1.02] focus-ring"
          >
            Rejoindre
          </Link>
        </nav>
        <button
          onClick={() => setOpen(!open)}
          className="sm:hidden flex items-center justify-center w-9 h-9 rounded-lg border border-white/10 text-zinc-400 hover:text-white hover:bg-white/5 transition-colors focus-ring"
          aria-label="Menu"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            {open ? (
              <>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="6" x2="20" y2="6" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="18" x2="20" y2="18" />
              </>
            )}
          </svg>
        </button>
      </div>
      {open && (
        <div className="sm:hidden border-t border-white/10 animate-slide-down">
          <nav className="max-w-6xl mx-auto px-6 py-4 flex flex-col gap-2">
            <Link href="/" onClick={() => setOpen(false)} className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-2.5 rounded-lg hover:bg-white/5">
              Accueil
            </Link>
            <Link href="/playground" onClick={() => setOpen(false)} className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-2.5 rounded-lg hover:bg-white/5">
              Playground
            </Link>
            <Link href="/playground/models" onClick={() => setOpen(false)} className="text-sm text-zinc-400 hover:text-white transition-colors px-3 py-2.5 rounded-lg hover:bg-white/5">
              Modèles
            </Link>
            <Link href="/#waitlist" onClick={() => setOpen(false)} className="text-sm font-semibold bg-white text-black px-4 py-2.5 rounded-lg hover:bg-zinc-200 transition-colors mt-2">
              Rejoindre
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
}
