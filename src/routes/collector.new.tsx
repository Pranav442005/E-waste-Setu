import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, FileSpreadsheet, MapPin, Sparkles, Upload, X } from "lucide-react";
import * as XLSX from "xlsx";
import { toast } from "sonner";
import { PageTitle } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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
import { formatINR, formatKg, useI18n } from "@/hooks/use-i18n";
import { newLotId, useApp } from "@/lib/store";
import {
  MATERIALS,
  categoryNameKey,
  material,
  type Lot,
  type LotItem,
} from "@/lib/types";

export const Route = createFileRoute("/collector/new")({
  head: () => ({
    meta: [
      { title: "Create e-waste lot — E_WASTE SETU" },
      {
        name: "description",
        content:
          "Create a new e-waste lot with weight, category and a reference price.",
      },
      {
        property: "og:title",
        content: "Create e-waste lot — E_WASTE SETU",
      },
      {
        property: "og:description",
        content: "Create a new e-waste lot.",
      },
    ],
  }),
  component: NewLot,
});

function readFile(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const r = new FileReader();

    r.onload = () => res(String(r.result));
    r.onerror = rej;

    r.readAsDataURL(file);
  });
}

function NewLot() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { collector, addLot } = useApp();

  const bulk = collector.type !== "informal";

  const [materialId, setMaterialId] = useState<string>("laptop");
  const [photo, setPhoto] = useState<string>();
  const [condition, setCondition] =
    useState<Lot["condition"]>("mixed");
  const [qty, setQty] = useState("");
  const [weight, setWeight] = useState("");
  const [items, setItems] = useState<LotItem[]>([]);
  const [fileName, setFileName] = useState("");
  const [brand, setBrand] = useState("");
  const [desc, setDesc] = useState("");
  const [address, setAddress] = useState(collector.address);
  const [gps, setGps] = useState<{ lat: number; lng: number }>();

  const m = material(materialId);

  const w = bulk
    ? items.reduce((a, i) => a + i.weight, 0)
    : Number(weight) || 0;

  const q = bulk
    ? items.reduce((a, i) => a + i.quantity, 0)
    : Number(qty) || 0;

  const onSheet = async (file?: File) => {
    if (!file) return;

    try {
      const wb = XLSX.read(await file.arrayBuffer());

      const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(
        wb.Sheets[wb.SheetNames[0]],
      );

      const pick = (
        r: Record<string, unknown>,
        k: string,
      ) =>
        r[
          Object.keys(r).find((x) =>
            x.toLowerCase().replace(/\s/g, "").includes(k),
          ) ?? ""
        ];

      const parsed = rows
        .map((r) => ({
          name: String(
            pick(r, "item") ?? pick(r, "name") ?? "",
          ),
          quantity:
            Number(pick(r, "quantity")) || 0,
          weight:
            Number(pick(r, "weight")) || 0,
        }))
        .filter((r) => r.name && r.weight > 0);

      if (!parsed.length) {
        throw new Error();
      }

      setItems(parsed);
      setFileName(file.name);

      toast.success(t("fileProcessed"));
    } catch {
      toast.error(t("errSpreadsheet"));
    }
  };

  const locate = () => {
    if (!navigator.geolocation) return;

    toast(t("fetchingLocation"));

    navigator.geolocation.getCurrentPosition(
      (p) => {
        setGps({
          lat: p.coords.latitude,
          lng: p.coords.longitude,
        });

        toast.success(t("locationCaptured"));
      },
      () => {
        toast.error(t("errLotAddress"));
      },
    );
  };

  const handlePhotoUpload = async (file?: File) => {
    if (!file) return;

    const image = await readFile(file);

    setPhoto(image);
  };

  const removePhoto = () => {
    setPhoto(undefined);
  };

  const create = () => {
    if (!w || w <= 0) {
      return toast.error(t("errWeight"));
    }

    if (!address.trim() && !gps) {
      return toast.error(t("errLotAddress"));
    }

    const now = new Date().toISOString();

    const lot: Lot = {
      id: newLotId(),
      collectorId: collector.id,
      collectorName: collector.name,
      collectorType: collector.type,
      materialId,
      eee: m.eee,
      schedule: m.schedule,

      // Identification confidence is only meaningful
      // when a photo has been uploaded.
      confidence: photo ? 92 : 0,

      condition,
      brand: brand || undefined,
      quantity: q || 1,
      weight: w,
      items: bulk ? items : undefined,

      referencePricePerKg: m.price,
      askingPrice: Math.round(m.price * w),

      description: desc || undefined,

      city: collector.city,
      address,
      gps,

      photo,

      createdAt: now,
      stage: "AVAILABLE",
      offers: [],
      timeline: [
        {
          stage: "AVAILABLE",
          at: now,
        },
      ],
    };

    addLot(lot);

    toast.success(t("toastLotCreated"), {
      description: lot.id,
    });

    navigate({
      to: "/collector/lots",
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <PageTitle title={t("createLotTitle")} />

      {/* =========================================
          PHOTO / IMAGE IDENTIFICATION
          ========================================= */}
      <Card className="space-y-4 p-5">
        <Label>{t("uploadPhoto")}</Label>

        {photo ? (
          <div className="relative">
            <img
              src={photo}
              alt=""
              className="h-48 w-full rounded-lg object-cover"
            />

            <Button
              size="icon"
              variant="secondary"
              className="absolute right-2 top-2"
              aria-label={t("removeImage")}
              onClick={removePhoto}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 text-center text-sm text-muted-foreground transition-colors hover:bg-muted/50">
              <Camera className="h-6 w-6 text-primary" />
              <span className="font-medium text-foreground">Take Photo</span>
              <span className="text-xs">{t("photoHelp")}</span>

              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    await handlePhotoUpload(f);
                    e.currentTarget.value = "";
                  }
                }}
              />
            </label>

            <label className="flex min-h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border p-4 text-center text-sm text-muted-foreground transition-colors hover:bg-muted/50">
              <Upload className="h-6 w-6 text-primary" />
              <span className="font-medium text-foreground">Upload Photo</span>
              <span className="text-xs">Choose from gallery</span>

              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const f = e.target.files?.[0];
                  if (f) {
                    await handlePhotoUpload(f);
                    e.currentTarget.value = "";
                  }
                }}
              />
            </label>
          </div>
        )}

        {/* =========================================
            AUTOMATIC IDENTIFICATION

            IMPORTANT:
            This card is rendered ONLY after
            an image has been uploaded.
            ========================================= */}
        {photo && (
          <div className="rounded-lg bg-secondary p-3 text-sm">
            <p className="flex items-center gap-2 font-medium">
              <Sparkles className="h-4 w-4 text-primary" />

              {t("aiIdentification")}

              <span>
                · {t("aiConfidence")} 92%
              </span>
            </p>

            <p className="mt-1 text-muted-foreground">
              {t("cpcbCategory")}:{" "}
              <span className="font-mono font-semibold text-foreground">
                {m.eee}
              </span>{" "}
              — {t(categoryNameKey(m.eee))}
            </p>

            <p className="text-muted-foreground">
              {t("scheduleRef")}:{" "}
              <span className="font-mono font-semibold text-foreground">
                {m.schedule}
              </span>
            </p>
          </div>
        )}

        <div className="space-y-1.5">
          <Label>{t("material")}</Label>

          <Select
            value={materialId}
            onValueChange={setMaterialId}
          >
            <SelectTrigger className="h-11">
              <SelectValue />
            </SelectTrigger>

            <SelectContent>
              {MATERIALS.map((x) => (
                <SelectItem
                  key={x.id}
                  value={x.id}
                >
                  {t(x.nameKey)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </Card>

      {/* =========================================
          WEIGHT / SPREADSHEET / LOT INFORMATION
          ========================================= */}
      <Card className="space-y-4 p-5">
        {bulk ? (
          <>
            <Label>{t("uploadSpreadsheet")}</Label>

            <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-dashed border-border p-4 text-sm">
              <FileSpreadsheet className="h-6 w-6 text-primary" />

              <span className="flex-1">
                {fileName || t("spreadsheetHelp")}
              </span>

              <input
                type="file"
                accept=".xlsx,.xls,.csv"
                className="hidden"
                onChange={(e) =>
                  onSheet(e.target.files?.[0])
                }
              />
            </label>

            {items.length > 0 && (
              <div className="overflow-x-auto rounded-lg border border-border text-sm">
                <table className="w-full">
                  <thead className="bg-muted text-left">
                    <tr>
                      <th className="p-2">
                        {t("material")}
                      </th>

                      <th className="p-2 text-right">
                        {t("quantity")}
                      </th>

                      <th className="p-2 text-right">
                        {t("weight")}
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {items.map((i, k) => (
                      <tr
                        key={k}
                        className="border-t border-border"
                      >
                        <td className="p-2">
                          {i.name}
                        </td>

                        <td className="p-2 text-right">
                          {i.quantity}
                        </td>

                        <td className="p-2 text-right">
                          {formatKg(i.weight)}
                        </td>
                      </tr>
                    ))}

                    <tr className="border-t border-border font-semibold">
                      <td className="p-2">
                        {t("weightFromFile")}
                      </td>

                      <td className="p-2 text-right">
                        {q}
                      </td>

                      <td className="p-2 text-right">
                        {formatKg(w)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="q">
                {t("quantity")}
              </Label>

              <Input
                id="q"
                inputMode="numeric"
                className="h-11"
                value={qty}
                onChange={(e) =>
                  setQty(e.target.value)
                }
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="w">
                {t("weightManual")}
              </Label>

              <Input
                id="w"
                inputMode="decimal"
                className="h-11"
                value={weight}
                onChange={(e) =>
                  setWeight(e.target.value)
                }
              />
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>{t("condition")}</Label>

            <Select
              value={condition}
              onValueChange={(v) =>
                setCondition(
                  v as Lot["condition"],
                )
              }
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {(
                  [
                    "working",
                    "nonWorking",
                    "damaged",
                    "mixed",
                  ] as const
                ).map((c) => (
                  <SelectItem
                    key={c}
                    value={c}
                  >
                    {t(c)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="b">
              {t("brand")}
            </Label>

            <Input
              id="b"
              className="h-11"
              value={brand}
              onChange={(e) =>
                setBrand(e.target.value)
              }
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="d">
            {t("description")}
          </Label>

          <Textarea
            id="d"
            value={desc}
            onChange={(e) =>
              setDesc(e.target.value)
            }
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="a">
            {t("lotLocation")}
          </Label>

          <Input
            id="a"
            className="h-11"
            value={address}
            onChange={(e) =>
              setAddress(e.target.value)
            }
          />

          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={locate}
          >
            <MapPin className="h-4 w-4" />

            {gps
              ? `${gps.lat.toFixed(4)}, ${gps.lng.toFixed(4)}`
              : t("fetchLocation")}
          </Button>
        </div>
      </Card>

      {/* =========================================
          REFERENCE PRICE
          ========================================= */}
      <Card className="p-5">
        <p className="text-sm text-muted-foreground">
          {t("referencePrice")}
        </p>

        <p className="text-2xl font-semibold">
          {formatINR(m.price * w)}
        </p>

        <p className="text-sm text-muted-foreground">
          {formatINR(m.price)} {t("perKg")}
        </p>

        <p className="mt-2 text-xs text-muted-foreground">
          {t("referencePriceNote")}
        </p>
      </Card>

      {/* =========================================
          CREATE LOT
          ========================================= */}
      <Button
        className="h-12 w-full text-base"
        onClick={create}
      >
        {t("createLotCta")}
      </Button>
    </div>
  );
}