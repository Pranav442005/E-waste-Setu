import { Box, MapPin, Scale } from "lucide-react";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { formatINR, formatKg, useI18n } from "@/hooks/use-i18n";
import { categoryNameKey, material, type Lot } from "@/lib/types";

export function LotCard({ lot, onOpen }: { lot: Lot; onOpen: () => void }) {
  const { t } = useI18n();
  const m = material(lot.materialId);

  return (
    <Card
      role="button"
      tabIndex={0}
      onClick={onOpen}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onOpen();
        }
      }}
      className="cursor-pointer gap-0 p-4 transition-colors hover:border-primary/40 hover:bg-secondary/40"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="truncate text-base font-semibold">{t(m.nameKey)}</p>
          <p className="mt-0.5 font-mono text-xs text-muted-foreground">{lot.id}</p>
        </div>
        <StatusBadge stage={lot.stage} />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-sm text-muted-foreground">
        <span className="inline-flex items-center gap-1.5">
          <Scale className="h-4 w-4" />
          {formatKg(lot.weight)}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <Box className="h-4 w-4" />
          {lot.quantity}
        </span>
        <span className="inline-flex min-w-0 items-center gap-1.5">
          <MapPin className="h-4 w-4 shrink-0" />
          <span className="truncate">{lot.city}</span>
        </span>
      </div>

      <div className="mt-3 flex items-end justify-between gap-3 border-t border-border pt-3">
        <div>
          <p className="text-xs text-muted-foreground">{t("referencePrice")}</p>
          <p className="text-base font-semibold text-primary">
            {formatINR(lot.referencePricePerKg * lot.weight)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">{t("cpcbCategory")}</p>
          <p className="text-sm font-medium">
            <span className="font-mono">{lot.eee}</span>{" "}
            <span className="text-muted-foreground">·</span>{" "}
            <span className="font-mono">{lot.schedule}</span>
          </p>
        </div>
      </div>
      <p className="mt-2 line-clamp-1 text-xs text-muted-foreground">
        {t(categoryNameKey(lot.eee))}
      </p>
    </Card>
  );
}
