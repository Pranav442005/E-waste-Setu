import { useState } from "react";
import {
  ArrowLeftRight,
  BadgeCheck,
  Banknote,
  CheckCircle2,
  Clock,
  FileText,
  Handshake,
  PackageCheck,
  Scale,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { StatusBadge } from "@/components/StatusBadge";
import { DealTimeline } from "@/components/DealTimeline";
import { formatDateTime, formatINR, formatKg, useI18n } from "@/hooks/use-i18n";
import { useApp, newInvoiceNo } from "@/lib/store";
import { material, stageIndex, type Lot } from "@/lib/types";

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Icon className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

export function DealView({ lot, side }: { lot: Lot; side: "collector" | "receiver" }) {
  const { t } = useI18n();
  const store = useApp();
  const m = material(lot.materialId);

  const [offerAmount, setOfferAmount] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [counterAmount, setCounterAmount] = useState("");
  const [logistic, setLogistic] = useState(lot.delivery?.logisticName ?? "");
  const [date, setDate] = useState(lot.delivery?.date ?? "");
  const [time, setTime] = useState(lot.delivery?.time ?? "");
  const [addr, setAddr] = useState(lot.delivery?.address ?? lot.address);
  const [contact, setContact] = useState(lot.delivery?.contact ?? "");
  const [verified, setVerified] = useState(String(lot.verifiedWeight ?? lot.weight));
  const [payMethod, setPayMethod] = useState<"upi" | "bank">(lot.paymentMethod ?? "upi");
  const [busy, setBusy] = useState<string | null>(null);

  const idx = stageIndex(lot.stage);
  const lastOffer = lot.offers[lot.offers.length - 1];
  const awaitingMe = lastOffer && lastOffer.by !== side && !lastOffer.outcome;

  const run = (key: string, fn: () => void, message: string) => {
    if (busy) return;
    setBusy(key);
    try {
      fn();
      toast.success(message);
    } finally {
      setTimeout(() => setBusy(null), 400);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-lg font-semibold">{t(m.nameKey)}</p>
              <p className="font-mono text-xs text-muted-foreground">{lot.id}</p>
            </div>
            <StatusBadge stage={lot.stage} />
          </div>
          <Row label={t("weight")} value={formatKg(lot.verifiedWeight ?? lot.weight)} />
          <Row label={t("quantity")} value={lot.quantity} />
          <Row
            label={t("cpcbCategory")}
            value={
              <span className="font-mono">
                {lot.eee} · {lot.schedule}
              </span>
            }
          />
          <Row
            label={t("referencePrice")}
            value={`${formatINR(lot.referencePricePerKg)} / ${t("perKg")}`}
          />
          {lot.agreedPrice != null && (
            <Row
              label={t("finalPrice")}
              value={
                <span className="text-primary">{formatINR(lot.agreedPrice)}</span>
              }
            />
          )}
          {lot.transactionId && (
            <Row
              label={t("transactionId")}
              value={<span className="font-mono">{lot.transactionId}</span>}
            />
          )}
          <p className="rounded-lg bg-secondary p-3 text-xs leading-relaxed text-secondary-foreground">
            {t("referencePriceNote")}
          </p>
        </CardContent>
      </Card>

      {/* Offers */}
      <Section icon={ArrowLeftRight} title={t("offerTimeline")}>
        {lot.offers.length === 0 && (
          <p className="text-sm text-muted-foreground">
            {side === "collector" ? t("waitingForOffer") : t("noOffers")}
          </p>
        )}
        <div className="space-y-3">
          {lot.offers.map((o) => (
            <div key={o.id} className="rounded-xl border border-border p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-sm font-medium">
                  {o.by === "receiver" ? t("offerFrom") : t("counterOfferFrom")} ·{" "}
                  {o.actorName}
                </p>
                <p className="text-base font-semibold text-primary">
                  {formatINR(o.amount)}
                </p>
              </div>
              {o.message && (
                <p className="mt-1 text-sm text-muted-foreground">{o.message}</p>
              )}
              <p className="mt-1 text-xs text-muted-foreground">
                {formatDateTime(o.at)}
                {o.outcome === "accepted" && ` · ${t("toastOfferAccepted")}`}
                {o.outcome === "declined" && ` · ${t("toastOfferDeclined")}`}
              </p>
            </div>
          ))}
        </div>

        {side === "receiver" && lot.stage === "AVAILABLE" && (
          <div className="space-y-3 border-t border-border pt-4">
            <div className="space-y-2">
              <Label htmlFor="offer">{t("offerAmount")}</Label>
              <Input
                id="offer"
                inputMode="numeric"
                value={offerAmount}
                onChange={(e) => setOfferAmount(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="offerMsg">{t("message")}</Label>
              <Textarea
                id="offerMsg"
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
              />
            </div>
            <Button
              className="h-12 w-full"
              disabled={busy === "offer"}
              onClick={() => {
                const amount = Number(offerAmount);
                if (!amount || amount <= 0) return toast.error(t("errAmount"));
                run(
                  "offer",
                  () => store.makeOffer(lot.id, amount, offerMessage),
                  t("toastOfferSubmitted"),
                );
              }}
            >
              {t("submitOffer")}
            </Button>
          </div>
        )}

        {awaitingMe && idx < stageIndex("DEAL_CONFIRMED") && (
          <div className="space-y-3 border-t border-border pt-4">
            <div className="flex gap-2">
              <Button
                className="h-12 flex-1"
                disabled={busy === "accept"}
                onClick={() =>
                  run(
                    "accept",
                    () => store.respondOffer(lot.id, lastOffer.id, "accepted"),
                    t("toastOfferAccepted"),
                  )
                }
              >
                {t("accept")}
              </Button>
              <Button
                variant="outline"
                className="h-12 flex-1"
                disabled={busy === "decline"}
                onClick={() =>
                  run(
                    "decline",
                    () => store.respondOffer(lot.id, lastOffer.id, "declined"),
                    t("toastOfferDeclined"),
                  )
                }
              >
                {t("decline")}
              </Button>
            </div>
            <div className="space-y-2">
              <Label htmlFor="counter">{t("counterOffer")}</Label>
              <Input
                id="counter"
                inputMode="numeric"
                value={counterAmount}
                onChange={(e) => setCounterAmount(e.target.value)}
                className="h-12"
              />
            </div>
            <Button
              variant="secondary"
              className="h-12 w-full"
              disabled={busy === "counter"}
              onClick={() => {
                const amount = Number(counterAmount);
                if (!amount || amount <= 0) return toast.error(t("errAmount"));
                run(
                  "counter",
                  () => store.counterOffer(lot.id, side, amount, ""),
                  t("toastCounterSubmitted"),
                );
                setCounterAmount("");
              }}
            >
              {t("sendCounterOffer")}
            </Button>
          </div>
        )}
      </Section>

      {/* Delivery scheduling */}
      {idx >= stageIndex("DEAL_CONFIRMED") && (
        <Section icon={Truck} title={t("scheduleDelivery")}>
          {lot.delivery ? (
            <>
              <Row label={t("logisticName")} value={lot.delivery.logisticName} />
              <Row label={t("deliveryDate")} value={lot.delivery.date} />
              <Row label={t("deliveryTime")} value={lot.delivery.time} />
              <Row label={t("deliveryAddress")} value={lot.delivery.address} />
              <Row label={t("contactNumber")} value={lot.delivery.contact} />
              <Row label={t("status")} value={<StatusBadge stage={lot.stage} />} />
            </>
          ) : side === "receiver" ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="logi">{t("logisticName")}</Label>
                <Input
                  id="logi"
                  value={logistic}
                  onChange={(e) => setLogistic(e.target.value)}
                  className="h-12"
                />
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="ddate">{t("deliveryDate")}</Label>
                  <Input
                    id="ddate"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-12"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dtime">{t("deliveryTime")}</Label>
                  <Input
                    id="dtime"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="h-12"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="daddr">{t("deliveryAddress")}</Label>
                <Textarea
                  id="daddr"
                  value={addr}
                  onChange={(e) => setAddr(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dcontact">{t("contactNumber")}</Label>
                <Input
                  id="dcontact"
                  inputMode="tel"
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  className="h-12"
                />
              </div>
              <Button
                className="h-12 w-full"
                disabled={busy === "sched"}
                onClick={() => {
                  if (!logistic.trim() || !date || !time || !addr.trim() || !contact.trim())
                    return toast.error(t("errSchedule"));
                  run(
                    "sched",
                    () =>
                      store.scheduleDelivery(lot.id, {
                        logisticName: logistic.trim(),
                        date,
                        time,
                        address: addr.trim(),
                        contact: contact.trim(),
                      }),
                    t("toastScheduled"),
                  );
                }}
              >
                {t("confirmSchedule")}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("waitingSchedule")}</p>
          )}

          {side === "collector" && lot.delivery && (
            <div className="space-y-2 border-t border-border pt-4">
              {lot.stage === "DELIVERY_SCHEDULED" && (
                <Button
                  className="h-12 w-full gap-2"
                  disabled={busy === "start"}
                  onClick={() =>
                    run(
                      "start",
                      () => store.advance(lot.id, "DELIVERY_STARTED"),
                      t("toastDeliveryStarted"),
                    )
                  }
                >
                  <Truck className="h-5 w-5" />
                  {busy === "start" ? t("loading") : t("startDelivery")}
                </Button>
              )}
              {lot.stage === "DELIVERY_STARTED" && (
                <Button
                  className="h-12 w-full"
                  disabled={busy === "transit"}
                  onClick={() =>
                    run(
                      "transit",
                      () => store.advance(lot.id, "IN_TRANSIT"),
                      t("toastInTransit"),
                    )
                  }
                >
                  {t("markInTransit")}
                </Button>
              )}
              {lot.stage === "IN_TRANSIT" && (
                <Button
                  className="h-12 w-full"
                  disabled={busy === "delivered"}
                  onClick={() =>
                    run(
                      "delivered",
                      () => store.advance(lot.id, "DELIVERED"),
                      t("toastDelivered"),
                    )
                  }
                >
                  {t("markDelivered")}
                </Button>
              )}
            </div>
          )}
        </Section>
      )}

      {/* Weight verification */}
      {idx >= stageIndex("DELIVERED") && (
        <Section icon={Scale} title={t("physicalVerification")}>
          <Row label={t("declaredWeight")} value={formatKg(lot.weight)} />
          {lot.verifiedWeight != null ? (
            <Row
              label={t("verifiedWeightLabel")}
              value={formatKg(lot.verifiedWeight)}
            />
          ) : side === "receiver" ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="vw">{t("verifiedWeightLabel")}</Label>
                <Input
                  id="vw"
                  inputMode="decimal"
                  value={verified}
                  onChange={(e) => setVerified(e.target.value)}
                  className="h-12"
                />
              </div>
              <Button
                className="h-12 w-full"
                disabled={busy === "weight"}
                onClick={() => {
                  const w = Number(verified);
                  if (!w || w <= 0) return toast.error(t("errWeight"));
                  run(
                    "weight",
                    () =>
                      store.advance(lot.id, "WEIGHT_VERIFIED", { verifiedWeight: w }),
                    t("toastWeightConfirmed"),
                  );
                }}
              >
                {t("verifyWeight")}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("waiting")}</p>
          )}
        </Section>
      )}

      {/* Handover */}
      {idx >= stageIndex("WEIGHT_VERIFIED") && (
        <Section icon={Handshake} title={t("handover")}>
          <Row
            label={t("handoverCollector")}
            value={lot.handoverCollector ? t("yes") : t("waiting")}
          />
          <Row
            label={t("handoverReceiver")}
            value={lot.handoverReceiver ? t("yes") : t("waiting")}
          />
          <p className="text-xs text-muted-foreground">{t("handoverHelp")}</p>
          {!(side === "collector" ? lot.handoverCollector : lot.handoverReceiver) && (
            <Button
              className="h-12 w-full"
              disabled={busy === "handover"}
              onClick={() =>
                run(
                  "handover",
                  () => store.confirmHandover(lot.id, side),
                  t("toastHandoverRecorded"),
                )
              }
            >
              {side === "collector" ? t("handoverCollector") : t("handoverReceiver")}
            </Button>
          )}
        </Section>
      )}

      {/* Payment */}
      {idx >= stageIndex("HANDOVER_CONFIRMED") && (
        <Section icon={Banknote} title={t("paymentVerification")}>
          <Row
            label={t("finalTransactionValue")}
            value={formatINR(lot.agreedPrice ?? 0)}
          />
          {lot.paymentMethod ? (
            <Row
              label={t("paymentMethod")}
              value={lot.paymentMethod === "upi" ? "UPI" : t("bankTransfer")}
            />
          ) : side === "receiver" ? (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>{t("paymentMethod")}</Label>
                <Select
                  value={payMethod}
                  onValueChange={(v) => setPayMethod(v as "upi" | "bank")}
                >
                  <SelectTrigger className="h-12">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="upi">UPI</SelectItem>
                    <SelectItem value="bank">{t("bankTransfer")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                className="h-12 w-full"
                disabled={busy === "pay"}
                onClick={() =>
                  run(
                    "pay",
                    () =>
                      store.advance(lot.id, "PAYMENT_VERIFIED", {
                        paymentMethod: payMethod,
                      }),
                    t("toastPaymentVerified"),
                  )
                }
              >
                {t("verifyPayment")}
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">{t("waitingPayment")}</p>
          )}
        </Section>
      )}

      {/* Completion */}
      {idx >= stageIndex("PAYMENT_VERIFIED") && (
        <Section icon={BadgeCheck} title={t("transactionSection")}>
          {lot.stage === "COMPLETED" ? (
            <div className="flex items-center gap-2 text-success">
              <CheckCircle2 className="h-5 w-5" />
              <p className="font-medium">{t("transactionCompleted")}</p>
            </div>
          ) : (
            <Button
              className="h-12 w-full gap-2"
              disabled={busy === "complete"}
              onClick={() =>
                run(
                  "complete",
                  () =>
                    store.advance(lot.id, "COMPLETED", {
                      invoiceNo: lot.invoiceNo ?? newInvoiceNo(),
                      completedAt: new Date().toISOString(),
                      recyclingStage: "received",
                    }),
                  t("toastCompleted"),
                )
              }
            >
              <PackageCheck className="h-5 w-5" />
              {t("completeTransaction")}
            </Button>
          )}
          {lot.stage === "COMPLETED" && (
            <div className="flex flex-col gap-2 sm:flex-row">
              <Button variant="outline" className="h-12 flex-1 gap-2" asChild>
                <Link to="/documents/$id" params={{ id: lot.id }} search={{ doc: "invoice" }}>
                  <FileText className="h-4 w-4" />
                  {t("viewInvoice")}
                </Link>
              </Button>
              <Button variant="outline" className="h-12 flex-1 gap-2" asChild>
                <Link to="/documents/$id" params={{ id: lot.id }} search={{ doc: "passport" }}>
                  <BadgeCheck className="h-4 w-4" />
                  {t("viewPassport")}
                </Link>
              </Button>
            </div>
          )}
        </Section>
      )}

      <Section icon={Clock} title={t("status")}>
        <DealTimeline lot={lot} />
      </Section>
    </div>
  );
}
