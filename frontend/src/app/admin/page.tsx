"use client";

import { useEffect, useState } from "react";
import { Navbar } from "@/components/navbar";
import { api, AdminStats } from "@/lib/api";
import {
  BarChart3,
  Users,
  FileCheck,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Globe,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  BarChart,
  Bar,
} from "recharts";

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    api
      .getAdminStats()
      .then((res) => {
        if (isMounted) {
          setStats(res);
          setLoading(false);
        }
      })
      .catch((err: unknown) => {
        if (isMounted) {
          const errorMsg =
            err instanceof Error ? err.message : "Failed to load admin statistics. Admin access required.";
          setError(errorMsg);
          setLoading(false);
        }
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        <div className="border-b border-slate-800 pb-6">
          <h1 className="text-3xl font-extrabold tracking-tight flex items-center space-x-3">
            <BarChart3 className="w-8 h-8 text-cyan-400" />
            <span>Admin Analytics & Governance</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Aggregate platform statistics, daily submission trends, accuracy rates, and flagged domains
          </p>
        </div>

        {loading ? (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-cyan-400 animate-spin mx-auto" />
            <p className="text-xs text-slate-400 mt-3">Loading aggregate telemetry...</p>
          </div>
        ) : error ? (
          <div className="p-6 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-sm flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        ) : stats ? (
          <>
            {/* Top Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Submissions</span>
                  <FileCheck className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-3xl font-extrabold text-slate-100">{stats.total_submissions}</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Registered Users</span>
                  <Users className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-3xl font-extrabold text-slate-100">{stats.total_users}</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">Total Feedback Received</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-extrabold text-slate-100">{stats.total_feedback}</div>
              </div>

              <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-2 shadow-lg">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="text-xs font-semibold uppercase tracking-wider">User Precision Rate</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-3xl font-extrabold text-emerald-400">{stats.positive_feedback_pct}%</div>
              </div>
            </div>

            {/* Daily Submission Volume Area Chart */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider">
                Daily Submission Volume (Last 30 Days)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.daily_volume}>
                    <defs>
                      <linearGradient id="volumeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                        <stop offset="95%" stopColor="#38bdf8" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" stroke="#64748b" tick={{ fontSize: 11 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: "#0f172a",
                        borderColor: "#334155",
                        borderRadius: "0.75rem",
                        color: "#f8fafc",
                      }}
                    />
                    <Area type="monotone" dataKey="count" stroke="#38bdf8" fillOpacity={1} fill="url(#volumeGrad)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Flagged Domains Bar Chart */}
            <div className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
              <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center space-x-2">
                <Globe className="w-4 h-4 text-rose-400" />
                <span>Top Flagged Misinformation Source Domains</span>
              </h3>
              {stats.top_flagged_domains.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No domain flags recorded yet.</p>
              ) : (
                <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={stats.top_flagged_domains}>
                      <XAxis dataKey="domain" stroke="#64748b" tick={{ fontSize: 11 }} />
                      <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "#0f172a",
                          borderColor: "#334155",
                          borderRadius: "0.75rem",
                          color: "#f8fafc",
                        }}
                      />
                      <Bar dataKey="count" fill="#f43f5e" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
