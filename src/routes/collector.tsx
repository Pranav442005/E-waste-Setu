import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Home, Package, ArrowLeftRight, User, LogOut } from "lucide-react";
import { AppShell, DesktopNav } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/use-i18n";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/collector")({
  component: CollectorLayout,
});

function CollectorLayout() {
  const { t } = useI18n();
  const logout = useApp((s) => s.logout);
  const navigate = useNavigate();
  const nav = [
    { to: "/collector", label: t("navHome"), icon: Home },
    { to: "/collector/lots", label: t("navLots"), icon: Package },
    { to: "/collector/deal", label: t("navDeal"), icon: ArrowLeftRight },
    { to: "/collector/profile", label: t("navProfile"), icon: User },
  ];
  return (
    <AppShell
      nav={nav}
      subtitle={t("roleCollector")}
      headerRight={
        <Button variant="ghost" size="icon" aria-label={t("logout")} onClick={() => { logout(); navigate({ to: "/" }); }}>
          <LogOut className="h-5 w-5" />
        </Button>
      }
    >
      <DesktopNav nav={nav} />
      <Outlet />
    </AppShell>
  );
}
