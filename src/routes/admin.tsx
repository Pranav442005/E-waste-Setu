import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { AlertTriangle, LogOut } from "lucide-react";
import { AppShell, PageTitle } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/StatusBadge";
import { formatINR, formatKg, useI18n } from "@/hooks/use-i18n";
import { useApp } from "@/lib/store";
import { EEE_CATEGORIES } from "@/lib/types";

export const Route = createFileRoute("/admin")({
  head: () => ({
    meta: [
      { title: "Admin console — E_WASTE SETU" },
      { name: "description", content: "Platform overview: lots, transactions, categories and anomaly monitoring." },
      { property: "og:title", content: "Admin console — E_WASTE SETU" },
      { property: "og:description", content: "E_WASTE SETU admin overview." },
    ],
  }),
  component: Admin,
});

function Admin() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { lots, logout } = useApp();
  const done = lots.filter((l) => l.stage === "COMPLETED");
  const stats = [
    { label: t("lots"), value: lots.length },
    { label: t("completedTransactions"), value: done.length },
    { label: t("totalEwasteWeight"), value: formatKg(lots.reduce((a, l) => a + l.weight, 0)) },
    { label: t("totalTransactionValue"), value: formatINR(done.reduce((a, l) => a + (l.agreedPrice ?? 0), 0)) },
  ];
  const max = Math.max(1, ...EEE_CATEGORIES.map((c) => lots.filter((l) => l.eee === c.code).length));
  const anomalies = lots.filter(
    (l) =>
      (l.verifiedWeight && Math.abs(l.verifiedWeight - l.weight) / l.weight > 0.1) ||
      (l.agreedPrice && Math.abs(l.agreedPrice - l.referencePricePerKg * l.weight) / (l.referencePricePerKg * l.weight) > 0.3),
  );
  return (
    <AppShell nav={[]} subtitle={t("roleAdmin")} headerRight={
      <Button variant="ghost" size="icon" aria-label={t("logout")} onClick={() => { logout(); navigate({ to: "/" }); }}><LogOut className="h-5 w-5" /></Button>
    }>
      <PageTitle title={t("adminDashboard")} />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats.map((s) => <Card key={s.label} className="p-4"><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-xl font-semibold">{s.value}</p></Card>)}
      </div>
      <Card className="mt-4 p-5">
        <h2 className="mb-3 font-semibold">{t("lotsByCategory")}</h2>
        <div className="space-y-2">
          {EEE_CATEGORIES.map((c) => {
            const n = lots.filter((l) => l.eee === c.code).length;
            return (
              <div key={c.code} className="flex items-center gap-3 text-sm">
                <span className="w-14 font-mono text-xs font-semibold">{c.code}</span>
                <div className="h-2 flex-1 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${(n / max) * 100}%` }} /></div>
                <span className="w-6 text-right">{n}</span>
              </div>
            );
          })}
        </div>
      </Card>
      <Card className="mt-4 p-5">
        <h2 className="mb-3 flex items-center gap-2 font-semibold"><AlertTriangle className="h-4 w-4 text-warning" />{t("anomalyMonitoring")}</h2>
        {anomalies.length ? anomalies.map((l) => <p key={l.id} className="font-mono text-sm">{l.id}</p>) : <p className="text-sm text-muted-foreground">{t("noRecords")}</p>}
      </Card>
      <Card className="mt-4 p-5">
        <h2 className="mb-3 font-semibold">{t("transactions")}</h2>
        <div className="space-y-2">
          {lots.map((l) => (
            <div key={l.id} className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2 text-sm last:border-0">
              <span className="font-mono">{l.id}</span>
              <span className="text-muted-foreground">{l.collectorName}</span>
              <StatusBadge stage={l.stage} />
            </div>
          ))}
        </div>
      </Card>
    </AppShell>
  );
}
