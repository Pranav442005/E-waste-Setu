// import { createFileRoute } from "@tanstack/react-router";
// import { PageTitle } from "@/components/AppShell";
// import { DealView } from "@/components/DealView";
// import { Card } from "@/components/ui/card";
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// import { useI18n } from "@/hooks/use-i18n";
// import { useApp } from "@/lib/store";

// export const Route = createFileRoute("/receiver/deal")({
//   head: () => ({
//     meta: [
//       { title: "My deals — E_WASTE SETU" },
//       { name: "description", content: "Make offers, schedule delivery, verify weight and confirm payment." },
//       { property: "og:title", content: "My deals — E_WASTE SETU" },
//       { property: "og:description", content: "Manage your e-waste deals." },
//     ],
//   }),
//   component: RecyclerDeal,
// });

// function RecyclerDeal() {
//   const { t } = useI18n();
//   const { Recycler, lots, activeLotId, setActiveLot } = useApp();
//   const options = lots.filter((l) => l.stage === "AVAILABLE" || l.RecyclerId === Recycler.id);
//   const lot = options.find((l) => l.id === activeLotId);
//   return (
//     <div>
//       <PageTitle title={t("navDeals")} />
//       {options.length > 0 && (
//         <Select value={lot?.id ?? ""} onValueChange={setActiveLot}>
//           <SelectTrigger className="mb-4 h-11"><SelectValue placeholder={t("lotId")} /></SelectTrigger>
//           <SelectContent>{options.map((l) => <SelectItem key={l.id} value={l.id}>{l.id}</SelectItem>)}</SelectContent>
//         </Select>
//       )}
//       {lot ? <DealView lot={lot} side="Recycler" /> : <Card className="p-5 text-sm text-muted-foreground">{t("selectLotFirst")}</Card>}
//     </div>
//   );
// }


import { createFileRoute } from "@tanstack/react-router";
import { PageTitle } from "@/components/AppShell";
import { DealView } from "@/components/DealView";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useI18n } from "@/hooks/use-i18n";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/recycler/deal")({
  head: () => ({
    meta: [
      {
        title: "My deals — E_WASTE SETU",
      },
      {
        name: "description",
        content:
          "Make offers, schedule delivery, verify weight and confirm payment.",
      },
      {
        property: "og:title",
        content: "My deals — E_WASTE SETU",
      },
      {
        property: "og:description",
        content: "Manage your e-waste deals.",
      },
    ],
  }),

  component: RecyclerDeal,
});

function RecyclerDeal() {
  const { t } = useI18n();

  const {
    Recycler,
    lots,
    activeLotId,
    setActiveLot,
  } = useApp();

  const options = lots.filter(
    (lot) =>
      lot.stage === "AVAILABLE" ||
      lot.RecyclerId === Recycler.id,
  );

  const lot = options.find(
    (item) => item.id === activeLotId,
  );

  return (
    <div>
      <PageTitle title={t("navDeals")} />

      {options.length > 0 && (
        <Select
          value={lot?.id ?? ""}
          onValueChange={setActiveLot}
        >
          <SelectTrigger className="mb-4 h-11">
            <SelectValue
              placeholder={t("lotId")}
            />
          </SelectTrigger>

          <SelectContent>
            {options.map((item) => (
              <SelectItem
                key={item.id}
                value={item.id}
              >
                {item.id}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      )}

      {lot ? (
        <DealView
          lot={lot}
          side="Recycler"
        />
      ) : (
        <Card className="p-5 text-sm text-muted-foreground">
          {options.length === 0
            ? t("noAvailableLots")
            : t("selectLotFirst")}
        </Card>
      )}
    </div>
  );
}