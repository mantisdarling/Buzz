"use client";

import { useState } from "react";
import { ShieldCheck, ArrowRight, Search, Link as LinkIcon, CheckCircle, AlertTriangle, Award, Sparkles, RefreshCw, ExternalLink, Globe, BookOpen, BarChart2 } from "lucide-react";
import { api, PredictResponse } from "@/lib/api";

const quickSamples = [
  {
    title: "🔬 Scientific Breakthrough",
    text: "Peer-reviewed research published by international astrophysicists confirms detection of water vapor in exoplanet atmosphere.",
  },
  {
    title: "⚠️ Russia is a Continent",
    text: "Russia is a continent spanning across the northern hemisphere.",
  },
  {
    title: "🏛️ Putin State Visit",
    text: "Russian President Vladimir Putin arrives in New Delhi for annual bilateral summit with Prime Minister Narendra Modi.",
  },
];

export function HeroSection() {
  const [activeTab, setActiveTab] = useState<"text" | "url">("text");
  const [inputContent, setInputContent] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [predictionResult, setPredictionResult] = useState<PredictResponse | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleAnalyze = async () => {
    if (!inputContent.trim()) return;

    setIsLoading(true);
    setErrorMessage(null);
    setPredictionResult(null);

    try {
      const payload = activeTab === "text" ? { text: inputContent } : { url: inputContent };
      const response = await api.predict(payload);
      setPredictionResult(response);
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Failed to verify content against live databases. Please try again.";
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectSample = (sampleText: string) => {
    setActiveTab("text");
    setInputContent(sampleText);
    setPredictionResult(null);
    setErrorMessage(null);
  };

  return (
    <section className="relative pt-20 pb-28 overflow-hidden desidaru-hero">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        {/* Luxury Gold Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full gold-badge text-xs font-semibold uppercase tracking-widest shadow-2xl">
            <Award className="w-4 h-4 text-amber-300" />
            <span>TruthLens — AI Misinformation & Claim Verifier</span>
          </div>
        </div>

        {/* Desi Daru Inspired Luxury Headlines */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-7xl md:text-8xl font-serif gold-foil-title tracking-tight leading-none">
            Two Realms. <span className="text-white font-normal italic">One Truth.</span>
          </h1>

          <p className="text-slate-300 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
            Next-generation AI fact-checking engine. Cross-referencing public web intelligence, NLI stance classification, multi-source consensus scoring, and token explainability.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
            <span className="px-4 py-2 rounded-xl bg-slate-950/90 border border-amber-500/20 text-amber-300 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-amber-400" /> Live Web Retrieval & Fact Archives
            </span>
            <span className="px-4 py-2 rounded-xl bg-slate-950/90 border border-amber-500/20 text-amber-300 flex items-center gap-2">
              <BarChart2 className="w-3.5 h-3.5 text-amber-400" /> Multi-Source Consensus Gauge
            </span>
            <span className="px-4 py-2 rounded-xl bg-slate-950/90 border border-amber-500/20 text-amber-300 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> NLI Stance Verification
            </span>
          </div>
        </div>

        {/* Luxury Glass Card Analyzer Container */}
        <div className="max-w-3xl mx-auto luxury-glass-card rounded-3xl p-6 sm:p-10 space-y-6">
          {/* Tab Switcher & Quick Samples */}
          <div className="space-y-4">
            <div className="flex items-center justify-center p-1 rounded-2xl bg-slate-950/90 border border-amber-500/30 max-w-xs mx-auto">
              <button
                onClick={() => { setActiveTab("text"); setInputContent(""); setPredictionResult(null); }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  activeTab === "text"
                    ? "gold-btn-primary"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Search className="w-3.5 h-3.5" />
                <span>Fact-Check Claim</span>
              </button>
              <button
                onClick={() => { setActiveTab("url"); setInputContent(""); setPredictionResult(null); }}
                className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                  activeTab === "url"
                    ? "gold-btn-primary"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <LinkIcon className="w-3.5 h-3.5" />
                <span>Verify Article URL</span>
              </button>
            </div>

            {/* Quick One-Click Samples */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-1">
              <span className="text-xs text-amber-300/70 font-semibold uppercase tracking-wider mr-1 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-amber-400" /> Benchmark Tests:
              </span>
              {quickSamples.map((sample, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSample(sample.text)}
                  className="px-3 py-1 rounded-lg text-xs bg-slate-950/80 border border-amber-500/20 text-slate-300 hover:text-amber-300 hover:border-amber-500/50 transition-all duration-200"
                >
                  {sample.title}
                </button>
              ))}
            </div>
          </div>

          {/* Form Input */}
          <div className="space-y-4">
            {activeTab === "text" ? (
              <textarea
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder="Paste news claim, question, WhatsApp message, statement, or headline for live fact-checking..."
                className="w-full h-36 p-4 rounded-2xl bg-slate-950/90 border border-amber-500/20 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm transition-all duration-200 resize-none font-sans"
              />
            ) : (
              <input
                type="url"
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder="https://news-article-domain.com/article-path"
                className="w-full p-4 rounded-2xl bg-slate-950/90 border border-amber-500/20 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm transition-all duration-200 font-sans"
              />
            )}

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleAnalyze}
                disabled={isLoading || !inputContent.trim()}
                className="flex-1 py-4 px-6 rounded-2xl gold-btn-primary disabled:opacity-50 text-sm uppercase tracking-wider flex items-center justify-center space-x-2"
              >
                {isLoading ? (
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Searching Web Archives & Verifying Stance...</span>
                  </div>
                ) : (
                  <>
                    <span>Execute Multi-Source Fact Check</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {inputContent && (
                <button
                  onClick={() => { setInputContent(""); setPredictionResult(null); }}
                  className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-slate-400 hover:text-amber-300 hover:border-amber-500/30 transition-all"
                  title="Clear Input"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Results Output */}
          {predictionResult && (
            <div className="p-6 sm:p-8 rounded-2xl bg-slate-950/95 border border-amber-500/30 space-y-6 animate-in fade-in slide-in-from-bottom-3">
              {/* Verdict Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-amber-500/20 pb-4">
                <div>
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-widest block">Fact-Check Verdict</span>
                  <span className="text-xs text-slate-400 font-light">
                    {predictionResult.consensus?.consensusVerdict || "Live Multi-Source Evaluation"}
                  </span>
                </div>
                <span
                  className={`px-4 py-1.5 rounded-full text-xs font-extrabold flex items-center space-x-2 self-start sm:self-auto ${
                    predictionResult.verdict === "Real"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shadow-lg shadow-emerald-500/10"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-lg shadow-rose-500/10"
                  }`}
                >
                  {predictionResult.verdict === "Real" ? <CheckCircle className="w-4 h-4" /> : <AlertTriangle className="w-4 h-4" />}
                  <span>{predictionResult.verdict === "Real" ? "Verified Authentic" : "Debunked / False"} ({Math.round((predictionResult.confidence || 0) * 100)}% Confidence)</span>
                </span>
              </div>

              {/* Multi-Source Consensus Meter */}
              {predictionResult.consensus && (
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/20 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                      <BarChart2 className="w-3.5 h-3.5 text-amber-400" /> Multi-Source Consensus Meter
                    </span>
                    <span className="text-slate-400 font-mono">
                      {predictionResult.consensus.supportingPercent}% Supports / {predictionResult.consensus.refutingPercent}% Refutes
                    </span>
                  </div>

                  {/* Consensus Progress Bar */}
                  <div className="w-full h-3 bg-slate-950 rounded-full overflow-hidden flex border border-slate-800">
                    <div
                      style={{ width: `${predictionResult.consensus.supportingPercent}%` }}
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-700"
                      title={`Supporting Evidence: ${predictionResult.consensus.supportingPercent}%`}
                    />
                    <div
                      style={{ width: `${predictionResult.consensus.refutingPercent}%` }}
                      className="bg-gradient-to-r from-rose-500 to-red-600 transition-all duration-700"
                      title={`Refuting / Debunking Evidence: ${predictionResult.consensus.refutingPercent}%`}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-0.5">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block" /> Supporting ({predictionResult.consensus.supportingPercent}%)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-400 inline-block" /> Refuting / Debunking ({predictionResult.consensus.refutingPercent}%)
                    </span>
                  </div>
                </div>
              )}

              {/* Fact-Check Evidence Summary */}
              {predictionResult.summary && (
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-amber-500/20 space-y-1.5">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                    <BookOpen className="w-3.5 h-3.5 text-amber-400" /> Fact-Check Ground Truth Summary
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-light">
                    {predictionResult.summary}
                  </p>
                </div>
              )}

              {/* Verified Sources & Citations with Stance & Credibility Tier Badges */}
              {predictionResult.sources && predictionResult.sources.length > 0 && (
                <div className="space-y-3">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-widest flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5 text-amber-400" /> Verified Sources & Evidence Citations
                  </span>
                  <div className="grid grid-cols-1 gap-3">
                    {predictionResult.sources.map((src, idx) => (
                      <a
                        key={idx}
                        href={src.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/40 hover:bg-slate-900 transition-all group block space-y-2"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                              {src.publisher}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                                src.stance === "supports"
                                  ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                                  : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                              }`}
                            >
                              {src.stance === "supports" ? "Supports Claim" : "Refutes / Debunks Claim"}
                            </span>
                          </div>
                          <div className="flex items-center space-x-1 text-xs text-slate-400 group-hover:text-amber-300 transition-colors">
                            <span className="text-[11px] text-amber-400/80">{src.credibilityTier}</span>
                            <ExternalLink className="w-3 h-3 ml-1" />
                          </div>
                        </div>
                        <div className="text-xs font-serif font-bold text-slate-100 group-hover:text-white">
                          {src.title}
                        </div>
                        <p className="text-xs text-slate-400 leading-relaxed font-light">
                          &ldquo;{src.snippet}&rdquo;
                        </p>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Model Scores */}
              {predictionResult.scores && (
                <div className="grid grid-cols-3 gap-3 text-center pt-2">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/20">
                    <div className="text-xs text-slate-400 uppercase font-semibold">DistilBERT</div>
                    <div className="text-sm font-mono font-bold text-amber-300 mt-1">
                      {Math.round(predictionResult.scores.distilbert * 100)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/20">
                    <div className="text-xs text-slate-400 uppercase font-semibold">spaCy Style</div>
                    <div className="text-sm font-mono font-bold text-amber-300 mt-1">
                      {Math.round(predictionResult.scores.style * 100)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-amber-500/20">
                    <div className="text-xs text-slate-400 uppercase font-semibold">TF-IDF Baseline</div>
                    <div className="text-sm font-mono font-bold text-amber-300 mt-1">
                      {Math.round(predictionResult.scores.baseline * 100)}%
                    </div>
                  </div>
                </div>
              )}

              {/* Highlighted SHAP Tokens */}
              {predictionResult.explanation && predictionResult.explanation.length > 0 && (
                <div className="space-y-2 pt-1">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-widest block">
                    SHAP Token Level Authenticity Highlights
                  </span>
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs leading-relaxed flex flex-wrap gap-1.5">
                    {predictionResult.explanation.map((token, idx) => (
                      <span
                        key={idx}
                        className={`px-2.5 py-1 rounded font-mono text-xs transition-all ${
                          token.score > 0
                            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                            : "bg-rose-500/20 text-rose-300 border border-rose-500/30"
                        }`}
                      >
                        {token.text}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
