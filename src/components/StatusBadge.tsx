import { Badge } from "@/components/ui/badge";
import { useI18n } from "@/hooks/use-i18n";
import { stageKey, type DealStage } from "@/lib/types";
import { cn } from "@/lib/utils";

const tone: Record<DealStage, string> = {
  AVAILABLE: "bg-secondary text-secondary-foreground",
  OFFER_RECEIVED: "bg-warning/15 text-warning-foreground",
  NEGOTIATING: "bg-warning/15 text-warning-foreground",
  DEAL_CONFIRMED: "bg-primary/10 text-primary",
  DELIVERY_SCHEDULED: "bg-primary/10 text-primary",
  DELIVERY_STARTED: "bg-primary/10 text-primary",
  IN_TRANSIT: "bg-primary/10 text-primary",
  DELIVERED: "bg-primary/10 text-primary",
  WEIGHT_VERIFIED: "bg-primary/10 text-primary",
  HANDOVER_CONFIRMED: "bg-primary/10 text-primary",
  PAYMENT_VERIFIED: "bg-success/15 text-success",
  COMPLETED: "bg-success/15 text-success",
};

export function StatusBadge({
  stage,
  className,
}: {
  stage: DealStage;
  className?: string;
}) {
  const { t } = useI18n();
  return (
    <Badge
      variant="secondary"
      className={cn("border-0 font-medium", tone[stage], className)}
    >
      {t(stageKey(stage))}
    </Badge>
  );
}
