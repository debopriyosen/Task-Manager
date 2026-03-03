import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { TasksProvider } from "@/contexts/TasksContext";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Planora",
  description: "Modern, minimal, AI-powered task planning web application.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} min-h-screen bg-background font-sans antialiased text-foreground`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TasksProvider>
            {/* Ambient Background Orbs */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
              <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary-500/20 dark:bg-primary-600/10 blur-[100px] animate-pulse-slow" />
              <div className="absolute bottom-[-10%] right-[-10%] w-[30%] h-[30%] rounded-full bg-indigo-500/20 dark:bg-indigo-600/10 blur-[100px] animate-pulse-slow" style={{ animationDelay: '2s' }} />
            </div>
            {children}
          </TasksProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
