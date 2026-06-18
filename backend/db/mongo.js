import mongoose from "mongoose";

export async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connecté");
  } catch (err) {
    console.error("❌ Erreur MongoDB :", err.message);
    process.exit(1);
  }
}

// ── Schéma Subscription ──────────────────────────────────────
const subscriptionSchema = new mongoose.Schema({
  endpoint: {
    type:     String,
    required: true,
    unique:   true,
  },
  keys: {
    p256dh: { type: String, required: true },
    auth:   { type: String, required: true },
  },
  createdAt: {
    type:    Date,
    default: Date.now,
  },
});

export const Subscription = mongoose.model("Subscription", subscriptionSchema);