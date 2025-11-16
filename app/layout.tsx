import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agentic YouTube Automation for n8n",
  description: "AI endpoints and dashboard for YouTube automation integrated with n8n",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-zinc-50 text-zinc-900 antialiased">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <header className="mb-8">
            <h1 className="text-2xl font-bold">Agentic YouTube Automation</h1>
            <p className="text-sm text-zinc-600">n8n-ready AI endpoints for YouTube workflows</p>
          </header>
          {children}
        </div>
      </body>
    </html>
  );
}
