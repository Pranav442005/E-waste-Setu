import { createFileRoute, useRouter } from "@tanstack/react-router";
import { ArrowLeft, Printer } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { Brand } from "@/components/Brand";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { DealTimeline } from "@/components/DealTimeline";
import { formatDate, formatDateTime, formatINR, formatKg, useI18n } from "@/hooks/use-i18n";
import { useApp } from "@/lib/store";
import { categoryNameKey, material } from "@/lib/types";

type Doc = "invoice" | "passport" | "recycling";

export const Route = createFileRoute("/documents/$id")({
  validateSearch: (s: Record<string, unknown>): { doc: Doc } => ({
    doc: s.doc === "passport" || s.doc === "recycling" ? s.doc : "invoice",
  }),
  head: ({ params }) => ({
    meta: [
      { title: `${params.id} documents — E_WASTE SETU` },
      { name: "description", content: "Invoice, digital lot passport and recycling record for an e-waste lot." },
      { property: "og:title", content: `${params.id} — E_WASTE SETU` },
      { property: "og:description", content: "E-waste lot documents." },
    ],
  }),
  component: Documents,
});

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between gap-4 border-b border-border py-2 text-sm last:border-0"><span className="text-muted-foreground">{k}</span><span className="text-right font-medium">{v}</span></div>;
}

function Documents() {
  const { id } = Route.useParams();
  const { doc } = Route.useSearch();
  const { t } = useI18n();
  const router = useRouter();
  const { lots, collector, receiver } = useApp();
  const lot = lots.find((l) => l.id === id);
  const title = doc === "invoice" ? t("invoice") : doc === "passport" ? t("passport") : t("recyclingRecord");

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-6">
      <div className="mx-auto mb-4 flex max-w-2xl justify-between print:hidden">
        <Button variant="ghost" className="gap-2" onClick={() => router.history.back()}><ArrowLeft className="h-4 w-4" />{t("back")}</Button>
        <Button variant="outline" className="gap-2" onClick={() => window.print()}><Printer className="h-4 w-4" />{t("print")}</Button>
      </div>
      <Card className="mx-auto max-w-2xl p-6">
        <div className="mb-5 flex items-start justify-between gap-3 border-b border-border pb-4">
          <Brand size="sm" />
          <p className="text-right text-lg font-semibold">{title}</p>
        </div>
        {!lot || (doc !== "passport" && lot.stage !== "COMPLETED") ? (
          <p className="text-sm text-muted-foreground">{doc === "invoice" ? t("invoiceNotReady") : doc === "recycling" ? t("recyclingNotReady") : t("passportEmpty")}</p>
        ) : doc === "invoice" ? (
          <div>
            <Row k={t("invoiceNo")} v={lot.invoiceNo ?? "—"} />
            <Row k={t("date")} v={formatDate(lot.completedAt)} />
            <Row k={t("transactionId")} v={lot.transactionId} />
            <Row k={t("lotId")} v={lot.id} />
            <h3 className="mt-4 font-semibold">{t("collectorSection")}</h3>
            <Row k={t("fullName")} v={lot.collectorName} />
            <Row k={t("mobile")} v={collector.mobile} />
            <h3 className="mt-4 font-semibold">{t("receiverSection")}</h3>
            <Row k={t("orgName")} v={lot.receiverName} />
            <Row k={t("gst")} v={receiver.gst} />
            <Row k={t("authRef")} v={receiver.authRef} />
            <h3 className="mt-4 font-semibold">{t("ewasteDetails")}</h3>
            <Row k={t("material")} v={t(material(lot.materialId).nameKey)} />
            <Row k={t("eeeCode")} v={`${lot.eee} · ${lot.schedule}`} />
            <Row k={t("verifiedWeightLabel")} v={formatKg(lot.verifiedWeight ?? lot.weight)} />
            <h3 className="mt-4 font-semibold">{t("pricing")}</h3>
            <Row k={t("referencePrice")} v={formatINR(lot.referencePricePerKg * lot.weight)} />
            <Row k={t("finalTransactionValue")} v={<span className="text-lg">{formatINR(lot.agreedPrice ?? 0)}</span>} />
            <p className="mt-4 text-xs text-muted-foreground">{t("notTaxInvoice")}</p>
          </div>
        ) : doc === "passport" ? (
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <QRCodeSVG value={`EWASTE-SETU:${lot.id}:${lot.transactionId ?? ""}`} size={112} />
              <div className="text-sm">
                <p className="font-mono font-semibold">{lot.id}</p>
                <p className="text-muted-foreground">{lot.eee} · {t(categoryNameKey(lot.eee))}</p>
                <p className="text-muted-foreground">{formatKg(lot.verifiedWeight ?? lot.weight)}</p>
              </div>
            </div>
            <Row k={t("collectorSection")} v={lot.collectorName} />
            <Row k={t("receiverSection")} v={lot.receiverName ?? "—"} />
            <Row k={t("created")} v={formatDateTime(lot.createdAt)} />
            <DealTimeline lot={lot} />
          </div>
        ) : (
          <div>
            <Row k={t("recordId")} v={`REC-${lot.id.slice(4)}`} />
            <Row k={t("lotId")} v={lot.id} />
            <Row k={t("facility")} v={lot.receiverName} />
            <Row k={t("dateReceived")} v={formatDate(lot.completedAt)} />
            <Row k={t("status")} v={t(lot.recyclingStage === "recycled" ? "recycled" : lot.recyclingStage === "processing" ? "underProcessing" : "received")} />
            <p className="mt-4 text-xs text-muted-foreground">{t("recyclingDisclaimer")}</p>
          </div>
        )}
      </Card>
    </div>
  );
}
