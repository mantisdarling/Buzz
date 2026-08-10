import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TruthLens — AI Misinformation Detector",
  description:
    "TruthLens uses a multi-model AI ensemble — DistilBERT, spaCy stylometry, and TF-IDF — to detect fake news and misinformation with word-level explanations.",
  keywords: ["fake news", "misinformation", "AI", "fact check", "NLP"],
  openGraph: {
    title: "TruthLens — AI Misinformation Detector",
    description: "Detect fake news and misinformation with AI-powered analysis.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans">{children}</body>
    </html>
  );
}
