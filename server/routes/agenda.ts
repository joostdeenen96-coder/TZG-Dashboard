import { Router } from "express";
import { getWijAgenda } from "../services/agendaService.js";

export const agendaRouter = Router();

agendaRouter.get("/", async (_req, res) => {
  res.setHeader("Cache-Control", "no-store");
  try {
    res.json(await getWijAgenda());
  } catch (error) {
    const message = error instanceof Error ? error.message : "WijTeunesen-agenda niet beschikbaar.";
    console.error(`[teunesen-tv] ${new Date().toISOString()} error agenda ${message}`);
    res.status(502).json({ source: "WijTeunesen", connected: false, items: [], error: message });
  }
});
