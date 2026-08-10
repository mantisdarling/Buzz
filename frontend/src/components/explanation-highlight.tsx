"use client";

import { useState } from "react";

interface Token {
  text: string;
  score: number;
}

interface ExplanationHighlightProps {
  tokens?: Token[];
}

export function ExplanationHighlight({ tokens }: ExplanationHighlightProps) {
  const [activeToken, setActiveToken] = useState<Token | null>(null);

  if (!tokens || tokens.length === 0) {
    return (
      <div className="p-4 rounded-xl bg-slate-900/50 border border-slate-800 text-slate-400 text-sm italic">
        No token attributions available for this submission.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-3">
        <span className="font-semibold uppercase tracking-wider">
          Explainability: Highlighted Reasoning Words
        </span>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-emerald-500/30 border border-emerald-500/60" />
            <span>Signals Real</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-3 rounded-full bg-rose-500/30 border border-rose-500/60" />
            <span>Signals Misinformation</span>
          </div>
        </div>
      </div>

      {/* Rendered Text with Highlights */}
      <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800/80 leading-relaxed text-sm font-sans tracking-wide text-slate-200 shadow-inner overflow-x-auto max-h-96">
        {tokens.map((token, idx) => {
          const score = token.score;
          const isPositive = score > 0.05;
          const isNegative = score < -0.05;

          let styleClass = "";
          if (isPositive) {
            styleClass =
              "bg-emerald-500/25 text-emerald-200 border-b-2 border-emerald-400/80 px-1 py-0.5 rounded cursor-pointer transition-all hover:bg-emerald-500/40";
          } else if (isNegative) {
            styleClass =
              "bg-rose-500/25 text-rose-200 border-b-2 border-rose-400/80 px-1 py-0.5 rounded cursor-pointer transition-all hover:bg-rose-500/40";
          }

          return (
            <span
              key={idx}
              className={styleClass}
              onMouseEnter={() => setActiveToken(token)}
              onMouseLeave={() => setActiveToken(null)}
              title={score !== 0 ? `SHAP Score: ${score > 0 ? "+" : ""}${score.toFixed(3)}` : undefined}
            >
              {token.text}
            </span>
          );
        })}
      </div>

      {/* Active Token Score Indicator */}
      {activeToken && activeToken.score !== 0 && (
        <div className="text-xs text-slate-300 bg-slate-800/90 border border-slate-700 px-3 py-1.5 rounded-lg inline-flex items-center space-x-2 animate-fade-in">
          <span className="font-semibold text-slate-100">&quot;{activeToken.text}&quot;</span>
          <span>attribution score:</span>
          <span
            className={`font-mono font-bold ${
              activeToken.score > 0 ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {activeToken.score > 0 ? "+" : ""}
            {activeToken.score.toFixed(4)}
          </span>
        </div>
      )}
    </div>
  );
}
