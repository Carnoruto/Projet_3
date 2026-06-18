import "dotenv/config";
import express from "express";
import cors from "cors";
import webPush from "web-push";
import { connectDB } from "./db/mongo.js";
import avisAlertesRouter from "./routes/avisAlertes.js";
import subscribeRouter from "./routes/subscribe.js";
import notificationsRouter from "./routes/notifications.js";

const app = express();

// ── Middlewares ──────────────────────────────────────────────
app.use(cors({ origin: process.env.FRONTEND_URL }));
app.use(express.json());

// ── VAPID ────────────────────────────────────────────────────
webPush.setVapidDetails(
  process.env.VAPID_EMAIL,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

// ── Routes ───────────────────────────────────────────────────
app.use("/avis-alertes",    avisAlertesRouter);
app.use("/",                subscribeRouter);
app.use("/",                notificationsRouter);

// ── Démarrage ────────────────────────────────────────────────
const PORT = process.env.PORT ?? 3001;
connectDB().then(() => {
  app.listen(PORT, () =>
    console.log(`✅ Serveur démarré sur http://localhost:${PORT}`)
  );
});