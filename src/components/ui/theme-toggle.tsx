"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Button } from "@/components/ui/button";

const subscribe = () => () => {};
const getMountedSnapshot = () => true;
const getServerSnapshot = () => false;

export function ThemeToggle() {
  const { resolvedTheme: theme, setTheme } = useTheme();
  const mounted = React.useSyncExternalStore(
    subscribe,
    getMountedSnapshot,
    getServerSnapshot
  );

  if (!mounted) {
    return null;
  }

  const isDark = theme === "dark";

  return (
    <Button
      type="button"
      variant="ghost"
      size="icon"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="border border-border transition-all duration-200 hover:bg-hover"
      aria-label="Toggle theme"
    >
      <Sun
        className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 absolute ${
          isDark ? "rotate-90 scale-0" : "rotate-0 scale-100"
        }`}
      />
      <Moon
        className={`h-[1.2rem] w-[1.2rem] transition-all duration-300 absolute ${
          isDark ? "rotate-0 scale-100" : "-rotate-90 scale-0"
        }`}
      />
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
