import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Plus, Package, ArrowLeftRight, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { LotCard } from "@/components/LotCard";
import { StatusBadge } from "@/components/StatusBadge";
import { formatINR, useI18n } from "@/hooks/use-i18n";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/collector/")({
  head: () => ({
    meta: [
      { title: "Collector home — E_WASTE SETU" },
      { name: "description", content: "Create e-waste lots, follow your transactions and manage your profile." },
      { property: "og:title", content: "Collector home — E_WASTE SETU" },
      { property: "og:description", content: "Create e-waste lots and follow your transactions." },
    ],
  }),
  component: CollectorHome,
});

function CollectorHome() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { collector, lots, activeLotId, setActiveLot } = useApp();
  const mine = lots.filter((l) => l.collectorId === collector.id);
  const active = mine.find((l) => l.id === activeLotId) ?? mine.find((l) => l.stage !== "AVAILABLE" && l.stage !== "COMPLETED");
  const open = (id: string) => { setActiveLot(id); navigate({ to: "/collector/deal" }); };

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm text-muted-foreground">{t("welcome")}</p>
        <h1 className="text-2xl font-semibold">{collector.name}</h1>
      </div>
      <Link to="/collector/new">
        <Card className="flex items-center gap-4 border-0 bg-primary p-5 text-primary-foreground">
          <div className="rounded-xl bg-primary-foreground/15 p-3"><Plus className="h-7 w-7" /></div>
          <div>
            <p className="text-lg font-semibold">{t("createLot")}</p>
            <p className="text-sm opacity-85">{t("photoHelp")}</p>
          </div>
        </Card>
      </Link>
      <div className="grid grid-cols-2 gap-3">
        <Link to="/collector/lots"><Card className="flex items-center gap-3 p-4"><Package className="h-5 w-5 text-primary" /><div><p className="text-sm font-medium">{t("myLots")}</p><p className="text-xs text-muted-foreground">{mine.length}</p></div></Card></Link>
        <Link to="/collector/profile"><Card className="flex items-center gap-3 p-4"><User className="h-5 w-5 text-primary" /><p className="text-sm font-medium">{t("profile")}</p></Card></Link>
      </div>
      <section>
        <h2 className="mb-3 flex items-center gap-2 font-semibold"><ArrowLeftRight className="h-4 w-4 text-primary" />{t("currentTransaction")}</h2>
        {active ? (
          <Card className="p-4">
            <div className="flex items-center justify-between gap-2">
              <span className="font-mono text-sm">{active.id}</span>
              <StatusBadge stage={active.stage} />
            </div>
            {active.agreedPrice && <p className="mt-2 text-sm">{t("finalPrice")}: <b>{formatINR(active.agreedPrice)}</b></p>}
            <Button className="mt-3 h-11 w-full" onClick={() => open(active.id)}>{t("openDeal")}</Button>
          </Card>
        ) : (
          <Card className="p-4 text-sm text-muted-foreground">{t("selectLotFirst")}</Card>
        )}
      </section>
      <section>
        <h2 className="mb-3 font-semibold">{t("myLots")}</h2>
        <div className="grid gap-3 md:grid-cols-2">
          {mine.slice(0, 4).map((l) => <LotCard key={l.id} lot={l} onOpen={() => open(l.id)} />)}
          {!mine.length && <p className="text-sm text-muted-foreground">{t("noLots")}</p>}
        </div>
      </section>
    </div>
  );
}
