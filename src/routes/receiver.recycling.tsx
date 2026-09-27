import { createFileRoute, Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { PageTitle } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { formatKg, useI18n } from "@/hooks/use-i18n";
import { useApp } from "@/lib/store";
import type { RecyclingStage } from "@/lib/types";

export const Route = createFileRoute("/receiver/recycling")({
  head: () => ({
    meta: [
      { title: "Recycling records — E_WASTE SETU" },
      { name: "description", content: "Track received, processing and recycled e-waste lots." },
      { property: "og:title", content: "Recycling records — E_WASTE SETU" },
      { property: "og:description", content: "Recycling status of completed lots." },
    ],
  }),
  component: Recycling,
});

const stages: { s: RecyclingStage; k: "received" | "underProcessing" | "recycled" }[] = [
  { s: "received", k: "received" },
  { s: "processing", k: "underProcessing" },
  { s: "recycled", k: "recycled" },
];

function Recycling() {
  const { t } = useI18n();
  const { receiver, lots, setRecyclingStage } = useApp();
  const done = lots.filter((l) => l.receiverId === receiver.id && l.stage === "COMPLETED");
  return (
    <div>
      <PageTitle title={t("recyclingRecord")} description={t("recyclingDisclaimer")} />
      <div className="space-y-3">
        {done.map((l) => (
          <Card key={l.id} className="p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="font-mono text-sm font-semibold">{l.id}</span>
              <span className="text-sm text-muted-foreground">{formatKg(l.verifiedWeight ?? l.weight)} · {l.eee}</span>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {stages.map((x) => (
                <Button key={x.s} size="sm" variant={l.recyclingStage === x.s ? "default" : "outline"}
                  onClick={() => { setRecyclingStage(l.id, x.s); toast.success(t("toastRecyclingUpdated")); }}>
                  {t(x.k)}
                </Button>
              ))}
            </div>
            <Button variant="link" size="sm" className="mt-1 px-0" asChild>
              <Link to="/documents/$id" params={{ id: l.id }} search={{ doc: "recycling" }}>{t("viewDetails")}</Link>
            </Button>
          </Card>
        ))}
        {!done.length && <Card className="p-5 text-sm text-muted-foreground">{t("recyclingNotReady")}</Card>}
      </div>
    </div>
  );
}
