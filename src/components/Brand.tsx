import logo from "@/assets/ewaste-setu-logo.png";
import { BRAND } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Brand({
  size = "md",
  withText = true,
  subtitle,
  className,
}: {
  size?: "sm" | "md" | "lg";
  withText?: boolean;
  subtitle?: string;
  className?: string;
}) {
  const box = size === "lg" ? "h-14 w-14" : size === "sm" ? "h-8 w-8" : "h-10 w-10";
  const text =
    size === "lg" ? "text-2xl" : size === "sm" ? "text-sm" : "text-base";
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <img
        src={logo}
        alt={BRAND}
        className={cn(box, "shrink-0 rounded-xl object-contain")}
      />
      {withText && (
        <div className="min-w-0">
          <p className={cn(text, "font-semibold tracking-tight text-foreground")}>
            {BRAND}
          </p>
          {subtitle && (
            <p className="truncate text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      )}
    </div>
  );
}
