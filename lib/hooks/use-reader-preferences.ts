"use client";

import { useState, useEffect } from "react";

export type ReaderTheme = "day" | "night" | "sepia";
export type ReaderFontSize = "sm" | "base" | "lg" | "xl" | "2xl";

export function useReaderPreferences() {
  const [readerTheme, setReaderTheme] = useState<ReaderTheme>("day");
  const [readerFontSize, setReaderFontSize] = useState<ReaderFontSize>("base");
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem("knowledgeos_reader_theme") as ReaderTheme;
      const savedSize = localStorage.getItem("knowledgeos_reader_fontsize") as ReaderFontSize;
      if (savedTheme && ["day", "night", "sepia"].includes(savedTheme)) {
        setReaderTheme(savedTheme);
      }
      if (savedSize && ["sm", "base", "lg", "xl", "2xl"].includes(savedSize)) {
        setReaderFontSize(savedSize);
      }
    } catch {
      // Ignore localStorage errors
    }
    setIsLoaded(true);
  }, []);

  const updateTheme = (theme: ReaderTheme) => {
    setReaderTheme(theme);
    try {
      localStorage.setItem("knowledgeos_reader_theme", theme);
    } catch {}
  };

  const updateFontSize = (size: ReaderFontSize) => {
    setReaderFontSize(size);
    try {
      localStorage.setItem("knowledgeos_reader_fontsize", size);
    } catch {}
  };

  const increaseFontSize = () => {
    const sizes: ReaderFontSize[] = ["sm", "base", "lg", "xl", "2xl"];
    const currentIndex = sizes.indexOf(readerFontSize);
    if (currentIndex < sizes.length - 1) {
      updateFontSize(sizes[currentIndex + 1]);
    }
  };

  const decreaseFontSize = () => {
    const sizes: ReaderFontSize[] = ["sm", "base", "lg", "xl", "2xl"];
    const currentIndex = sizes.indexOf(readerFontSize);
    if (currentIndex > 0) {
      updateFontSize(sizes[currentIndex - 1]);
    }
  };

  // Helper classes for container styling based on theme
  const getThemeContainerClass = () => {
    switch (readerTheme) {
      case "day":
        return "bg-white text-slate-900 border-slate-200/90 shadow-sm";
      case "sepia":
        return "bg-[#fbf0d9] text-[#433422] border-[#ebd9b8] shadow-sm";
      case "night":
      default:
        return "bg-[#0d1117] text-slate-100 border-slate-800/80 shadow-sm";
    }
  };

  // Helper classes for prose content
  const getProseClass = () => {
    switch (readerTheme) {
      case "day":
        return "prose-slate text-slate-900 prose-headings:text-slate-900 prose-p:text-slate-800 prose-strong:text-slate-950 prose-code:text-slate-900 prose-code:bg-slate-100";
      case "sepia":
        return "prose-stone text-[#433422] prose-headings:text-[#2b1f13] prose-p:text-[#433422] prose-strong:text-[#2b1f13] prose-code:text-[#3d2c1c] prose-code:bg-[#eedfc2]";
      case "night":
      default:
        return "prose-invert text-slate-100 prose-headings:text-slate-100 prose-p:text-slate-200 prose-strong:text-white prose-code:text-slate-200 prose-code:bg-slate-800/80";
    }
  };

  // Helper classes for font size
  const getFontSizeClass = () => {
    switch (readerFontSize) {
      case "sm":
        return "text-[13.5px] leading-relaxed";
      case "lg":
        return "text-[17.5px] leading-relaxed";
      case "xl":
        return "text-[19.5px] leading-loose";
      case "2xl":
        return "text-[22px] leading-loose";
      case "base":
      default:
        return "text-[15.5px] leading-relaxed";
    }
  };

  const getFontSizeLabel = () => {
    switch (readerFontSize) {
      case "sm":
        return "Small (14px)";
      case "lg":
        return "Large (18px)";
      case "xl":
        return "XL (20px)";
      case "2xl":
        return "2XL (22px)";
      case "base":
      default:
        return "Default (16px)";
    }
  };

  return {
    readerTheme,
    readerFontSize,
    updateTheme,
    updateFontSize,
    increaseFontSize,
    decreaseFontSize,
    getThemeContainerClass,
    getProseClass,
    getFontSizeClass,
    getFontSizeLabel,
    isLoaded,
  };
}
