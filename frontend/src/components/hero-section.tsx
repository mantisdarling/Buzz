"use client";

import { useState } from "react";
import { ShieldCheck, Sparkles, ArrowRight, Zap, Search, Link as LinkIcon, CheckCircle, AlertTriangle } from "lucide-react";
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
    <section className="relative pt-12 pb-20 overflow-hidden radial-glow-cyan">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {/* Animated Brand Badge */}
        <div className="flex justify-center">
          <div className="inline-flex items-center space-x-2.5 px-4 py-1.5 rounded-full glass-card border border-cyan-500/30 text-cyan-400 text-xs font-semibold shadow-xl shadow-cyan-500/10">
            <Sparkles className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>TruthLens - AI Powered Misinformation and Fake News Detector</span>
          </div>
        </div>

        {/* Hero Title and Description */}
        <div className="text-center space-y-6 max-w-4xl mx-auto">
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-extrabold tracking-tight gradient-text-hero leading-tight">
            Verify Truth in Seconds with <span className="gradient-text-cyan">Buzz AI</span>
          </h1>

          <p className="text-slate-400 text-base sm:text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            Multi-model forensic AI ensemble combining DistilBERT content analysis, spaCy stylometry, and statistical baseline verification with word-level explainability.
          </p>

          {/* Quick Action Badges */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-900/90 text-slate-300 border border-slate-800 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-cyan-400" /> Realtime Inference
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-900/90 text-slate-300 border border-slate-800 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> SHAP Word Highlights
            </span>
            <span className="px-3 py-1 rounded-full text-xs font-medium bg-slate-900/90 text-slate-300 border border-slate-800 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-purple-400" /> 3 Model Ensemble
            </span>
          </div>
        </div>

        {/* Interactive Analyzer Card */}
        <div className="max-w-3xl mx-auto glass-card rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 border border-slate-800/80">
          {/* Tab Selection */}
          <div className="flex items-center justify-center p-1 rounded-2xl bg-slate-950/80 border border-slate-800/80 max-w-xs mx-auto">
            <button
              onClick={() => { setActiveTab("text"); setInputContent(""); }}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-xl text-xs font-medium transition-all duration-200 ${
                activeTab === "text"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Search className="w-3.5 h-3.5" />
              <span>Raw Text</span>
            </button>
            <button
              onClick={() => { setActiveTab("url"); setInputContent(""); }}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-xl text-xs font-medium transition-all duration-200 ${
                activeTab === "url"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <LinkIcon className="w-3.5 h-3.5" />
              <span>Article URL</span>
            </button>
          </div>

          {/* Input Field */}
          <div className="space-y-4">
            {activeTab === "text" ? (
              <textarea
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder="Paste news headline or article content to analyze for misinformation..."
                className="w-full h-36 p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/50 text-sm transition-all duration-200 resize-none"
              />
            ) : (
              <input
                type="url"
                value={inputContent}
                onChange={(e) => setInputContent(e.target.value)}
                placeholder="https://news-site.com/article/path"
                className="w-full p-4 rounded-2xl bg-slate-950/90 border border-slate-800 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/50 text-sm transition-all duration-200"
              />
            )}

            {/* Submit Button */}
            <button
              onClick={handleAnalyze}
              disabled={isLoading || !inputContent.trim()}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 text-white font-semibold text-sm shadow-xl shadow-cyan-500/25 flex items-center justify-center space-x-2 transition-all duration-300"
            >
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Running AI Ensemble...</span>
                </div>
              ) : (
                <>
                  <span>Analyze Claim with Buzz</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Error Feedback */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Prediction Result Display */}
          {predictionResult && (
            <div className="p-6 rounded-2xl bg-slate-950/90 border border-slate-800 space-y-5 animate-in fade-in slide-in-from-bottom-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">AI Forensic Verdict</span>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold flex items-center space-x-1.5 ${
                    predictionResult.verdict === "Real"
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-rose-500/20 text-rose-400 border border-rose-500/30"
                  }`}
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{predictionResult.verdict} ({Math.round((predictionResult.confidence || 0) * 100)}% Confidence)</span>
                </span>
              </div>

              {/* Model Scores Breakdown */}
              {predictionResult.scores && (
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-xs text-slate-400">DistilBERT</div>
                    <div className="text-sm font-bold text-cyan-400 mt-1">
                      {Math.round(predictionResult.scores.distilbert * 100)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-xs text-slate-400">spaCy Style</div>
                    <div className="text-sm font-bold text-purple-400 mt-1">
                      {Math.round(predictionResult.scores.style * 100)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div className="text-xs text-slate-400">TF-IDF Baseline</div>
                    <div className="text-sm font-bold text-sky-400 mt-1">
                      {Math.round(predictionResult.scores.baseline * 100)}%
                    </div>
                  </div>
                </div>
              )}

              {/* Highlighted SHAP Tokens */}
              {predictionResult.explanation && predictionResult.explanation.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                    Word-Level Explainability Highlights
                  </span>
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs leading-relaxed flex flex-wrap gap-1.5">
                    {predictionResult.explanation.map((token, idx) => (
                      <span
                        key={idx}
                        className={`px-1.5 py-0.5 rounded font-mono transition-all ${
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
