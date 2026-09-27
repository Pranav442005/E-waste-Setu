import { useRef, useState } from "react";
import { Mic, MessageCircleQuestion, Volume2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useI18n } from "@/hooks/use-i18n";
import { speechLocale, type TKey } from "@/lib/i18n";

type Demo = { q: Record<string, string>; a: TKey; match: string[] };

const DEMOS: Demo[] = [
  {
    q: {
      en: "How do I create a mobile phone lot?",
      hi: "मोबाइल फ़ोन का लॉट कैसे बनाऊँ?",
      mr: "मोबाईल फोनचा लॉट कसा तयार करू?",
    },
    a: "voiceA1",
    match: ["lot", "mobile", "phone", "बनाऊ", "लॉट", "मोबाइल", "मोबाईल", "तयार"],
  },
  {
    q: {
      en: "Is the reference price the final price?",
      hi: "क्या संदर्भ मूल्य ही अंतिम मूल्य है?",
      mr: "संदर्भ किंमत हीच अंतिम किंमत आहे का?",
    },
    a: "voiceA2",
    match: ["price", "reference", "final", "मूल्य", "कीमत", "किंमत", "संदर्भ", "अंतिम"],
  },
  {
    q: {
      en: "How does a receiver make an offer?",
      hi: "प्राप्तकर्ता ऑफ़र कैसे करता है?",
      mr: "प्राप्तकर्ता ऑफर कशी देतो?",
    },
    a: "voiceA3",
    match: ["offer", "bid", "ऑफ़र", "ऑफर", "बोली"],
  },
];

export function VoiceAssistant() {
  const { t, lang } = useI18n();
  const [heard, setHeard] = useState("");
  const [answer, setAnswer] = useState<TKey | null>(null);
  const [listening, setListening] = useState(false);
  const recRef = useRef<any>(null);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = speechLocale(lang);
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(u);
  };

  const resolve = (text: string) => {
    const lower = text.toLowerCase();
    const found = DEMOS.find((d) => d.match.some((m) => lower.includes(m.toLowerCase())));
    const key: TKey = found ? found.a : "voiceFallback";
    setAnswer(key);
    speak(t(key));
  };

  const listen = () => {
    const SR =
      typeof window !== "undefined" &&
      ((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition);
    if (!SR) {
      toast.error(t("errVoiceUnsupported"));
      return;
    }
    const rec = new SR();
    recRef.current = rec;
    rec.lang = speechLocale(lang);
    rec.interimResults = false;
    rec.maxAlternatives = 1;
    rec.onresult = (e: any) => {
      const text = e.results[0][0].transcript as string;
      setHeard(text);
      resolve(text);
    };
    rec.onerror = () => toast.error(t("errVoiceUnsupported"));
    rec.onend = () => setListening(false);
    setListening(true);
    setAnswer(null);
    setHeard("");
    rec.start();
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          size="icon"
          aria-label={t("askApp")}
          className="h-14 w-14 rounded-full shadow-lg"
        >
          <MessageCircleQuestion className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent side="bottom" className="rounded-t-2xl">
        <SheetHeader className="text-left">
          <SheetTitle className="text-lg">{t("askApp")}</SheetTitle>
          <SheetDescription>{t("voiceIntro")}</SheetDescription>
        </SheetHeader>

        <div className="space-y-4 px-4 pb-8">
          <Button onClick={listen} className="h-12 w-full gap-2 text-base">
            <Mic className="h-5 w-5" />
            {listening ? t("listening") : answer ? t("askAgain") : t("startVoice")}
          </Button>

          {heard && (
            <p className="text-sm text-muted-foreground">
              {t("youSaid")}: <span className="text-foreground">{heard}</span>
            </p>
          )}

          {answer && (
            <div className="rounded-xl bg-secondary p-4">
              <p className="flex gap-2 text-base leading-relaxed text-secondary-foreground">
                <Volume2 className="mt-1 h-4 w-4 shrink-0" />
                <span>{t(answer)}</span>
              </p>
            </div>
          )}

          <div className="space-y-2">
            {DEMOS.map((d) => (
              <button
                key={d.a}
                type="button"
                onClick={() => {
                  const q = d.q[lang] ?? d.q.en;
                  setHeard(q);
                  resolve(q);
                }}
                className="w-full rounded-xl border border-border bg-card px-4 py-3 text-left text-sm transition-colors hover:bg-secondary"
              >
                {d.q[lang] ?? d.q.en}
              </button>
            ))}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
