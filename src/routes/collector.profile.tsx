import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Camera, LogOut, MapPin, Pencil, Trash2, User } from "lucide-react";
import { toast } from "sonner";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LanguageSelect } from "@/components/LanguageSelect";
import { formatINR, formatKg, useI18n } from "@/hooks/use-i18n";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/collector/profile")({
  head: () => ({
    meta: [
      { title: "My profile — E_WASTE SETU" },
      { name: "description", content: "Your collector details, profile picture, activity and preferences." },
      { property: "og:title", content: "My profile — E_WASTE SETU" },
      { property: "og:description", content: "Collector profile on E_WASTE SETU." },
    ],
  }),
  component: Profile,
});

function Profile() {
  const { t } = useI18n();
  const navigate = useNavigate();
  const { collector, lots, updateCollector, setCollectorPhoto, logout } = useApp();
  const [edit, setEdit] = useState(false);
  const [form, setForm] = useState(collector);
  const mine = lots.filter((l) => l.collectorId === collector.id);
  const done = mine.filter((l) => l.stage === "COMPLETED");
  const typeLabel = collector.type === "informal" ? t("informalCollector") : collector.type === "institution" ? t("institution") : t("collectionCenter");
  const initials = collector.name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

  const onPhoto = (file?: File) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) return toast.error(t("errImageType"));
    const r = new FileReader();
    r.onload = () => { setCollectorPhoto(String(r.result)); toast.success(t("toastPhotoUpdated")); };
    r.readAsDataURL(file);
  };

  const stats = [
    { label: t("lotsCreated"), value: mine.length },
    { label: t("completedDeals"), value: done.length },
    { label: t("totalWeight"), value: formatKg(done.reduce((a, l) => a + (l.verifiedWeight ?? l.weight), 0)) },
    { label: t("totalEarnings"), value: formatINR(done.reduce((a, l) => a + (l.agreedPrice ?? 0), 0)) },
  ];

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <Card className="p-5">
        <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
          <Avatar className="h-24 w-24 border-2 border-primary/20">
            {collector.photo && <AvatarImage src={collector.photo} alt={collector.name} className="object-cover" />}
            <AvatarFallback className="bg-secondary text-2xl font-semibold text-primary">{initials || <User />}</AvatarFallback>
          </Avatar>
          <div className="flex-1">
            <h1 className="text-xl font-semibold">{collector.name}</h1>
            <p className="text-sm text-muted-foreground">{typeLabel}</p>
            <p className="mt-1 inline-flex items-center gap-1 text-sm text-muted-foreground"><MapPin className="h-4 w-4" />{collector.city}, {collector.state}</p>
          </div>
        </div>
        <div className="mt-4 flex flex-wrap justify-center gap-2 sm:justify-start">
          <Button variant="outline" size="sm" className="gap-2" asChild>
            <label>
              <Camera className="h-4 w-4" />{collector.photo ? t("changePicture") : t("uploadPicture")}
              <input type="file" accept="image/*" className="hidden" onChange={(e) => onPhoto(e.target.files?.[0])} />
            </label>
          </Button>
          {collector.photo && (
            <Button variant="outline" size="sm" className="gap-2" onClick={() => { setCollectorPhoto(undefined); toast.success(t("toastPhotoRemoved")); }}>
              <Trash2 className="h-4 w-4" />{t("removePicture")}
            </Button>
          )}
          <Button size="sm" className="gap-2" onClick={() => { setForm(collector); setEdit(!edit); }}>
            <Pencil className="h-4 w-4" />{t("editProfile")}
          </Button>
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 font-semibold">{t("profileInformation")}</h2>
        {edit ? (
          <div className="space-y-3">
            {(["name", "mobile", "email", "city", "state", "address", "upi"] as const).map((k) => (
              <div key={k} className="space-y-1.5">
                <Label htmlFor={k}>{t(k === "name" ? "fullName" : k === "address" ? "fullAddress" : k)}</Label>
                <Input id={k} className="h-11" value={form[k] ?? ""} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
              </div>
            ))}
            <div className="flex gap-2">
              <Button className="flex-1" onClick={() => { updateCollector(form); setEdit(false); toast.success(t("toastProfileSaved")); }}>{t("saveChanges")}</Button>
              <Button variant="outline" onClick={() => setEdit(false)}>{t("cancel")}</Button>
            </div>
          </div>
        ) : (
          <dl className="grid gap-3 text-sm sm:grid-cols-2">
            {[[t("mobile"), collector.mobile], [t("email"), collector.email], [t("address"), collector.address], [t("upi"), collector.upi || "—"], ["ID", collector.id]].map(([k, v]) => (
              <div key={k}><dt className="text-muted-foreground">{k}</dt><dd className="font-medium break-words">{v}</dd></div>
            ))}
          </dl>
        )}
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 font-semibold">{t("accountActivity")}</h2>
        <div className="grid grid-cols-2 gap-3">
          {stats.map((s) => <div key={s.label} className="rounded-lg bg-secondary p-3"><p className="text-xs text-muted-foreground">{s.label}</p><p className="text-lg font-semibold">{s.value}</p></div>)}
        </div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 font-semibold">{t("preferences")}</h2>
        <div className="flex items-center justify-between"><span className="text-sm">{t("language")}</span><LanguageSelect /></div>
      </Card>

      <Card className="p-5">
        <h2 className="mb-3 font-semibold">{t("accountActions")}</h2>
        <Button variant="outline" className="w-full gap-2 text-destructive" onClick={() => { logout(); navigate({ to: "/" }); }}><LogOut className="h-4 w-4" />{t("logout")}</Button>
      </Card>
    </div>
  );
}
