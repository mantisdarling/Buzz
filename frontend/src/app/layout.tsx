import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Buzz — TruthLens - AI Powered Misinformation and Fake News Detector",
  description:
    "Buzz is an AI powered misinformation and fake news detector that uses a multi-model ensemble (DistilBERT, spaCy stylometry, and TF-IDF) to analyze content with word-level explainability.",
  keywords: ["Buzz", "TruthLens", "fake news", "misinformation", "AI", "fact check", "NLP"],
  openGraph: {
    title: "Buzz — TruthLens - AI Powered Misinformation and Fake News Detector",
    description: "TruthLens - AI Powered Misinformation and Fake News Detector",
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
