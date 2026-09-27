import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Plus } from "lucide-react";
import { PageTitle } from "@/components/AppShell";
import { LotCard } from "@/components/LotCard";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/use-i18n";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/collector/lots")({
  head: () => ({
    meta: [
      { title: "My lots — E_WASTE SETU" },
      { name: "description", content: "All e-waste lots you have created and their status." },
      { property: "og:title", content: "My lots — E_WASTE SETU" },
      { property: "og:description", content: "Your e-waste lots and their status." },
    ],
  }),
  component: MyLots,
});

function MyLots() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { collector, lots, setActiveLot } = useApp();
  const mine = lots.filter((l) => l.collectorId === collector.id);
  return (
    <div>
      <PageTitle
        title={t("myLots")}
        action={<Button asChild className="gap-2"><Link to="/collector/new"><Plus className="h-4 w-4" />{t("createLot")}</Link></Button>}
      />
      <div className="grid gap-3 md:grid-cols-2">
        {mine.map((l) => (
          <LotCard key={l.id} lot={l} onOpen={() => { setActiveLot(l.id); navigate({ to: "/collector/deal" }); }} />
        ))}
        {!mine.length && <p className="text-sm text-muted-foreground">{t("noLots")}</p>}
      </div>
    </div>
  );
}
