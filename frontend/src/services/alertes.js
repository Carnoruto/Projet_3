const API_BASE = import.meta.env.VITE_API_URL ?? "http://localhost:3001";

// ── Alertes ──────────────────────────────────────────────────
export async function fetchAlertes(offset = 0, limit = 20) {
  const url = `${API_BASE}/avis-alertes?limit=${limit}&offset=${offset}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Erreur HTTP ${response.status}`);
  }

  const json = await response.json();
  return {
    alertes: json.data.alertes,
    total:   json.data.total,
  };
}

// ── VAPID ────────────────────────────────────────────────────
export async function fetchVapidPublicKey() {
  const res  = await fetch(`${API_BASE}/vapid-public-key`);
  const json = await res.json();
  return json.data.publicKey;
}

// ── Abonnement ───────────────────────────────────────────────
export async function subscribe(subscription) {
  const res = await fetch(`${API_BASE}/subscribe`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ subscription }),
  });
  return res.json();
}

export async function unsubscribe(endpoint) {
  const res = await fetch(`${API_BASE}/unsubscribe`, {
    method:  "POST",
    headers: { "Content-Type": "application/json" },
    body:    JSON.stringify({ endpoint }),
  });
  return res.json();
}