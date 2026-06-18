import { Router } from "express";
import { mapAlerte } from "../utils/mapAlerte.js";

const router = Router();

const API_VILLE =
  "https://donnees.montreal.ca/api/3/action/datastore_search" +
  "?resource_id=fc6e5f85-7eba-451c-8243-bdf35c2ab336";

// GET /avis-alertes
router.get("/", async (req, res) => {
  try {
    const { limit = 20, offset = 0 } = req.query;
    const url = `${API_VILLE}&limit=${limit}&offset=${offset}`;

    const response = await fetch(url);

    if (!response.ok) {
      return res.status(502).json({
        error:   "API_ERROR",
        message: `Erreur API Ville : ${response.status}`,
      });
    }

    const json = await response.json();

    if (!json.success) {
      return res.status(502).json({
        error:   "API_ERROR",
        message: "L'API de la Ville a retourné une erreur.",
      });
    }

    res.json({
      data: {
        alertes: json.result.records.map(mapAlerte),
        total:   json.result.total,
      },
    });
  } catch (err) {
    res.status(500).json({
      error:   "SERVER_ERROR",
      message: err.message,
    });
  }
});

export default router;