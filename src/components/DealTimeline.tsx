import { Check } from "lucide-react";
import { formatDateTime, useI18n } from "@/hooks/use-i18n";
import { DEAL_STAGES, stageIndex, stageKey, type Lot } from "@/lib/types";
import { cn } from "@/lib/utils";

export function DealTimeline({ lot }: { lot: Lot }) {
  const { t } = useI18n();
  const current = stageIndex(lot.stage);

  return (
    <ol className="space-y-0">
      {DEAL_STAGES.map((stage, i) => {
        const done = i <= current;
        const at = lot.timeline.find((e) => e.stage === stage)?.at;
        return (
          <li key={stage} className="flex gap-3">
            <div className="flex flex-col items-center">
              <span
                className={cn(
                  "flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-[10px]",
                  done
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground",
                )}
              >
                {done ? <Check className="h-3.5 w-3.5" /> : i + 1}
              </span>
              {i < DEAL_STAGES.length - 1 && (
                <span
                  className={cn(
                    "w-px flex-1",
                    i < current ? "bg-primary" : "bg-border",
                  )}
                />
              )}
            </div>
            <div className="pb-4">
              <p
                className={cn(
                  "text-sm",
                  done ? "font-medium text-foreground" : "text-muted-foreground",
                )}
              >
                {t(stageKey(stage))}
              </p>
              {at && (
                <p className="text-xs text-muted-foreground">{formatDateTime(at)}</p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
