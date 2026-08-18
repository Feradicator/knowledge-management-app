"use client";

import React from "react";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { LearningStoreProvider } from "@/lib/store/learning-store";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem>
      <LearningStoreProvider>{children}</LearningStoreProvider>
    </NextThemesProvider>
  );
}
