import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "KnowledgeOS — Personal Learning & Technical Knowledge Management",
  description: "Organize technologies, track learning progress, write rich notes, manage handwritten notes, and create interactive mind maps.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} h-screen overflow-hidden`}>
        <Providers>
          <div className="flex h-screen w-screen overflow-hidden bg-background">
            <Sidebar />
            <div className="flex flex-1 flex-col overflow-hidden min-w-0 h-full">
              <Header />
              <main className="flex-1 overflow-y-auto min-w-0 h-full p-4 sm:p-6 lg:p-8 custom-scrollbar has-[[data-page-container=full-height]]:overflow-hidden has-[[data-page-container=full-height]]:p-4 sm:has-[[data-page-container=full-height]]:p-6 has-[[data-page-container=full-height]]:pb-2">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}
