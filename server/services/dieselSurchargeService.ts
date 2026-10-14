import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { DieselSurcharge, DieselSurchargeProvider, DieselWeek } from "../providers/dieselSurchargeProvider.js";
import { MockDieselProvider } from "../providers/mockDieselProvider.js";
import { SharePointDieselProvider } from "../providers/sharePointDieselProvider.js";

const dieselProviders = {
  mock: new MockDieselProvider(),
  sharepoint: new SharePointDieselProvider(),
} satisfies Record<string, DieselSurchargeProvider>;

type DieselSource = keyof typeof dieselProviders;

const activeDieselSource: DieselSource = "sharepoint";

const cacheFile = path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../.."), "data", "diesel-week.json");

const weekdayIndex: Record<string, number> = {
  Sun: 0,
  Mon: 1,
  Tue: 2,
  Wed: 3,
  Thu: 4,
  Fri: 5,
  Sat: 6,
};

type DieselCache = {
  periodKey: string;
  data: DieselSurcharge;
};

let memory: DieselCache | null | undefined;

export function dieselPeriodKey(now = new Date()) {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Europe/Amsterdam",
      weekday: "short",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(now)
      .map((part) => [part.type, part.value]),
  );
  const year = Number(parts.year);
  const month = Number(parts.month);
  const day = Number(parts.day);
  const hour = Number(parts.hour);
  const weekday = weekdayIndex[parts.weekday] ?? 0;
  let daysBack = (weekday - 3 + 7) % 7;
  if (weekday === 3 && hour < 18) daysBack = 7;
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() - daysBack);
  const keyMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  const keyDay = String(date.getUTCDate()).padStart(2, "0");
  return `${date.getUTCFullYear()}-${keyMonth}-${keyDay}`;
}

function isWeek(value: unknown): value is DieselWeek {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const row = value as Record<string, unknown>;
  return (
    typeof row.peildatum === "string" &&
    typeof row.dieselPrijs === "number" &&
    typeof row.toeslagPercentage === "number" &&
    typeof row.actief === "boolean"
  );
}

function isSurcharge(value: unknown): value is DieselSurcharge {
  if (!isWeek(value)) return false;
  const row = value as DieselSurcharge;
  return Array.isArray(row.weken) && row.weken.every(isWeek);
}

function readCache() {
  if (memory !== undefined) return memory;
  try {
    const parsed: unknown = JSON.parse(readFileSync(cacheFile, "utf8"));
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      memory = null;
      return memory;
    }
    const row = parsed as Record<string, unknown>;
    memory = typeof row.periodKey === "string" && isSurcharge(row.data) ? { periodKey: row.periodKey, data: row.data } : null;
  } catch {
    memory = null;
  }
  return memory;
}

function writeCache(cache: DieselCache) {
  memory = cache;
  mkdirSync(path.dirname(cacheFile), { recursive: true });
  writeFileSync(cacheFile, JSON.stringify(cache));
}

export async function getDieselSurcharge(): Promise<DieselSurcharge> {
  const periodKey = dieselPeriodKey();
  const cached = readCache();
  if (cached?.periodKey === periodKey) {
    console.info(`Dieseltoeslag uit weekcache ${periodKey}, peildatum ${cached.data.peildatum}.`);
    return cached.data;
  }

  try {
    const record = await dieselProviders[activeDieselSource].getCurrentData();
    console.info(
      `Dieseltoeslag via SharePointDieselProvider: peildatum ${record.peildatum}, toeslag ${record.toeslagPercentage}%, actief ${record.actief}.`,
    );
    writeCache({ periodKey, data: record });
    console.info(`Dieseltoeslag bewaard voor weekvenster ${periodKey}. Volgende lijstcontrole na woensdag 18:00.`);
    return record;
  } catch (error) {
    const message = error instanceof Error ? error.message : "onbekende fout";
    if (cached) {
      console.error(`Dieseltoeslag via ${activeDieselSource} mislukt (${message}). Laatste weekcache blijft staan.`);
      return cached.data;
    }
    console.error(`Dieseltoeslag via ${activeDieselSource} mislukt (${message}). Terugval op MockDieselProvider.`);
    if (activeDieselSource === "mock") throw error;
    return dieselProviders.mock.getCurrentData();
  }
}
