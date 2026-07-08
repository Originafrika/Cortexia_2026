import Link from "next/link";

export function Header() {
  return (
    <header className="border-b border-white/10">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 font-bold text-xl text-white">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#7850ff] to-[#00c8ff] flex items-center justify-center text-sm font-bold text-white">
            C
          </div>
          Cortexia
        </Link>
        <nav className="hidden sm:flex items-center gap-6">
          <Link href="/" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Accueil
          </Link>
          <Link href="/playground" className="text-sm text-zinc-400 hover:text-white transition-colors">
            Playground
          </Link>
          <Link
            href="/#waitlist"
            className="text-sm font-semibold bg-white text-black px-5 py-2 rounded-md hover:bg-zinc-200 transition-colors"
          >
            Rejoindre
          </Link>
        </nav>
      </div>
    </header>
  );
}
