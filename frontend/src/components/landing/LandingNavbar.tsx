import Link from "next/link";
import { useState } from "react";

const navLinks = [
  { label: "Product", href: "#how" },
  { label: "Features", href: "#features" },
  { label: "Use Cases", href: "#use-cases" }
];

const appLinks = [
  { label: "Discover", href: "/app" },
  { label: "Dashboard", href: "/app/dashboard" },
  { label: "Chatbot", href: "/app/chatbot" }
];

export default function LandingNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-xl bg-base-900/80 border-b border-white/5">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-text-100 font-display text-xl">
          NovaFYP Advisor
        </Link>
        <div className="hidden lg:flex items-center gap-6 text-sm">
          {navLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-text-200 hover:text-text-100 transition"
            >
              {item.label}
            </Link>
          ))}
          <div className="w-px h-5 bg-white/10" />
          {appLinks.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-text-200 hover:text-text-100 transition flex items-center gap-2"
            >
              {item.label}
            </Link>
          ))}
        </div>
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="#auth"
            className="text-sm text-text-200 hover:text-text-100 transition"
          >
            Sign In (optional)
          </Link>
          <Link
            href="#auth"
            className="bg-brand-500 hover:bg-brand-400 text-white px-4 py-2 rounded-xl transition shadow-glow text-sm"
          >
            Getting Started
          </Link>
        </div>
        <button
          type="button"
          aria-expanded={isMenuOpen}
          aria-label="Toggle navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
          className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-full border border-white/10 text-text-100 hover:text-white hover:border-white/30 transition"
        >
          <span className="text-lg">{isMenuOpen ? "✕" : "☰"}</span>
        </button>
      </div>
      {isMenuOpen && (
        <div className="lg:hidden px-6 pb-6">
          <div className="rounded-2xl border border-white/10 bg-base-900/90 backdrop-blur-xl shadow-glow p-4 space-y-4">
            <div className="space-y-2">
              {navLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-text-200 hover:text-text-100 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="h-px bg-white/10" />
            <div className="space-y-2">
              {appLinks.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="block text-text-200 hover:text-text-100 transition"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
            </div>
            <div className="h-px bg-white/10" />
            <div className="flex items-center gap-3">
              <Link
                href="#auth"
                className="text-sm text-text-200 hover:text-text-100 transition"
                onClick={() => setIsMenuOpen(false)}
              >
                Sign In (optional)
              </Link>
              <Link
                href="#auth"
                className="bg-brand-500 hover:bg-brand-400 text-white px-4 py-2 rounded-xl transition shadow-glow text-sm"
                onClick={() => setIsMenuOpen(false)}
              >
                Getting Started
              </Link>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
