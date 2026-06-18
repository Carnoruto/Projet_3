import { Router } from "express";
import { Subscription } from "../db/mongo.js";

const router = Router();

// POST /subscribe
router.post("/subscribe", async (req, res) => {
  try {
    const { subscription } = req.body;

    if (!subscription?.endpoint || !subscription?.keys) {
      return res.status(400).json({
        error:   "BAD_REQUEST",
        message: "Subscription invalide — endpoint et keys requis.",
      });
    }

    await Subscription.findOneAndUpdate(
      { endpoint: subscription.endpoint },
      {
        endpoint: subscription.endpoint,
        keys:     subscription.keys,
      },
      { upsert: true, new: true }
    );

    res.status(201).json({
      data: { message: "Abonnement enregistré avec succès." },
    });
  } catch (err) {
    res.status(500).json({
      error:   "SERVER_ERROR",
      message: err.message,
    });
  }
});

// POST /unsubscribe
router.post("/unsubscribe", async (req, res) => {
  try {
    const { endpoint } = req.body;

    if (!endpoint) {
      return res.status(400).json({
        error:   "BAD_REQUEST",
        message: "endpoint requis.",
      });
    }

    const result = await Subscription.findOneAndDelete({ endpoint });

    if (!result) {
      return res.status(404).json({
        error:   "NOT_FOUND",
        message: "Abonnement introuvable.",
      });
    }

    res.json({
      data: { message: "Désabonnement effectué avec succès." },
    });
  } catch (err) {
    res.status(500).json({
      error:   "SERVER_ERROR",
      message: err.message,
    });
  }
});

export default router;