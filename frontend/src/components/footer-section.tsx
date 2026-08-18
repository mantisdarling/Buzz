"use client";

import Link from "next/link";
import { ShieldCheck, ExternalLink, Heart, Code } from "lucide-react";

export function FooterSection() {
  return (
    <footer className="py-14 border-t border-amber-500/20 bg-slate-950/90 text-slate-400 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-serif font-bold text-white tracking-tight">Buzz</span>
            <span className="ml-2 text-xs text-amber-300/80">TruthLens — AI Misinformation & Claim Verifier</span>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center space-x-6">
          <Link href="#architecture" className="hover:text-amber-300 transition-colors">
            Architecture
          </Link>
          <Link href="#features" className="hover:text-amber-300 transition-colors">
            Features
          </Link>
          <Link href="#demo" className="hover:text-amber-300 transition-colors">
            Playground
          </Link>
          <Link href="/dashboard" className="hover:text-amber-300 transition-colors">
            History
          </Link>
          <Link href="/admin" className="hover:text-amber-300 transition-colors">
            Admin
          </Link>
          <a
            href="https://github.com/mantisdarling/Buzz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 hover:text-amber-300 transition-colors"
          >
            <Code className="w-4 h-4" />
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-amber-500/10 flex flex-col sm:flex-row items-center justify-between text-slate-500 gap-4">
        <p>&copy; {new Date().getFullYear()} Buzz. Two Realms. One Truth.</p>
        <div className="flex items-center space-x-1">
          <span>Engineered for institutional verification integrity</span>
          <Heart className="w-3.5 h-3.5 text-amber-500 fill-amber-500 ml-1" />
        </div>
      </div>
    </footer>
  );
}
