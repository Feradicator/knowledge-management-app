"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Sun, Moon, Laptop } from "lucide-react";
import { Button } from "./button";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground">
        <Sun className="h-4 w-4" />
      </Button>
    );
  }

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else if (theme === "light") {
      setTheme("system");
    } else {
      setTheme("dark");
    }
  };

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className="h-8 w-8 text-muted-foreground hover:text-foreground relative rounded-full"
      title={`Current theme: ${theme}. Click to switch.`}
    >
      {theme === "dark" && <Moon className="h-4 w-4 text-indigo-400 animate-in spin-in-180 duration-200" />}
      {theme === "light" && <Sun className="h-4 w-4 text-amber-500 animate-in spin-in-180 duration-200" />}
      {theme === "system" && <Laptop className="h-4 w-4 text-muted-foreground animate-in fade-in duration-200" />}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
