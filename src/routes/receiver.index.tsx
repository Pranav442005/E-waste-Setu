import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { PageTitle } from "@/components/AppShell";
import { LotCard } from "@/components/LotCard";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/receiver/")({
  head: () => ({
    meta: [
      { title: "Available lots — E_WASTE SETU" },
      { name: "description", content: "Browse e-waste lots near you and make offers to collectors." },
      { property: "og:title", content: "Available lots — E_WASTE SETU" },
      { property: "og:description", content: "Browse e-waste lots and make offers." },
    ],
  }),
  component: ReceiverHome,
});

function ReceiverHome() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { receiver, lots, setActiveLot } = useApp();
  const available = lots.filter((l) => l.stage === "AVAILABLE" || (l.receiverId === receiver.id && ["OFFER_RECEIVED", "NEGOTIATING"].includes(l.stage)));
  const mine = lots.filter((l) => l.receiverId === receiver.id);
  const stats = [
    { label: t("availableLots"), value: lots.filter((l) => l.stage === "AVAILABLE").length },
    { label: t("activeDeals"), value: mine.filter((l) => l.stage !== "COMPLETED").length },
    { label: t("scheduledDeliveries"), value: mine.filter((l) => l.delivery && l.stage !== "COMPLETED").length },
  ];
  return (
    <div>
      <PageTitle title={receiver.orgName} description={`${t("processingCapacityShort")}: ${receiver.dailyCapacity} kg/day`} />
      <div className="mb-5 grid grid-cols-3 gap-3">
        {stats.map((s) => <Card key={s.label} className="p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-semibold">{s.value}</p></Card>)}
      </div>
      <h2 className="mb-3 font-semibold">{t("availableLots")}</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {available.map((l) => <LotCard key={l.id} lot={l} onOpen={() => { setActiveLot(l.id); navigate({ to: "/receiver/deal" }); }} />)}
        {!available.length && <p className="text-sm text-muted-foreground">{t("noAvailableLots")}</p>}
      </div>
    </div>
  );
}
