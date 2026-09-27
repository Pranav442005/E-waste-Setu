import { useCallback } from "react";
import { useApp } from "@/lib/store";
import { translate, type TKey, type Lang } from "@/lib/i18n";

export function useI18n() {
  const lang = useApp((s) => s.lang);
  const setLang = useApp((s) => s.setLang);
  const t = useCallback((key: TKey) => translate(lang, key), [lang]);
  return { lang: lang as Lang, setLang, t };
}

export function formatINR(value: number) {
  return `₹${Math.round(value).toLocaleString("en-IN")}`;
}

export function formatKg(value: number) {
  return `${Number(value.toFixed(2)).toLocaleString("en-IN")} kg`;
}

export function formatDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return d.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export function formatDateTime(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  return `${formatDate(iso)}, ${d.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}
