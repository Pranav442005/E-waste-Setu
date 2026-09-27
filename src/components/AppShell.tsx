import type { ReactNode } from "react";
import { Link, useRouterState } from "@tanstack/react-router";
import { Brand } from "@/components/Brand";
import { LanguageSelect } from "@/components/LanguageSelect";
import { SafetyAssistant } from "@/components/SafetyAssistant";
import { VoiceAssistant } from "@/components/VoiceAssistant";
import { cn } from "@/lib/utils";

export type NavItem = {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

export function AppShell({
  nav,
  children,
  subtitle,
  headerRight,
}: {
  nav: NavItem[];
  children: ReactNode;
  subtitle?: string;
  headerRight?: ReactNode;
}) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-3 px-4 py-3">
          <Brand subtitle={subtitle} />
          <div className="flex items-center gap-2">
            {headerRight}
            <LanguageSelect compact />
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-5xl flex-1 px-4 pb-32 pt-5 md:pb-12">
        {children}
      </main>

      <div className="pointer-events-none fixed bottom-24 right-4 z-40 flex flex-col items-end gap-3 md:bottom-8">
        <div className="pointer-events-auto">
          <SafetyAssistant />
        </div>
        <div className="pointer-events-auto">
          <VoiceAssistant />
        </div>
      </div>

      <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-card md:sticky md:top-[65px] md:hidden">
        <div className="mx-auto flex max-w-5xl items-stretch justify-around">
          {nav.map((item) => {
            const active =
              pathname === item.to || pathname.startsWith(`${item.to}/`);
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className={cn(
                  "flex min-w-0 flex-1 flex-col items-center gap-1 px-1 py-2.5 text-[11px] font-medium",
                  active ? "text-primary" : "text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="w-full truncate text-center">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}

export function DesktopNav({ nav }: { nav: NavItem[] }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <nav className="mb-6 hidden flex-wrap gap-2 md:flex">
      {nav.map((item) => {
        const active = pathname === item.to || pathname.startsWith(`${item.to}/`);
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={cn(
              "inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground hover:bg-secondary/70",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

export function PageTitle({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <div className="mb-5 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">{title}</h1>
        {description && (
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {action}
    </div>
  );
}
