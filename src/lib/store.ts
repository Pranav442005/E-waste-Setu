import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  CollectorProfile,
  DealStage,
  Delivery,
  Lot,
  ReceiverProfile,
  RecyclingStage,
} from "./types";
import { material } from "./types";
import type { Lang } from "./i18n";

const now = () => new Date().toISOString();

function pad(n: number, len = 4) {
  return String(n).padStart(len, "0");
}

let counter = 0;
export function newLotId() {
  counter += 1;
  const d = new Date();
  return `LOT-${d.getFullYear()}${pad(d.getMonth() + 1, 2)}-${pad(
    (Date.now() % 10000) + counter,
  )}`;
}

export function newTxnId() {
  return `TXN-${pad(Date.now() % 1000000, 6)}`;
}

export function newInvoiceNo() {
  const d = new Date();
  return `INV-${d.getFullYear()}-${pad(Date.now() % 10000)}`;
}

const defaultCollector: CollectorProfile = {
  id: "COL-1001",
  name: "Ramesh Patil",
  type: "informal",
  mobile: "9876543210",
  email: "ramesh.patil@example.com",
  city: "Pune",
  state: "Maharashtra",
  address: "Shop 14, Hadapsar Market Road, Pune 411028",
};

const defaultReceiver: ReceiverProfile = {
  id: "REC-2001",
  orgName: "GreenCycle Recyclers Pvt Ltd",
  contactPerson: "Anita Deshmukh",
  mobile: "9822001122",
  email: "ops@greencycle.example.com",
  city: "Pune",
  state: "Maharashtra",
  address: "Plot 22, MIDC Bhosari, Pune 411026",
  gst: "27AABCG1234H1ZP",
  pan: "AABCG1234H",
  authRef: "MPCB/EW/2023/0471",
  categories: ["ITEW", "CEEW", "LSEEW"],
  dailyCapacity: 1500,
  monthlyCapacity: 40,
};

function seedLot(partial: Partial<Lot> & { id: string; materialId: string }): Lot {
  const m = material(partial.materialId);
  const base: Lot = {
    collectorId: defaultCollector.id,
    collectorName: defaultCollector.name,
    collectorType: "informal",
    eee: m.eee,
    schedule: m.schedule,
    confidence: 94,
    condition: "mixed",
    quantity: 10,
    weight: 25,
    referencePricePerKg: m.price,
    askingPrice: m.price * 25,
    city: "Pune",
    address: "Hadapsar, Pune, Maharashtra",
    createdAt: now(),
    stage: "AVAILABLE",
    offers: [],
    timeline: [{ stage: "AVAILABLE", at: now() }],
    ...partial,
  } as Lot;
  return base;
}

const seedLots: Lot[] = [
  seedLot({
    id: "LOT-202601-0001",
    materialId: "laptop",
    quantity: 12,
    weight: 28,
    condition: "nonWorking",
    brand: "Assorted",
    askingPrice: 6160,
    description: "Office laptops retired after refresh cycle.",
  }),
  seedLot({
    id: "LOT-202601-0002",
    materialId: "mobile",
    quantity: 60,
    weight: 9,
    condition: "damaged",
    askingPrice: 2340,
    city: "Pimpri",
    address: "Pimpri-Chinchwad, Maharashtra",
  }),
  seedLot({
    id: "LOT-202601-0003",
    materialId: "monitor",
    quantity: 18,
    weight: 96,
    condition: "mixed",
    askingPrice: 10560,
    collectorType: "institution",
    collectorName: "Sinhgad Institute",
    description: "Computer lab monitors, bulk upload.",
    items: [
      { name: "LCD Monitor 19 inch", quantity: 12, weight: 62 },
      { name: "LED Monitor 22 inch", quantity: 6, weight: 34 },
    ],
  }),
];

export type AuthState = {
  role: "collector" | "receiver" | "admin" | null;
};

type State = {
  lang: Lang;
  auth: AuthState;
  collector: CollectorProfile;
  receiver: ReceiverProfile;
  lots: Lot[];
  activeLotId: string | null;

  setLang: (l: Lang) => void;
  login: (role: "collector" | "receiver" | "admin") => void;
  logout: () => void;
  setActiveLot: (id: string | null) => void;

  updateCollector: (patch: Partial<CollectorProfile>) => void;
  setCollectorPhoto: (photo?: string) => void;
  updateReceiver: (patch: Partial<ReceiverProfile>) => void;

  addLot: (lot: Lot) => void;
  patchLot: (id: string, patch: Partial<Lot>) => void;
  advance: (id: string, stage: DealStage, patch?: Partial<Lot>) => void;

  makeOffer: (id: string, amount: number, message: string) => void;
  counterOffer: (
    id: string,
    by: "collector" | "receiver",
    amount: number,
    message: string,
  ) => void;
  respondOffer: (id: string, offerId: string, outcome: "accepted" | "declined") => void;
  scheduleDelivery: (id: string, delivery: Delivery) => void;
  confirmHandover: (id: string, side: "collector" | "receiver") => void;
  setRecyclingStage: (id: string, stage: RecyclingStage) => void;
};

export const useApp = create<State>()(
  persist(
    (set, get) => ({
      lang: "en",
      auth: { role: null },
      collector: defaultCollector,
      receiver: defaultReceiver,
      lots: seedLots,
      activeLotId: null,

      setLang: (lang) => set({ lang }),
      login: (role) => set({ auth: { role } }),
      logout: () => set({ auth: { role: null }, activeLotId: null }),
      setActiveLot: (activeLotId) => set({ activeLotId }),

      updateCollector: (patch) =>
        set((s) => ({ collector: { ...s.collector, ...patch } })),
      setCollectorPhoto: (photo) =>
        set((s) => ({ collector: { ...s.collector, photo } })),
      updateReceiver: (patch) => set((s) => ({ receiver: { ...s.receiver, ...patch } })),

      addLot: (lot) => set((s) => ({ lots: [lot, ...s.lots], activeLotId: lot.id })),

      patchLot: (id, patch) =>
        set((s) => ({
          lots: s.lots.map((l) => (l.id === id ? { ...l, ...patch } : l)),
        })),

      advance: (id, stage, patch) =>
        set((s) => ({
          lots: s.lots.map((l) =>
            l.id === id
              ? {
                  ...l,
                  ...patch,
                  stage,
                  timeline: l.timeline.some((t) => t.stage === stage)
                    ? l.timeline
                    : [...l.timeline, { stage, at: now() }],
                }
              : l,
          ),
        })),

      makeOffer: (id, amount, message) => {
        const r = get().receiver;
        set((s) => ({
          lots: s.lots.map((l) =>
            l.id === id
              ? {
                  ...l,
                  receiverId: r.id,
                  receiverName: r.orgName,
                  stage: "OFFER_RECEIVED",
                  offers: [
                    ...l.offers,
                    {
                      id: `OF-${Date.now()}`,
                      by: "receiver",
                      actorName: r.orgName,
                      amount,
                      message,
                      at: now(),
                    },
                  ],
                  timeline: [...l.timeline, { stage: "OFFER_RECEIVED" as DealStage, at: now() }],
                }
              : l,
          ),
        }));
      },

      counterOffer: (id, by, amount, message) => {
        const state = get();
        const actorName =
          by === "collector" ? state.collector.name : state.receiver.orgName;
        set((s) => ({
          lots: s.lots.map((l) =>
            l.id === id
              ? {
                  ...l,
                  stage: "NEGOTIATING",
                  offers: [
                    ...l.offers,
                    {
                      id: `OF-${Date.now()}`,
                      by,
                      actorName,
                      amount,
                      message,
                      at: now(),
                    },
                  ],
                  timeline: [...l.timeline, { stage: "NEGOTIATING" as DealStage, at: now() }],
                }
              : l,
          ),
        }));
      },

      respondOffer: (id, offerId, outcome) =>
        set((s) => ({
          lots: s.lots.map((l) => {
            if (l.id !== id) return l;
            const offers = l.offers.map((o) =>
              o.id === offerId ? { ...o, outcome } : o,
            );
            if (outcome === "declined") return { ...l, offers };
            const accepted = l.offers.find((o) => o.id === offerId);
            return {
              ...l,
              offers,
              agreedPrice: accepted?.amount,
              stage: "DEAL_CONFIRMED" as DealStage,
              transactionId: l.transactionId ?? newTxnId(),
              timeline: [...l.timeline, { stage: "DEAL_CONFIRMED" as DealStage, at: now() }],
            };
          }),
        })),

      scheduleDelivery: (id, delivery) =>
        get().advance(id, "DELIVERY_SCHEDULED", { delivery }),

      confirmHandover: (id, side) =>
        set((s) => ({
          lots: s.lots.map((l) => {
            if (l.id !== id) return l;
            const next = {
              ...l,
              handoverCollector: side === "collector" ? true : l.handoverCollector,
              handoverReceiver: side === "receiver" ? true : l.handoverReceiver,
            };
            if (next.handoverCollector && next.handoverReceiver) {
              next.stage = "HANDOVER_CONFIRMED";
              next.timeline = [
                ...l.timeline,
                { stage: "HANDOVER_CONFIRMED" as DealStage, at: now() },
              ];
            }
            return next;
          }),
        })),

      setRecyclingStage: (id, recyclingStage) =>
        set((s) => ({
          lots: s.lots.map((l) => (l.id === id ? { ...l, recyclingStage } : l)),
        })),
    }),
    {
      name: "ewaste-setu-store",
      version: 1,
    },
  ),
);

export function useT() {
  return useApp((s) => s.lang);
}
