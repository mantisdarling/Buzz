"use client";

import { useState } from "react";
import { ShieldCheck, ArrowRight, Zap, Search, Link as LinkIcon, CheckCircle, AlertTriangle, Award } from "lucide-react";
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
            Crafted for uncompromised verification precision. Combining fine-tuned DistilBERT content classification, spaCy stylometry, and SHAP token-level explainability.
          </p>

          {/* Quick Metrics Bar */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs font-semibold uppercase tracking-widest text-slate-400">
            <span className="px-4 py-2 rounded-xl bg-slate-950/90 border border-amber-500/20 text-amber-300 flex items-center gap-2">
              <Zap className="w-3.5 h-3.5 text-amber-400" /> Multi-Model AI Precision
            </span>
            <span className="px-4 py-2 rounded-xl bg-slate-950/90 border border-amber-500/20 text-amber-300 flex items-center gap-2">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> Provenance Verification
            </span>
          </div>
        </div>

        {/* Luxury Glass Card Analyzer Container */}
        <div className="max-w-3xl mx-auto luxury-glass-card rounded-3xl p-6 sm:p-10 space-y-6">
          {/* Tab Switcher */}
          <div className="flex items-center justify-center p-1 rounded-2xl bg-slate-950/90 border border-amber-500/30 max-w-xs mx-auto">
            <button
              onClick={() => { setActiveTab("text"); setInputContent(""); }}
              className={`flex-1 flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 ${
                activeTab === "text"
                  ? "gold-btn-primary"
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
                  ? "gold-btn-primary"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Article URL</span>
            </button>
          </div>

          {/* Form Input */}
          <div className="space-y-4">
            {activeTab === "text" ? (
              <textarea
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder="Paste news claim, headline, or statement here for forensic verification..."
                className="w-full h-36 p-4 rounded-2xl bg-slate-950/90 border border-amber-500/20 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm transition-all duration-200 resize-none font-sans"
              />
            ) : (
              <input
                type="url"
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder="https://news-article-domain.com/path"
                className="w-full p-4 rounded-2xl bg-slate-950/90 border border-amber-500/20 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-amber-400 text-sm transition-all duration-200 font-sans"
              />
            )}

            {/* Analyze Action Button */}
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !inputContent.trim()}
              className="w-full py-4 px-6 rounded-2xl gold-btn-primary disabled:opacity-50 text-sm uppercase tracking-wider flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  <span>Processing Forensic Analysis...</span>
                </div>
              ) : (
                <>
                  <span>Verify Article with Buzz</span>
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

          {/* Results Output */}
          {predictionResult && (
            <div className="p-6 rounded-2xl bg-slate-950/90 border border-amber-500/30 space-y-5 animate-in fade-in slide-in-from-bottom-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <span className="text-xs font-bold text-amber-300 uppercase tracking-widest">AI Determination</span>
                <span
                  className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold flex items-center space-x-1.5 ${
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
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/20">
                    <div className="text-xs text-slate-400 uppercase font-semibold">DistilBERT</div>
                    <div className="text-sm font-mono font-bold text-amber-300 mt-1">
                      {Math.round(predictionResult.scores.distilbert * 100)}%
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/20">
                    <div className="text-xs text-slate-400 uppercase font-semibold">spaCy Style</div>
                    <div className="text-sm font-mono font-bold text-amber-300 mt-1">
                      {Math.round(predictionResult.scores.style * 100)}%
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-amber-500/20">
                    <div className="text-xs text-slate-400 uppercase font-semibold">TF-IDF Baseline</div>
                    <div className="text-sm font-mono font-bold text-amber-300 mt-1">
                      {Math.round(predictionResult.scores.baseline * 100)}%
                    </div>
                  </div>
                </div>
              )}

              {/* Highlighted SHAP Tokens */}
              {predictionResult.explanation && predictionResult.explanation.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-bold text-amber-300 uppercase tracking-widest block">
                    SHAP Token Level Authenticity Highlights
                  </span>
                  <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs leading-relaxed flex flex-wrap gap-1.5">
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
