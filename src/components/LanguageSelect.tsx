import { Languages } from "lucide-react";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { LANGS, translate, type Lang } from "@/lib/i18n";
import { useI18n } from "@/hooks/use-i18n";

export function LanguageSelect({ compact = false }: { compact?: boolean }) {
  const { lang, setLang } = useI18n();

  return (
    <Select
      value={lang}
      onValueChange={(value) => {
        const next = value as Lang;
        setLang(next);
        toast.success(translate(next, "toastLanguageChanged"));
      }}
    >
      <SelectTrigger
        aria-label={translate(lang, "language")}
        className={compact ? "h-10 w-[104px]" : "h-11 w-full"}
      >
        <Languages className="h-4 w-4 shrink-0 text-muted-foreground" />
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {LANGS.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            {l.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
