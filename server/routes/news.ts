import { Router } from "express";
import { fetchNewsImage } from "../providers/newsImage.js";
import { storedNewsImage } from "../providers/wijNewsProvider.js";
import { getWijNews } from "../services/newsService.js";

export const newsRouter = Router();

newsRouter.get("/:id/image", async (req, res) => {
  const raw = req.params.id;
  const id = (Array.isArray(raw) ? raw[0] : raw) ?? "";
  if (!/^[A-Za-z0-9-]{1,80}$/.test(id)) {
    res.status(404).end();
    return;
  }
  try {
    if (!storedNewsImage(id)) await getWijNews();
    const image = await fetchNewsImage(id);
    if (!image) {
      res.status(404).end();
      return;
    }
    res.setHeader("Content-Type", image.contentType);
    res.setHeader("Cache-Control", "private, max-age=300");
    res.send(image.bytes);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Nieuwsfoto niet beschikbaar.";
    console.error(`[teunesen-tv] ${new Date().toISOString()} error nieuwsfoto ${message}`);
    if (!res.headersSent) res.status(502).end();
  }
});

newsRouter.get("/", async (_req, res) => {
  try {
    res.json(await getWijNews());
  } catch (error) {
    const message = error instanceof Error ? error.message : "WijTeunesen-nieuws niet beschikbaar.";
    console.error(`[teunesen-tv] ${new Date().toISOString()} error nieuws ${message}`);
    res.status(502).json({ source: "WijTeunesen", connected: false, items: [], error: message });
  }
});
