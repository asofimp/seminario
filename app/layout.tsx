import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryProvider } from "@/providers/query-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ciberseguridad con Inteligencia Artificial",
  description: "Encuestas en vivo",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`dark ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="app-bg relative flex min-h-full flex-col">
        <QueryProvider>
          <TooltipProvider>
            <div className="relative z-10 flex flex-1 flex-col">{children}</div>
          </TooltipProvider>
        </QueryProvider>
        <Toaster theme="dark" position="top-center" richColors />
      </body>
    </html>
  );
}
