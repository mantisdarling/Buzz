"use client";

import { Cpu, ShieldCheck, BarChart3, Lock, Zap, ArrowUpRight } from "lucide-react";

export function BentoSection() {
  return (
    <section id="features" className="py-24 relative overflow-hidden">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Title */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full glass-card border border-purple-500/30 text-purple-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Framer-Inspired Modular Grid</span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-white">
            Engineered for <span className="gradient-text-cyan">Accuracy & Speed</span>
          </h2>

          <p className="text-slate-400 text-sm sm:text-base">
            Every layer of Buzz is built for enterprise-grade verification performance and transparency.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Large Featured - DistilBERT ONNX */}
          <div className="md:col-span-2 glass-card rounded-3xl p-8 border border-slate-800/80 glass-card-hover space-y-6 flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 w-fit">
                <Cpu className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>DistilBERT Transformer Model</span>
                  <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 transition-colors" />
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Fine-tuned transformer neural network exported to ONNX Runtime format. Evaluates contextual semantic patterns across headlines and full text bodies in under 50ms.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-cyan-400 flex items-center justify-between">
              <span>Latency: &lt; 45ms</span>
              <span>Quantization: INT8 ONNX</span>
            </div>
          </div>

          {/* Card 2: spaCy Stylometry */}
          <div className="glass-card rounded-3xl p-8 border border-slate-800/80 glass-card-hover space-y-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 w-fit">
                <ShieldCheck className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">spaCy Stylometry</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Analyzes part-of-speech distributions, clickbait syntax, sentence sentiment polarization, and lexical density.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center text-xs font-semibold text-purple-400">
              <span>Stylometric NLP Features</span>
            </div>
          </div>

          {/* Card 3: Statistical TF-IDF Baseline */}
          <div className="glass-card rounded-3xl p-8 border border-slate-800/80 glass-card-hover space-y-6 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/30 text-sky-400 w-fit">
                <BarChart3 className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl font-bold text-white">TF-IDF N-Gram Baseline</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Statistical term frequency analysis cross-references unigrams and bigrams against verified datasets.
                </p>
              </div>
            </div>

            <div className="pt-2 flex items-center text-xs font-semibold text-sky-400">
              <span>Logistic Regression Baseline</span>
            </div>
          </div>

          {/* Card 4: Large Featured - Security & Redis Caching */}
          <div className="md:col-span-2 glass-card rounded-3xl p-8 border border-slate-800/80 glass-card-hover space-y-6 flex flex-col justify-between relative overflow-hidden group">
            <div className="space-y-4">
              <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 w-fit">
                <Lock className="w-6 h-6" />
              </div>

              <div className="space-y-2">
                <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                  <span>SHA-256 Redis Caching & SlowAPI Limits</span>
                  <ArrowUpRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 transition-colors" />
                </h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  Every submission is hashed with SHA-256 for instant Redis cache lookups, preventing redundant GPU inference. SlowAPI protects endpoints from automated abuse.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-xs font-mono text-emerald-400 flex items-center justify-between">
              <span>Cache Hits: Instant Response</span>
              <span>Rate Limit: Enforced</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
