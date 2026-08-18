"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, CheckCircle2, AlertTriangle, ArrowRight, Play } from "lucide-react";

interface SampleClaim {
  id: number;
  label: string;
  category: "Real" | "Fake";
  confidence: number;
  text: string;
  explanation: Array<{ text: string; score: number }>;
}

const sampleClaims: SampleClaim[] = [
  {
    id: 1,
    label: "Verified Scientific Discovery",
    category: "Real",
    confidence: 0.94,
    text: "International research teams publish peer-reviewed findings confirming breakthroughs in room-temperature energy storage materials.",
    explanation: [
      { text: "International", score: 0.2 },
      { text: "research", score: 0.3 },
      { text: "teams", score: 0.1 },
      { text: "publish", score: 0.4 },
      { text: "peer-reviewed", score: 0.5 },
      { text: "findings", score: 0.2 },
    ],
  },
  {
    id: 2,
    label: "Clickbait Sensationalism",
    category: "Fake",
    confidence: 0.89,
    text: "SHOCKING SECRET: Unverified sources claim underground facilities hold hidden free energy devices from the public!",
    explanation: [
      { text: "SHOCKING", score: -0.6 },
      { text: "SECRET:", score: -0.5 },
      { text: "Unverified", score: -0.4 },
      { text: "sources", score: -0.2 },
      { text: "claim", score: -0.3 },
      { text: "hidden", score: -0.4 },
    ],
  },
  {
    id: 3,
    label: "Verified Financial Report",
    category: "Real",
    confidence: 0.91,
    text: "Central financial policy directors release official statements maintaining current interest rate trajectories following benchmark economic audits.",
    explanation: [
      { text: "Central", score: 0.1 },
      { text: "financial", score: 0.2 },
      { text: "directors", score: 0.2 },
      { text: "release", score: 0.3 },
      { text: "official", score: 0.4 },
      { text: "statements", score: 0.3 },
    ],
  },
];

export function PlaygroundSection() {
  const [selectedClaimId, setSelectedClaimId] = useState(1);

  const selectedClaim = sampleClaims.find((c) => c.id === selectedClaimId) || sampleClaims[0];

  return (
    <section id="demo" className="py-28 relative overflow-hidden bg-slate-950/60 border-t border-amber-500/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Section Header */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full gold-badge text-xs font-semibold uppercase tracking-widest">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Interactive Claim Showcase</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif gold-foil-title tracking-tight">
            Examine <span className="text-white font-normal italic">Forensic Evidence</span>
          </h2>

          <p className="text-slate-300 text-sm sm:text-base font-light">
            Select an investigative sample below to inspect real-time token attribution and credibility scoring.
          </p>
        </div>

        {/* Claim Selector Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {sampleClaims.map((claim) => {
            const isSelected = claim.id === selectedClaimId;
            return (
              <button
                key={claim.id}
                onClick={() => setSelectedClaimId(claim.id)}
                className={`p-5 rounded-2xl text-left transition-all duration-300 luxury-glass-card-hover border flex items-center justify-between ${
                  isSelected
                    ? "bg-slate-900/95 border-amber-400/60 shadow-lg shadow-amber-500/10"
                    : "bg-slate-950/60 border-slate-800/80 opacity-70 hover:opacity-100"
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block mb-1">{claim.label}</span>
                  <span className="text-sm font-serif font-bold text-slate-100">{claim.category} Claim</span>
                </div>
                <Play className={`w-4 h-4 transition-transform ${isSelected ? "text-amber-400 scale-110" : "text-slate-600"}`} />
              </button>
            );
          })}
        </div>

        {/* Interactive Result Card */}
        <div className="max-w-4xl mx-auto luxury-glass-card rounded-3xl p-8 sm:p-10 border border-amber-500/30 space-y-6 shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-amber-500/20 pb-4">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">
              Selected Article Analysis
            </span>
            <span
              className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center space-x-1.5 ${
                selectedClaim.category === "Real"
                  ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                  : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
              }`}
            >
              {selectedClaim.category === "Real" ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertTriangle className="w-3.5 h-3.5" />}
              <span>{selectedClaim.category} ({Math.round(selectedClaim.confidence * 100)}% Confidence)</span>
            </span>
          </div>

          <p className="text-slate-200 text-base sm:text-lg leading-relaxed font-serif italic p-6 rounded-2xl bg-slate-950/90 border border-amber-500/20">
            &ldquo;{selectedClaim.text}&rdquo;
          </p>

          <div className="space-y-3">
            <span className="text-xs font-bold text-amber-300 uppercase tracking-widest block">
              SHAP Token Attribution Matrix
            </span>
            <div className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 text-xs leading-relaxed flex flex-wrap gap-2">
              {selectedClaim.explanation.map((token, index) => (
                <span
                  key={index}
                  className={`px-2.5 py-1 rounded font-mono transition-all ${
                    token.score > 0
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                  }`}
                >
                  {token.text} ({token.score > 0 ? `+${token.score}` : token.score})
                </span>
              ))}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Link
              href="/"
              className="inline-flex items-center space-x-2 text-xs font-bold text-amber-300 hover:text-amber-200 uppercase tracking-wider transition-colors"
            >
              <span>Verify Your Own Article</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
