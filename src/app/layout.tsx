import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://absycode.com"),
  title: { default: "AbsyCode — Websites & systems your business runs on", template: "%s · AbsyCode" },
  description: "AbsyCode builds fast websites, business systems, e-commerce, AI automation and client portals.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return children;
}
