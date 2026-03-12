"use client";

import { Globe } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";
import {
  applyLanguage,
  getActiveLanguage,
  SITE_LANGUAGES,
  type LanguageCode,
} from "@/lib/site-language";

interface LanguageSwitcherProps {
  compact?: boolean;
  className?: string;
}

export function LanguageSwitcher({
  compact = false,
  className,
}: LanguageSwitcherProps) {
  const [language, setLanguage] = useState<LanguageCode>(() =>
    getActiveLanguage()
  );

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const nextLanguage = event.target.value as LanguageCode;
    setLanguage(nextLanguage);
    applyLanguage(nextLanguage);
  };

  return (
    <label
      className={cn(
        "relative inline-flex items-center overflow-hidden rounded-xl border border-border bg-background text-sm text-foreground",
        compact ? "h-9 px-2.5" : "h-10 px-3",
        className
      )}
    >
      <Globe className="mr-2 h-4 w-4 shrink-0 text-muted-foreground" />
      <select
        aria-label="Select language"
        className={cn(
          "bg-transparent pr-1 text-foreground outline-none",
          compact ? "text-xs" : "text-sm"
        )}
        value={language}
        onChange={handleChange}
      >
        {SITE_LANGUAGES.map((option) => (
          <option key={option.code} value={option.code}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
