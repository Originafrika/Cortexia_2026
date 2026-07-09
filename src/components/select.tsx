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
        className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm outline-none transition-all duration-150
          ${open ? "border-[#7850ff] bg-white/5" : "border-white/10 bg-white/5"}
          border hover:border-[#7850ff]/50 focus-visible:border-[#7850ff] focus-visible:shadow-[0_0_0_3px_rgba(120,80,255,0.15)]`}
      >
        <span className={selected ? "text-white" : "text-zinc-500"}>{selected?.label ?? "Sélectionner..."}</span>
        <svg className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-200 ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>
      {open && (
        <div className="absolute z-50 mt-1 w-full rounded-lg bg-zinc-900 border border-white/10 shadow-xl max-h-60 overflow-y-auto animate-scale-in origin-top">
          {options.map((o) => (
            <button key={o.value} type="button" onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-3 py-2 text-sm transition-all duration-100 hover:bg-white/5 first:rounded-t-lg last:rounded-b-lg ${o.value === value ? "text-[#a78bfa] bg-[#7850ff]/10" : "text-zinc-300"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
