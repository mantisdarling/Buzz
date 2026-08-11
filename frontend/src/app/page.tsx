"use client";

import { Navbar } from "@/components/navbar";
import { HeroSection } from "@/components/hero-section";
import { ScrollytellingSection } from "@/components/scrollytelling-section";
import { BentoSection } from "@/components/bento-section";
import { PlaygroundSection } from "@/components/playground-section";
import { FooterSection } from "@/components/footer-section";

export default function Home() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1">
        <HeroSection />
        <ScrollytellingSection />
        <BentoSection />
        <PlaygroundSection />
      </main>

      <FooterSection />
    </div>
  );
}
