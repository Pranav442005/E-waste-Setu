import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "@/components/AppShell";
import { DealView } from "@/components/DealView";
import { Card } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/hooks/use-i18n";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/collector/deal")({
  head: () => ({
    meta: [
      { title: "Transaction — E_WASTE SETU" },
      { name: "description", content: "Offers, delivery, weight check, handover and payment for your lot." },
      { property: "og:title", content: "Transaction — E_WASTE SETU" },
      { property: "og:description", content: "Follow each step of your e-waste transaction." },
    ],
  }),
  component: CollectorDeal,
});

function CollectorDeal() {
  const { t } = useI18n();
  const { collector, lots, activeLotId, setActiveLot } = useApp();
  const mine = lots.filter((l) => l.collectorId === collector.id);
  const lot = mine.find((l) => l.id === activeLotId);
  return (
    <div>
      <PageTitle title={t("deal")} />
      {mine.length > 0 && (
        <Select value={lot?.id ?? ""} onValueChange={setActiveLot}>
          <SelectTrigger className="mb-4 h-11"><SelectValue placeholder={t("lotId")} /></SelectTrigger>
          <SelectContent>
            {mine.map((l) => <SelectItem key={l.id} value={l.id}>{l.id}</SelectItem>)}
          </SelectContent>
        </Select>
      )}
      {lot ? <DealView lot={lot} side="collector" /> : <Card className="p-5 text-sm text-muted-foreground">{t("selectLotFirst")}</Card>}
    </div>
  );
}
