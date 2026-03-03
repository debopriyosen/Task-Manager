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
            {children}
          </TasksProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
