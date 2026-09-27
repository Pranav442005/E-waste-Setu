import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Recycle, ShieldCheck, Truck, Users, Building2 } from "lucide-react";
import { Brand } from "@/components/Brand";
import { LanguageSelect } from "@/components/LanguageSelect";
import { Card } from "@/components/ui/card";
import { useI18n } from "@/hooks/use-i18n";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "E_WASTE SETU — E-waste collection & traceability" },
      { name: "description", content: "Connect collectors with authorised recyclers. Create e-waste lots, negotiate and trace every kilogram." },
      { property: "og:title", content: "E_WASTE SETU — E-waste collection & traceability" },
      { property: "og:description", content: "Connect collectors with authorised recyclers and trace every lot." },
    ],
  }),
  component: Landing,
});

function Landing() {
  const { t } = useI18n();
  const roles = [
    { role: "collector", icon: Users, title: t("roleCollector"), text: t("collectorPitch") },
    { role: "Recycler", icon: Building2, title: t("roleRecycler"), text: t("RecyclerPitch") },
    { role: "admin", icon: ShieldCheck, title: t("roleAdmin"), text: t("adminConsole") },
  ] as const;
  return (
    <div className="min-h-screen bg-background">
      <header className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4">
        <Brand />
        <LanguageSelect compact />
      </header>
      <main className="mx-auto max-w-5xl px-4 pb-16">
        <section className="rounded-3xl bg-primary px-6 py-10 text-primary-foreground md:px-12 md:py-14">
          <Brand size="lg" withText={false} className="mb-5 [&_img]:bg-card [&_img]:p-1.5" />
          <h1 className="text-3xl font-semibold tracking-tight md:text-5xl">E_WASTE SETU</h1>
          <p className="mt-3 max-w-xl text-base opacity-90 md:text-lg">{t("tagline")}</p>
          <div className="mt-6 flex flex-wrap gap-4 text-sm opacity-90">
            <span className="inline-flex items-center gap-2"><Recycle className="h-4 w-4" />{t("recycling")}</span>
            <span className="inline-flex items-center gap-2"><Truck className="h-4 w-4" />{t("navDeal")}</span>
            <span className="inline-flex items-center gap-2"><ShieldCheck className="h-4 w-4" />{t("passport")}</span>
          </div>
        </section>
        <h2 className="mb-4 mt-8 text-lg font-semibold">{t("chooseRole")}</h2>
        <div className="grid gap-3 md:grid-cols-3">
          {roles.map((r) => (
            <Link key={r.role} to="/auth" search={{ role: r.role }}>
              <Card className="flex h-full items-start gap-4 p-5 transition-colors hover:border-primary">
                <div className="rounded-xl bg-secondary p-3 text-primary"><r.icon className="h-6 w-6" /></div>
                <div className="flex-1">
                  <p className="text-base font-semibold">{r.title}</p>
                  <p className="mt-1 text-sm text-muted-foreground">{r.text}</p>
                </div>
                <ArrowRight className="mt-1 h-5 w-5 text-muted-foreground" />
              </Card>
            </Link>
          ))}
        </div>
      </main>
    </div>
  );
}
