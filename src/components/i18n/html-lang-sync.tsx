"use client";

import { useEffect } from "react";
import { getActiveLanguage, isRtlLanguage } from "@/lib/site-language";

export function HtmlLangSync() {
  useEffect(() => {
    const selected = getActiveLanguage();

    document.documentElement.lang = selected;
    document.documentElement.dir = isRtlLanguage(selected) ? "rtl" : "ltr";
  }, []);

  return null;
}
