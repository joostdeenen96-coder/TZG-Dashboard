import { fetchBytes } from "./http.js";

const FORECAST_GRAPH_URL = "https://www.hvz.baden-wuerttemberg.de/gifs/09016-2001.GIF";
const CACHE_MS = 10 * 60 * 1000;

let cached: { bytes: Uint8Array; at: number } | null = null;

export async function readMaxauForecastGraph() {
  if (cached && Date.now() - cached.at < CACHE_MS) return cached.bytes;
  const bytes = await fetchBytes(FORECAST_GRAPH_URL);
  const signature = String.fromCharCode(bytes[0] ?? 0, bytes[1] ?? 0, bytes[2] ?? 0);
  if (signature !== "GIF") throw new Error("HVZ-grafiek is geen GIF.");
  cached = { bytes, at: Date.now() };
  return bytes;
}
