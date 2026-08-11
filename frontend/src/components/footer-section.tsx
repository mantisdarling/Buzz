"use client";

import Link from "next/link";
import { ShieldCheck, ExternalLink, Heart, Code } from "lucide-react";

export function FooterSection() {
  return (
    <footer className="py-12 border-t border-slate-800/80 bg-slate-950/80 text-slate-400 text-xs">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        {/* Brand */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <span className="text-base font-bold text-white tracking-tight">Buzz</span>
            <span className="ml-2 text-xs text-slate-400">TruthLens - AI Powered Misinformation and Fake News Detector</span>
          </div>
        </div>

        {/* Links */}
        <div className="flex items-center space-x-6">
          <Link href="#architecture" className="hover:text-white transition-colors">
            Architecture
          </Link>
          <Link href="#features" className="hover:text-white transition-colors">
            Features
          </Link>
          <Link href="#demo" className="hover:text-white transition-colors">
            Playground
          </Link>
          <Link href="/dashboard" className="hover:text-white transition-colors">
            History
          </Link>
          <Link href="/admin" className="hover:text-white transition-colors">
            Admin
          </Link>
          <a
            href="https://github.com/mantisdarling/Buzz"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 hover:text-white transition-colors"
          >
            <Code className="w-4 h-4" />
            <span>GitHub</span>
            <ExternalLink className="w-3 h-3 ml-0.5" />
          </a>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 mt-8 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-slate-500 gap-4">
        <p>&copy; {new Date().getFullYear()} Buzz. Built with multi-model AI ensemble technology.</p>
        <div className="flex items-center space-x-1">
          <span>Engineered for high accuracy and transparency</span>
          <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500 ml-1" />
        </div>
      </div>
    </footer>
  );
}
