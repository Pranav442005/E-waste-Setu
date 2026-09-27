import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { Package, ArrowLeftRight, Recycle, LogOut } from "lucide-react";
import { AppShell, DesktopNav } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { useI18n } from "@/hooks/use-i18n";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/recycler")({
  component: RecyclerLayout,
});

function RecyclerLayout() {
  const { t } = useI18n();
  const logout = useApp((s) => s.logout);
  const navigate = useNavigate();
  const nav = [
    { to: "/Recycler", label: t("navAvailable"), icon: Package },
    { to: "/Recycler/deal", label: t("navDeals"), icon: ArrowLeftRight },
    { to: "/Recycler/recycling", label: t("navRecycling"), icon: Recycle },
  ];
  return (
    <AppShell
      nav={nav}
      subtitle={t("roleRecycler")}
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
