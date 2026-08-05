import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import { MotionLayer } from "@/components/MotionLayer";
import "./globals.css";
import "./v3.css";

const inter = Inter({ subsets: ["latin", "cyrillic"], variable: "--font-inter" });
const mono = JetBrains_Mono({ subsets: ["latin", "cyrillic"], variable: "--font-mono" });

export const metadata: Metadata = {
  title: { default: "Web Radar — Live tactical intelligence", template: "%s · Web Radar" },
  description: "Fast, precise web-based radar for live match intelligence.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="ru" className={`${inter.variable} ${mono.variable}`}><body><MotionLayer />{children}</body></html>;
}
