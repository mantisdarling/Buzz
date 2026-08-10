"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { ExplanationHighlight } from "@/components/explanation-highlight";
import { VerdictChart } from "@/components/verdict-chart";
import { api, SubmissionItem } from "@/lib/api";
import { History, ThumbsUp, ThumbsDown, Loader2, ChevronDown, ChevronUp, Link2, FileText, AlertCircle } from "lucide-react";

export default function DashboardPage() {
  const [items, setItems] = useState<SubmissionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [feedbackState, setFeedbackState] = useState<Record<number, boolean>>({});

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.getHistory(1, 50);
      setItems(res.items);
    } catch (err: any) {
      setError(err.message || "Failed to load history. Please sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleFeedback = async (id: number, correct: boolean) => {
    try {
      await api.submitFeedback(id, correct);
      setFeedbackState((prev) => ({ ...prev, [id]: correct }));
    } catch (err) {
      console.error("Failed to submit feedback", err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight flex items-center space-x-3">
              <History className="w-8 h-8 text-cyan-400" />
              <span>Submission History & Feedback</span>
            </h1>
            <p className="text-xs text-slate-400 mt-1">
              Review your past claims and submit feedback to improve model precision
            </p>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 mt-3">Loading history records...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-slate-900/40 border border-slate-800 space-y-3">
            <FileText className="w-10 h-10 text-slate-600 mx-auto" />
            <h3 className="text-base font-semibold">No Submissions Found</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              You haven&apos;t analyzed any articles or URLs yet. Head over to the Analyzer page to make your first submission.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => {
              const isExpanded = expandedId === item.id;
              const isReal = item.verdict === "Real";

              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-slate-900/70 border border-slate-800/80 overflow-hidden shadow-lg transition duration-200 hover:border-slate-700"
                >
                  {/* Header Row */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="p-5 flex items-center justify-between cursor-pointer select-none"
                  >
                    <div className="flex items-center space-x-4 min-w-0 flex-1">
                      <div className="p-2.5 rounded-xl bg-slate-800/80 border border-slate-700 text-slate-300">
                        {item.input_type === "url" ? <Link2 className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                      </div>

                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-slate-100 truncate">
                          {item.raw_url || item.text_content || "Submission #" + item.id}
                        </p>
                        <p className="text-xs text-slate-400 mt-0.5">
                          {new Date(item.created_at).toLocaleString()} • Type: {item.input_type.toUpperCase()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-4">
                      {item.verdict && (
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${
                            isReal
                              ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                              : "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                          }`}
                        >
                          {Math.round((item.confidence || 0.5) * 100)}% {item.verdict}
                        </span>
                      )}

                      <button className="text-slate-400 hover:text-slate-200">
                        {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  {/* Expanded Body */}
                  {isExpanded && (
                    <div className="p-6 border-t border-slate-800 bg-slate-950/40 space-y-6">
                      {item.scores && (
                        <VerdictChart
                          scores={item.scores}
                          overallConfidence={item.confidence || 0.5}
                          verdict={item.verdict || "Fake"}
                        />
                      )}

                      {item.explanation && <ExplanationHighlight tokens={item.explanation} />}

                      <div className="flex items-center justify-between pt-2">
                        <span className="text-xs text-slate-400">Rate verdict accuracy:</span>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => handleFeedback(item.id, true)}
                            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                              feedbackState[item.id] === true
                                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50"
                                : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                            }`}
                          >
                            <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Correct</span>
                          </button>

                          <button
                            onClick={() => handleFeedback(item.id, false)}
                            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border ${
                              feedbackState[item.id] === false
                                ? "bg-rose-500/20 text-rose-300 border-rose-500/50"
                                : "bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800"
                            }`}
                          >
                            <ThumbsDown className="w-3.5 h-3.5 text-rose-400" />
                            <span>Incorrect</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
