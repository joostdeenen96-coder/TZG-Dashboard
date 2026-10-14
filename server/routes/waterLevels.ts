import { Router } from "express";
import { readMaxauForecastGraph } from "../providers/maxauGraph.js";
import { getWaterLevels } from "../services/waterLevelService.js";

export const waterLevelsRouter = Router();

waterLevelsRouter.get("/maxau/graph", async (_req, res) => {
  try {
    const bytes = await readMaxauForecastGraph();
    res.type("gif").send(Buffer.from(bytes));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Verwachtingsgrafiek van Maxau niet beschikbaar.";
    console.error(`[teunesen-tv] ${new Date().toISOString()} error maxau-grafiek ${message}`);
    res.status(502).json({ error: "Verwachtingsgrafiek van Maxau niet beschikbaar." });
  }
});

waterLevelsRouter.get("/", async (_req, res) => {
  try {
    res.json(await getWaterLevels());
  } catch (error) {
    const message = error instanceof Error ? error.message : "Waterstanden niet beschikbaar.";
    console.error(`[teunesen-tv] ${new Date().toISOString()} error waterstanden ${message}`);
    res.status(500).json({ error: "Waterstanden niet beschikbaar." });
  }
});
