"use client";

import { useState } from "react";
import { ShieldCheck, ArrowRight, Zap, Search, Link as LinkIcon, CheckCircle, AlertTriangle, Flame } from "lucide-react";
import { api, PredictResponse } from "@/lib/api";

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
      const errorMsg = err instanceof Error ? err.message : "Failed to analyze content. Please try again.";
      setErrorMessage(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section className="relative pt-16 pb-24 overflow-hidden cinematic-bg">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Investigative Documentary Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full gold-glow-badge text-xs font-bold uppercase tracking-widest shadow-2xl">
            <Flame className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
            <span>TruthLens — AI Misinformation & Claim Verifier</span>
          </div>
        </div>

        {/* High-Impact Hero Title & Description */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl investigative-title uppercase tracking-tighter leading-none">
            Truth <span className="gradient-text-cyan font-black">Uncovered</span> By AI
          </h1>

          <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
            Multi-model forensic verification platform combining DistilBERT content classification, spaCy stylometry parsing, and SHAP word-level transparency.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-semibold uppercase tracking-wider text-slate-400">
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> Realtime GPU Inference
            </span>
            <span className="px-3.5 py-1.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Token Level Explainability
            </span>
          </div>
        </div>

        {/* Floating Architectural Card Analyzer */}
        <div className="max-w-3xl mx-auto architectural-card rounded-3xl p-6 sm:p-8 space-y-6 border border-slate-800/90 shadow-2xl">
          {/* Tab Selection */}
          <div className="flex items-center justify-center p-1 rounded-2xl bg-slate-950/90 border border-slate-800 max-w-xs mx-auto">
            <button
              onClick={() => { setActiveTab("text"); setInputContent(""); }}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === "text"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Raw Text</span>
            </button>
            <button
              onClick={() => { setActiveTab("url"); setInputContent(""); }}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === "url"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Article URL</span>
            </button>
          </div>

          {/* Input Area */}
          <div className="space-y-4">
            {activeTab === "text" ? (
              <textarea
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder="Paste news claim, article text, or statement here to verify authenticity..."
                className="w-full h-36 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 text-sm transition-all duration-200 resize-none font-sans"
              />
            ) : (
              <input
                type="url"
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder="https://news-site.com/article-url"
                className="w-full p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/80 text-sm transition-all duration-200 font-sans"
              />
            )}

            {/* Analyze Action Button */}
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !inputContent.trim()}
              className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-bold text-sm uppercase tracking-wider shadow-xl shadow-cyan-500/20 flex items-center justify-center space-x-2 transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Processing Multi-Model Forensic Ensemble...</span>
                </div>
              ) : (
                <>
                  <span>Verify Claim with Buzz</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Results Output Card */}
          {predictionResult && (
            <div className="p-6 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-5 animate-in fade-in slide-in-from-bottom-3">
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">AI Forensic Determination</span>
                <span
                  className={`px-3 py-1.5 rounded-full text-xs font-extrabold flex items-center space-x-1.5 ${
                    predictionResult.verdict === "Real"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{predictionResult.verdict} ({Math.round((predictionResult.confidence || 0) * 100)}% Confidence)</span>
                </span>
              </div>

              {/* Model Scores */}
              {predictionResult.scores && (
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="text-xs text-slate-400 uppercase font-semibold">DistilBERT</div>
                    <div className="text-sm font-bold text-cyan-400 mt-1">
                      {Math.round(predictionResult.scores.distilbert * 100)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="text-xs text-slate-400 uppercase font-semibold">spaCy Style</div>
                    <div className="text-sm font-bold text-purple-400 mt-1">
                      {Math.round(predictionResult.scores.style * 100)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800">
                    <div className="text-xs text-slate-400 uppercase font-semibold">TF-IDF Baseline</div>
                    <div className="text-sm font-bold text-sky-400 mt-1">
                      {Math.round(predictionResult.scores.baseline * 100)}%
                    </div>
                  </div>
                </div>
              )}

              {/* Highlighted SHAP Tokens */}
              {predictionResult.explanation && predictionResult.explanation.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-widest block">
                    SHAP Token Level Authenticity Matrix
                  </span>
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs leading-relaxed flex flex-wrap gap-1.5">
                    {predictionResult.explanation.map((token, idx) => (
                      <span
                        key={idx}
                        className={`px-2 py-1 rounded font-mono text-xs transition-all ${
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
