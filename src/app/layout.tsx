import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { Providers } from "@/provider";
// import { TooltipProvider } from "@/components/ui/tooltip";
import { Sidebar } from "@/components/Sidebar";
import { cn } from "@/lib/utils";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Hr Management Admin Dashboard",
  description: "Simple Hr Management admin dashboard using Prisma, Postgres, shadcn UI, Next.js",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={cn("min-h-screen bg-background text-foreground", geistSans.variable, geistMono.variable)}>
        <Providers>
          <div className="min-h-screen flex">
            <Sidebar /> 
            <main className="flex-1 p-6">
              {/* <TooltipProvider> */}
                {children}
              {/* </TooltipProvider> */}
              <Toaster richColors />
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}
