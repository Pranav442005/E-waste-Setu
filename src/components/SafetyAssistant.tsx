import { HardHat, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useI18n } from "@/hooks/use-i18n";
import type { TKey } from "@/lib/i18n";

const TIPS: TKey[] = [
  "safety1",
  "safety2",
  "safety3",
  "safety4",
  "safety5",
  "safety6",
  "safety7",
];

export function SafetyAssistant() {
  const { t } = useI18n();
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          variant="outline"
          size="icon"
          aria-label={t("safetyAssistant")}
          className="h-11 w-11 rounded-full border-border bg-card shadow-sm"
        >
          <HardHat className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle className="flex items-center gap-2 text-lg">
            <ShieldCheck className="h-5 w-5 text-primary" />
            {t("safetyAssistant")}
          </SheetTitle>
          <SheetDescription className="sr-only">{t("safetyAssistant")}</SheetDescription>
        </SheetHeader>
        <ul className="space-y-3 px-4 pb-8">
          {TIPS.map((k) => (
            <li key={k} className="flex gap-3 text-base leading-relaxed">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
              <span>{t(k)}</span>
            </li>
          ))}
        </ul>
      </SheetContent>
    </Sheet>
  );
}
