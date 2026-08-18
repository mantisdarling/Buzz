"use client";

import { useState } from "react";
import { Cpu, ShieldAlert, Layers, Sparkles, CheckCircle2, ArrowRight } from "lucide-react";

interface StepItem {
  id: number;
  badge: string;
  title: string;
  description: string;
  detailPoints: string[];
  gradient: string;
}

const steps: StepItem[] = [
  {
    id: 1,
    badge: "Stage 01 — Scrape & Ingest",
    title: "Multi-Format Content Scraping",
    description: "Accepts raw text or website URLs. Trafilatura extracts main article body text while stripping boilerplate HTML, navigation, and advertisement noise.",
    detailPoints: [
      "Asynchronous scraping via Celery task queue",
      "Automatic boilerplate and nav removal",
      "SHA-256 prediction hashing for Redis caching",
    ],
    gradient: "from-amber-500/15 via-yellow-600/10 to-transparent",
  },
  {
    id: 2,
    badge: "Stage 02 — Multi-Model Inference",
    title: "Triple AI Pipeline Processing",
    description: "Evaluates input across three distinct algorithms: fine-tuned DistilBERT transformer models, spaCy stylometry parsing, and statistical N-Gram TF-IDF baselines.",
    detailPoints: [
      "DistilBERT ONNX runtime accelerated inference",
      "spaCy syntactic density and style feature extraction",
      "Statistical term-frequency baseline cross-checking",
    ],
    gradient: "from-amber-600/15 via-orange-600/10 to-transparent",
  },
  {
    id: 3,
    badge: "Stage 03 — SHAP Explainability",
    title: "Word-Level Transparency & Verdict",
    description: "Combines probabilities using weighted ensemble math and highlights individual tokens to explain why text was marked authentic or misleading.",
    detailPoints: [
      "Color-coded word contribution highlights",
      "Confidence percentage scoring matrix",
      "User feedback loop for continuous accuracy",
    ],
    gradient: "from-yellow-500/15 via-amber-500/10 to-transparent",
  },
];

export function ScrollytellingSection() {
  const [activeStepId, setActiveStepId] = useState(1);

  const activeStep = steps.find((s) => s.id === activeStepId) || steps[0];

  return (
    <section id="architecture" className="py-28 relative overflow-hidden bg-slate-950/70 border-y border-amber-500/20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* Header Title */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full gold-badge text-xs font-semibold uppercase tracking-widest">
            <Layers className="w-3.5 h-3.5 text-amber-300" />
            <span>Interactive Verification Pipeline</span>
          </div>

          <h2 className="text-3xl sm:text-5xl md:text-6xl font-serif gold-foil-title tracking-tight">
            How <span className="text-white font-normal italic">Buzz AI</span> Verifies Claims
          </h2>

          <p className="text-slate-300 text-sm sm:text-base font-light">
            Explore the multi-tier inspection pipeline engineered for institutional fact-checking accuracy.
          </p>
        </div>

        {/* Step Tabs Navigation */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {steps.map((step) => {
            const isActive = step.id === activeStepId;
            return (
              <button
                key={step.id}
                onClick={() => setActiveStepId(step.id)}
                className={`p-5 rounded-2xl text-left transition-all duration-300 luxury-glass-card-hover border ${
                  isActive
                    ? "bg-slate-900/95 border-amber-400/60 shadow-lg shadow-amber-500/10"
                    : "bg-slate-950/60 border-slate-800/80 opacity-70 hover:opacity-100"
                }`}
              >
                <div className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">{step.badge}</div>
                <div className="text-sm font-serif font-bold text-slate-100">{step.title}</div>
              </button>
            );
          })}
        </div>

        {/* Interactive Feature Stage Display Card */}
        <div className={`p-8 sm:p-12 rounded-3xl luxury-glass-card border border-amber-500/30 bg-gradient-to-br ${activeStep.gradient} transition-all duration-500 shadow-2xl space-y-8`}>
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-b border-amber-500/20 pb-6">
            <div className="space-y-2">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-widest">{activeStep.badge}</span>
              <h3 className="text-2xl sm:text-4xl font-serif font-bold text-white">{activeStep.title}</h3>
            </div>
            <div className="p-3.5 rounded-2xl bg-slate-950/90 border border-amber-500/30 text-amber-300">
              {activeStep.id === 1 && <ShieldAlert className="w-7 h-7" />}
              {activeStep.id === 2 && <Cpu className="w-7 h-7" />}
              {activeStep.id === 3 && <Sparkles className="w-7 h-7" />}
            </div>
          </div>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-3xl font-light">
            {activeStep.description}
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {activeStep.detailPoints.map((point, index) => (
              <div key={index} className="p-4 rounded-xl bg-slate-950/90 border border-amber-500/20 flex items-start space-x-3">
                <CheckCircle2 className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                <span className="text-xs text-slate-300 font-medium leading-normal">{point}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setActiveStepId((prev) => (prev % 3) + 1)}
              className="inline-flex items-center space-x-2 text-xs font-bold text-amber-300 hover:text-amber-200 uppercase tracking-wider transition-colors"
            >
              <span>Next Pipeline Stage</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
