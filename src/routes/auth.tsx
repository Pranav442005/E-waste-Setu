import { useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Brand } from "@/components/Brand";
import { LanguageSelect } from "@/components/LanguageSelect";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useI18n } from "@/hooks/use-i18n";
import { useApp } from "@/lib/store";
import { EEE_CATEGORIES, type CollectorType, type EeeCode } from "@/lib/types";

type Role = "collector" | "Recycler" | "admin";

export const Route = createFileRoute("/auth")({
  validateSearch: (s: Record<string, unknown>): { role: Role } => ({
    role: s.role === "Recycler" || s.role === "admin" ? s.role : "collector",
  }),
  head: () => ({
    meta: [
      { title: "Sign in — E_WASTE SETU" },
      { name: "description", content: "Log in or create a collector or Recycler account on E_WASTE SETU." },
      { property: "og:title", content: "Sign in — E_WASTE SETU" },
      { property: "og:description", content: "Log in or sign up on E_WASTE SETU." },
    ],
  }),
  component: AuthPage,
});

const home = { collector: "/collector", Recycler: "/Recycler", admin: "/admin" } as const;

function F({ id, label, ...p }: { id: string; label: string } & React.ComponentProps<typeof Input>) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} className="h-11" {...p} />
    </div>
  );
}

function AuthPage() {
  const { role } = Route.useSearch();
  const { t } = useI18n();
  const nav = useNavigate();
  const { login, updateCollector, updateRecycler } = useApp();
  const [id, setId] = useState("");
  const [pw, setPw] = useState("");
  const [f, setF] = useState<Record<string, string>>({});
  const [ctype, setCtype] = useState<CollectorType>("informal");
  const [cats, setCats] = useState<EeeCode[]>([]);
  const [agree, setAgree] = useState(false);
  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });

  const go = () => {
    login(role);
    nav({ to: home[role] });
  };

  const doLogin = () => {
    if (!id || !pw) return toast.error(t("errCredentials"));
    go();
  };

  const doSignup = () => {
    const need = role === "collector" ? ["name", "mobile", "city"] : ["org", "contact", "mobile", "city"];
    if (need.some((k) => !f[k]?.trim())) return toast.error(t("errRequired"));
    if (!/^\d{10}$/.test(f.mobile)) return toast.error(t("errMobile"));
    if (f.email && !/^\S+@\S+\.\S+$/.test(f.email)) return toast.error(t("errEmail"));
    if (role === "Recycler" && !cats.length) return toast.error(t("errCategory"));
    if (!agree) return toast.error(t("errTerms"));
    if (role === "collector") {
      updateCollector({ name: f.name, mobile: f.mobile, email: f.email ?? "", city: f.city, address: f.address ?? "", type: ctype, upi: f.upi });
    } else {
      updateRecycler({ orgName: f.org, contactPerson: f.contact, mobile: f.mobile, email: f.email ?? "", city: f.city, address: f.address ?? "", gst: f.gst, authRef: f.auth, categories: cats });
    }
    toast.success(t("toastAccountCreated"));
    go();
  };

  const title = role === "collector" ? t("roleCollector") : role === "Recycler" ? t("roleRecycler") : t("roleAdmin");

  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-lg items-center justify-between px-4 py-4">
        <Brand size="sm" />
        <LanguageSelect compact />
      </header>
      <main className="mx-auto max-w-lg px-4 pb-16">
        <h1 className="mb-4 text-2xl font-semibold">{title}</h1>
        <Card className="p-5">
          <Tabs defaultValue="login">
            {role !== "admin" && (
              <TabsList className="mb-5 grid w-full grid-cols-2">
                <TabsTrigger value="login">{t("login")}</TabsTrigger>
                <TabsTrigger value="signup">{t("signUp")}</TabsTrigger>
              </TabsList>
            )}
            <TabsContent value="login" className="space-y-4">
              <F id="id" label={t("emailOrMobile")} value={id} onChange={(e) => setId(e.target.value)} />
              <F id="pw" type="password" label={t("password")} value={pw} onChange={(e) => setPw(e.target.value)} />
              <Button className="h-12 w-full text-base" onClick={doLogin}>{t("login")}</Button>
            </TabsContent>
            <TabsContent value="signup" className="space-y-4">
              {role === "collector" ? (
                <>
                  <F id="name" label={t("fullName")} onChange={set("name")} />
                  <div className="space-y-1.5">
                    <Label>{t("collectorType")}</Label>
                    <Select value={ctype} onValueChange={(v) => setCtype(v as CollectorType)}>
                      <SelectTrigger className="h-11"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="informal">{t("informalCollector")}</SelectItem>
                        <SelectItem value="institution">{t("institution")}</SelectItem>
                        <SelectItem value="center">{t("collectionCenter")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              ) : (
                <>
                  <F id="org" label={t("orgName")} onChange={set("org")} />
                  <F id="contact" label={t("contactPerson")} onChange={set("contact")} />
                </>
              )}
              <F id="mobile" inputMode="numeric" label={t("mobile")} onChange={set("mobile")} />
              <F id="email" type="email" label={`${t("email")} (${t("optional")})`} onChange={set("email")} />
              <F id="city" label={t("city")} onChange={set("city")} />
              <F id="address" label={t("fullAddress")} onChange={set("address")} />
              {role === "collector" ? (
                <F id="upi" label={`${t("upi")} (${t("optional")})`} onChange={set("upi")} />
              ) : (
                <>
                  <F id="gst" label={t("gst")} onChange={set("gst")} />
                  <F id="auth" label={t("authRef")} onChange={set("auth")} />
                  <div className="space-y-2">
                    <Label>{t("eeeCategories")}</Label>
                    <div className="grid gap-2">
                      {EEE_CATEGORIES.map((c) => (
                        <label key={c.code} className="flex items-center gap-3 rounded-lg border border-border p-3 text-sm">
                          <Checkbox
                            checked={cats.includes(c.code)}
                            onCheckedChange={(v) => setCats(v ? [...cats, c.code] : cats.filter((x) => x !== c.code))}
                          />
                          <span className="font-mono text-xs font-semibold">{c.code}</span>
                          <span>{t(c.nameKey)}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </>
              )}
              <label className="flex items-start gap-3 text-sm">
                <Checkbox checked={agree} onCheckedChange={(v) => setAgree(!!v)} className="mt-0.5" />
                {t("agreeTerms")}
              </label>
              <Button className="h-12 w-full text-base" onClick={doSignup}>
                {role === "collector" ? t("createCollectorAccount") : t("createRecyclerAccount")}
              </Button>
            </TabsContent>
          </Tabs>
        </Card>
      </main>
    </div>
  );
}
