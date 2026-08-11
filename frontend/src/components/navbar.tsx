"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ShieldCheck, History, BarChart3, LogIn, LogOut, UserCheck } from "lucide-react";
import { useEffect, useState } from "react";
import { getAuthToken, removeAuthToken } from "@/lib/api";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    queueMicrotask(() => {
      setIsAuthenticated(!!getAuthToken());
    });
  }, []);

  const handleLogout = () => {
    removeAuthToken();
    setIsAuthenticated(false);
    router.push("/login");
  };

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-slate-950/80 border-b border-slate-800/60 shadow-2xl shadow-cyan-950/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-purple-600/20 border border-cyan-500/30 group-hover:border-cyan-400/60 transition-all duration-300 shadow-lg shadow-cyan-500/10">
              <ShieldCheck className="w-6 h-6 text-cyan-400 group-hover:scale-110 transition-transform duration-300" />
            </div>
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-sky-300 to-purple-400 tracking-tight">
                Buzz
              </span>
              <span className="ml-2 text-xs px-2 py-0.5 rounded-full bg-cyan-950/80 text-cyan-400 border border-cyan-800/50 font-medium">
                AI v1.0
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              href="/"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === "/"
                  ? "bg-slate-800/90 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/5"
                  : "text-slate-300 hover:text-white hover:bg-slate-900/60"
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Analyzer</span>
            </Link>

            <Link
              href="/dashboard"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === "/dashboard"
                  ? "bg-slate-800/90 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/5"
                  : "text-slate-300 hover:text-white hover:bg-slate-900/60"
              }`}
            >
              <History className="w-4 h-4" />
              <span>History</span>
            </Link>

            <Link
              href="/admin"
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                pathname === "/admin"
                  ? "bg-slate-800/90 text-cyan-400 border border-cyan-500/30 shadow-md shadow-cyan-500/5"
                  : "text-slate-300 hover:text-white hover:bg-slate-900/60"
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Admin Stats</span>
            </Link>
          </nav>

          {/* Auth Controls */}
          <div className="flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                <span className="hidden sm:flex items-center text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
                  <UserCheck className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
                  Authenticated
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20 hover:bg-rose-500/20 transition-all duration-200"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/login"
                  className="flex items-center space-x-1.5 px-3.5 py-1.5 rounded-lg text-xs font-medium text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-700/50 transition-all duration-200"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>Login</span>
                </Link>
                <Link
                  href="/register"
                  className="px-3.5 py-1.5 rounded-lg text-xs font-medium bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg shadow-cyan-500/20 transition-all duration-200"
                >
                  Register
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
