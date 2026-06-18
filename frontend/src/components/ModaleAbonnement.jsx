import { useState, useEffect } from "react";
import { fetchVapidPublicKey, subscribe, unsubscribe } from "../services/alertes";
import "./ModaleAbonnement.css";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64  = (base64String + padding)
    .replace(/-/g, "+")
    .replace(/_/g, "/");
  const raw = window.atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

export default function ModaleAbonnement({ onFermer }) {
  const [etat, setEtat]       = useState("initial");
  const [message, setMessage] = useState("");

  // Fermeture avec Esc
  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onFermer(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onFermer]);

  // Vérifier si déjà abonné
  useEffect(() => {
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setEtat("indisponible");
      return;
    }
    navigator.serviceWorker.ready.then((reg) => {
      reg.pushManager.getSubscription().then((sub) => {
        if (sub) setEtat("abonne");
      });
    });
  }, []);

  const handleAbonner = async () => {
    try {
      setEtat("charge");

      const permission = await Notification.requestPermission();
      if (permission === "denied") {
        setEtat("erreur");
        setMessage("Permission refusée. Activez les notifications dans les paramètres du navigateur.");
        return;
      }
      if (permission !== "granted") {
        setEtat("erreur");
        setMessage("Permission non accordée.");
        return;
      }

      const publicKey    = await fetchVapidPublicKey();
      const reg          = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(publicKey),
      });

      await subscribe(subscription.toJSON());
      setEtat("abonne");
      setMessage("Vous êtes abonné aux alertes !");
    } catch (err) {
      setEtat("erreur");
      setMessage(`Erreur : ${err.message}`);
    }
  };

  const handleDesabonner = async () => {
    try {
      setEtat("charge");
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.getSubscription();
      if (sub) {
        await unsubscribe(sub.endpoint);
        await sub.unsubscribe();
      }
      setEtat("initial");
      setMessage("Vous êtes désabonné.");
    } catch (err) {
      setEtat("erreur");
      setMessage(`Erreur : ${err.message}`);
    }
  };

  return (
    <div className="modale-overlay" onClick={onFermer}>
      <div className="modale" onClick={(e) => e.stopPropagation()}>

        <button className="modale-fermer" onClick={onFermer}>✕</button>
        <h2>S'abonner aux alertes</h2>

        <p className="modale-description">
          Recevez une notification sur votre appareil dès qu'un nouvel avis
          est publié par la Ville de Montréal, même lorsque l'application
          est fermée.
        </p>

        {message && (
          <p className={`modale-message ${etat}`}>{message}</p>
        )}

        {etat === "indisponible" && (
          <p className="modale-erreur">
            ⚠️ Les notifications push ne sont pas disponibles sur ce navigateur.
          </p>
        )}

        {(etat === "initial" || etat === "erreur") && (
          <button className="btn-abonner-push" onClick={handleAbonner}>
            🔔 S'abonner
          </button>
        )}

        {etat === "charge" && <div className="spinner" />}

        {etat === "abonne" && (
          <>
            <p className="modale-success">✅ Abonné avec succès</p>
            <button className="btn-desabonner" onClick={handleDesabonner}>
              Se désabonner
            </button>
          </>
        )}

      </div>
    </div>
  );
}