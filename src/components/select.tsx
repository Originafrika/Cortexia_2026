"use client";

import { useState, useRef, useEffect } from "react";

interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  label?: string;
  className?: string;
}

export function Select({ value, onChange, options, label, className = "" }: SelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((o) => o.value === value);

  return (
    <div ref={ref} className={`relative ${className}`}>
      {label && <label className="text-xs text-zinc-400 font-medium mb-1.5 block">{label}</label>}
      <button type="button" onClick={() => setOpen(!open)} onKeyDown={(e) => e.key === "Enter" && setOpen(!open)}
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm outline-none transition-all duration-150 cursor-pointer
          ${open ? "border-[#7850ff] bg-white/10" : "border-white/15 bg-white/[0.04]"}
          border hover:border-white/30 hover:bg-white/10 focus-visible:border-[#7850ff] focus-visible:shadow-[0_0_0_3px_rgba(120,80,255,0.15)]`}
      >
        <span className={selected ? "text-white" : "text-zinc-500"}>{selected?.label ?? "Sélectionner..."}</span>
        <svg className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg bg-[#1a1a1d] border border-white/15 shadow-xl shadow-black/30 max-h-60 overflow-y-auto animate-scale-in origin-top custom-scrollbar">
          {options.map((o) => (
            <button key={o.value} type="button" onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm transition-all duration-100 cursor-pointer first:rounded-t-lg last:rounded-b-lg ${o.value === value ? "text-white bg-[#7850ff]/15 font-medium" : "text-zinc-400 hover:text-zinc-200 hover:bg-white/8"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
