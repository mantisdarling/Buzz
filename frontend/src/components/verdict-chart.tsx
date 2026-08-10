"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";

interface VerdictChartProps {
  scores: {
    baseline: number;
    style: number;
    distilbert: number;
  };
  overallConfidence: number;
  verdict: "Real" | "Fake";
}

export function VerdictChart({ scores, overallConfidence, verdict }: VerdictChartProps) {
  const data = [
    {
      name: "DistilBERT Content",
      score: Math.round((scores.distilbert || 0) * 100),
      description: "Deep Transformer content classifier",
      color: "#38bdf8", // Sky blue
    },
    {
      name: "spaCy Style Signal",
      score: Math.round((scores.style || 0) * 100),
      description: "NER & Dependency parse stylometrics",
      color: "#a855f7", // Purple
    },
    {
      name: "TF-IDF Baseline",
      score: Math.round((scores.baseline || 0) * 100),
      description: "Classical keyword & ngram features",
      color: "#34d399", // Emerald
    },
  ];

  const confidencePct = Math.round(overallConfidence * 100);
  const isReal = verdict === "Real";

  return (
    <div className="space-y-6">
      {/* Overall Confidence Badge & Dial Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-inner">
        <div>
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
            Ensembled Confidence Target
          </span>
          <div className="flex items-center space-x-3 mt-1">
            <span
              className={`text-3xl font-extrabold tracking-tight ${
                isReal ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              {confidencePct}% {verdict}
            </span>
          </div>
        </div>

        <div className="mt-4 sm:mt-0 flex items-center space-x-2">
          <div
            className={`px-4 py-2 rounded-xl border text-sm font-semibold shadow-lg flex items-center space-x-2 ${
              isReal
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400 shadow-emerald-500/10"
                : "bg-rose-500/10 border-rose-500/30 text-rose-400 shadow-rose-500/10"
            }`}
          >
            <div
              className={`w-2.5 h-2.5 rounded-full animate-pulse ${
                isReal ? "bg-emerald-400" : "bg-rose-400"
              }`}
            />
            <span>Verified Verdict: {verdict.toUpperCase()}</span>
          </div>
        </div>
      </div>

      {/* Recharts Signal Breakdown */}
      <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/80">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-4">
          Individual Model Probability-of-Truth Scores
        </h4>

        <div className="h-52 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} layout="vertical" margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
              <XAxis type="number" domain={[0, 100]} stroke="#64748b" tickFormatter={(v) => `${v}%`} />
              <YAxis type="category" dataKey="name" stroke="#94a3b8" width={140} tick={{ fontSize: 12 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "#0f172a",
                  borderColor: "#334155",
                  borderRadius: "0.75rem",
                  color: "#f8fafc",
                }}
                formatter={(value: any) => [`${value}% Probability of Real`, "Score"]}
              />
              <Bar dataKey="score" radius={[0, 8, 8, 0]}>
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
