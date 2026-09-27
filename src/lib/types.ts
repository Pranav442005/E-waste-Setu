import type { TKey } from "./i18n";

export type Role = "collector" | "receiver" | "admin";

export type CollectorType = "informal" | "institution" | "center";

export const EEE_CATEGORIES = [
  { code: "ITEW", nameKey: "cat_ITEW" },
  { code: "CEEW", nameKey: "cat_CEEW" },
  { code: "LSEEW", nameKey: "cat_LSEEW" },
  { code: "EETW", nameKey: "cat_EETW" },
  { code: "TLSEW", nameKey: "cat_TLSEW" },
  { code: "MDW", nameKey: "cat_MDW" },
  { code: "LIW", nameKey: "cat_LIW" },
] as const satisfies ReadonlyArray<{ code: string; nameKey: TKey }>;

export type EeeCode = (typeof EEE_CATEGORIES)[number]["code"];

export function categoryNameKey(code: string): TKey {
  return (EEE_CATEGORIES.find((c) => c.code === code)?.nameKey ?? "cat_ITEW") as TKey;
}

export const MATERIALS = [
  { id: "laptop", nameKey: "mat_laptop", eee: "ITEW", schedule: "ITEW3", price: 220 },
  { id: "desktop", nameKey: "mat_desktop", eee: "ITEW", schedule: "ITEW2", price: 180 },
  { id: "mobile", nameKey: "mat_mobile", eee: "ITEW", schedule: "ITEW15", price: 260 },
  { id: "printer", nameKey: "mat_printer", eee: "ITEW", schedule: "ITEW7", price: 95 },
  { id: "monitor", nameKey: "mat_monitor", eee: "CEEW", schedule: "CEEW2", price: 110 },
  { id: "battery", nameKey: "mat_battery", eee: "LSEEW", schedule: "LSEEW8", price: 75 },
  { id: "pcb", nameKey: "mat_pcb", eee: "ITEW", schedule: "ITEW4", price: 320 },
  { id: "server", nameKey: "mat_server", eee: "ITEW", schedule: "ITEW5", price: 240 },
] as const satisfies ReadonlyArray<{
  id: string;
  nameKey: TKey;
  eee: EeeCode;
  schedule: string;
  price: number;
}>;

export type MaterialId = (typeof MATERIALS)[number]["id"];

export function material(id: string) {
  return MATERIALS.find((m) => m.id === id) ?? MATERIALS[0];
}

export const DEAL_STAGES = [
  "AVAILABLE",
  "OFFER_RECEIVED",
  "NEGOTIATING",
  "DEAL_CONFIRMED",
  "DELIVERY_SCHEDULED",
  "DELIVERY_STARTED",
  "IN_TRANSIT",
  "DELIVERED",
  "WEIGHT_VERIFIED",
  "HANDOVER_CONFIRMED",
  "PAYMENT_VERIFIED",
  "COMPLETED",
] as const;

export type DealStage = (typeof DEAL_STAGES)[number];

export function stageKey(stage: DealStage): TKey {
  return `st_${stage}` as TKey;
}

export function stageIndex(stage: DealStage) {
  return DEAL_STAGES.indexOf(stage);
}

export type LotItem = {
  name: string;
  quantity: number;
  weight: number;
};

export type OfferEntry = {
  id: string;
  by: "receiver" | "collector";
  actorName: string;
  amount: number;
  message?: string;
  at: string;
  outcome?: "accepted" | "declined";
};

export type Delivery = {
  logisticName: string;
  date: string;
  time: string;
  address: string;
  contact: string;
};

export type RecyclingStage = "received" | "processing" | "recycled";

export type Lot = {
  id: string;
  collectorId: string;
  collectorName: string;
  collectorType: CollectorType;
  materialId: string;
  eee: EeeCode;
  schedule: string;
  confidence: number;
  condition: "working" | "nonWorking" | "damaged" | "mixed";
  brand?: string;
  model?: string;
  quantity: number;
  weight: number;
  verifiedWeight?: number;
  items?: LotItem[];
  referencePricePerKg: number;
  askingPrice: number;
  description?: string;
  city: string;
  address: string;
  gps?: { lat: number; lng: number };
  photo?: string;
  createdAt: string;
  stage: DealStage;
  offers: OfferEntry[];
  agreedPrice?: number;
  receiverId?: string;
  receiverName?: string;
  delivery?: Delivery;
  handoverCollector?: boolean;
  handoverReceiver?: boolean;
  paymentMethod?: "upi" | "bank";
  transactionId?: string;
  invoiceNo?: string;
  completedAt?: string;
  recyclingStage?: RecyclingStage;
  timeline: { stage: DealStage; at: string }[];
};

export type CollectorProfile = {
  id: string;
  name: string;
  type: CollectorType;
  mobile: string;
  email: string;
  city: string;
  state: string;
  address: string;
  upi?: string;
  photo?: string;
};

export type ReceiverProfile = {
  id: string;
  orgName: string;
  contactPerson: string;
  mobile: string;
  email: string;
  city: string;
  state: string;
  address: string;
  gst?: string;
  pan?: string;
  authRef?: string;
  categories: EeeCode[];
  dailyCapacity: number;
  monthlyCapacity: number;
};
