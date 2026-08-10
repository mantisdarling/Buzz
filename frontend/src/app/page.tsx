"use client";

import { useState } from "react";
import { Navbar } from "@/components/navbar";
import { VerdictChart } from "@/components/verdict-chart";
import { ExplanationHighlight } from "@/components/explanation-highlight";
import { api, PredictResponse } from "@/lib/api";
import {
  FileText,
  Link2,
  Sparkles,
  Loader2,
  AlertCircle,
  ThumbsUp,
  ThumbsDown,
  CheckCircle2,
  Zap,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function Home() {
  const [tab, setTab] = useState<"text" | "url">("text");
  const [textInput, setTextInput] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PredictResponse | null>(null);
  const [feedbackSent, setFeedbackSent] = useState<boolean | null>(null);

  const handleAnalyze = async () => {
    setError(null);
    setResult(null);
    setFeedbackSent(null);
    setLoading(true);

    try {
      const payload = tab === "text" ? { text: textInput } : { url: urlInput };
      const res = await api.predict(payload);
      setResult(res);
    } catch (err: any) {
      setError(err.message || "Failed to analyze submission.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (correct: boolean) => {
    if (!result?.submission_id) return;
    try {
      await api.submitFeedback(result.submission_id, correct);
      setFeedbackSent(correct);
    } catch (err) {
      console.error("Feedback failed", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
        {/* Hero Banner */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-800/60 text-cyan-400 text-xs font-semibold shadow-lg shadow-cyan-500/10">
            <Zap className="w-3.5 h-3.5" />
            <span>Multi-Model AI Misinformation Defense</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
            Verify Claims & News with AI Explainability
          </h1>

          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            Paste raw text or an article URL. TruthLens combines fine-tuned DistilBERT content classification, spaCy stylometry, and baseline n-gram models to deliver a unified verdict with word-level highlighted reasoning.
          </p>
        </div>

        {/* Analyzer Form Card */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-2xl shadow-cyan-950/20 backdrop-blur-xl space-y-6">
          {/* Tab Switcher */}
          <div className="flex p-1 rounded-2xl bg-slate-950/80 border border-slate-800 w-fit mx-auto">
            <button
              onClick={() => setTab("text")}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                tab === "text"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>Paste Raw Text</span>
            </button>

            <button
              onClick={() => setTab("url")}
              className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all duration-200 ${
                tab === "url"
                  ? "bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/20"
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Link2 className="w-4 h-4" />
              <span>Article URL</span>
            </button>
          </div>

          {/* Form Controls */}
          {tab === "text" ? (
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400 px-1">
                <span>Article content or claim snippet</span>
                <span>{textInput.length} / 50,000 characters</span>
              </div>
              <textarea
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                placeholder="Paste news article content, statement, or rumor text here (min 20 characters)..."
                rows={6}
                className="w-full p-4 rounded-2xl bg-slate-950/90 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder-slate-500 text-sm transition-all outline-none resize-y"
              />
            </div>
          ) : (
            <div className="space-y-2">
              <label className="text-xs text-slate-400 px-1">Article or news website URL</label>
              <input
                type="url"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/news/article-slug"
                className="w-full p-4 rounded-2xl bg-slate-950/90 border border-slate-800 focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 text-slate-100 placeholder-slate-500 text-sm transition-all outline-none"
              />
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center space-x-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleAnalyze}
            disabled={loading || (tab === "text" ? textInput.length < 20 : !urlInput)}
            className="w-full py-4 rounded-2xl font-bold text-sm bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 hover:from-cyan-400 hover:to-purple-500 text-white shadow-xl shadow-cyan-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Running Ensemble Inference...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Analyze Misinformation Signals</span>
              </>
            )}
          </button>
        </div>

        {/* Results Display Section */}
        <AnimatePresence>
          {result && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-2xl space-y-8"
            >
              {result.status === "pending" ? (
                <div className="p-8 text-center space-y-3">
                  <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
                  <h3 className="text-lg font-semibold">Article Scraping Queued</h3>
                  <p className="text-xs text-slate-400">
                    Your URL has been sent to our Celery worker task queue. Check your History page in a few seconds for the result.
                  </p>
                </div>
              ) : (
                <>
                  {/* Verdict & Signal Chart */}
                  <VerdictChart
                    scores={result.scores || { baseline: 0, style: 0, distilbert: 0 }}
                    overallConfidence={result.confidence || 0.5}
                    verdict={result.verdict || "Fake"}
                  />

                  {/* SHAP Explanation Tokens */}
                  <ExplanationHighlight tokens={result.explanation} />

                  {/* User Feedback Callout */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <span className="text-xs text-slate-400">
                      Was this AI verdict accurate? Help improve model precision:
                    </span>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleFeedback(true)}
                        className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          feedbackSent === true
                            ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                            : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                        }`}
                      >
                        <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Correct Verdict</span>
                      </button>

                      <button
                        onClick={() => handleFeedback(false)}
                        className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                          feedbackSent === false
                            ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                            : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                        }`}
                      >
                        <ThumbsDown className="w-3.5 h-3.5 text-rose-400" />
                        <span>Incorrect Verdict</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
