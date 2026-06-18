import { Router } from "express";
import webPush from "web-push";
import { Subscription } from "../db/mongo.js";

const router = Router();

// GET /vapid-public-key
router.get("/vapid-public-key", (req, res) => {
  res.json({
    data: { publicKey: process.env.VAPID_PUBLIC_KEY },
  });
});

// POST /send-notification
router.post("/send-notification", async (req, res) => {
  try {
    const { title, body, url } = req.body;

    if (!title || !body) {
      return res.status(400).json({
        error:   "BAD_REQUEST",
        message: "Les champs title et body sont requis.",
      });
    }

    const subscriptions = await Subscription.find();

    if (subscriptions.length === 0) {
      return res.json({
        data: {
          message:      "Aucun abonné.",
          successCount: 0,
          failureCount: 0,
        },
      });
    }

    const payload = JSON.stringify({
      title,
      body,
      url: url ?? "/",
    });

    let successCount = 0;
    let failureCount = 0;

    await Promise.all(
      subscriptions.map(async (sub) => {
        try {
          await webPush.sendNotification(
            { endpoint: sub.endpoint, keys: sub.keys },
            payload
          );
          successCount++;
        } catch (err) {
          failureCount++;
          // Abonnement expiré ou invalide → suppression automatique
          if (err.statusCode === 410 || err.statusCode === 404) {
            await Subscription.findOneAndDelete({ endpoint: sub.endpoint });
            console.log(`Abonnement expiré supprimé : ${sub.endpoint}`);
          }
        }
      })
    );

    res.json({
      data: {
        message: "Notifications envoyées.",
        successCount,
        failureCount,
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