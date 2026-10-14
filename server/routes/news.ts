import { Router } from "express";
import { getWijNews } from "../services/newsService.js";

export const newsRouter = Router();

newsRouter.get("/", async (_req, res) => {
  try {
    res.json(await getWijNews());
  } catch (error) {
    const message = error instanceof Error ? error.message : "WijTeunesen-nieuws niet beschikbaar.";
    console.error(`[teunesen-tv] ${new Date().toISOString()} error nieuws ${message}`);
    res.status(502).json({ source: "WijTeunesen", connected: false, items: [], error: message });
  }
});
