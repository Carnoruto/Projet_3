import { useState, useEffect, useCallback } from "react";
import { fetchAlertes } from "../services/alertes";

const LIMIT = 20;

export function useAlertes() {
  const [alertes, setAlertes]         = useState([]);
  const [total, setTotal]             = useState(0);
  const [offset, setOffset]           = useState(0);
  const [chargement, setChargement]   = useState(true);
  const [erreur, setErreur]           = useState(null);
  const [horsLigne, setHorsLigne]     = useState(!navigator.onLine);

  // Détection hors-ligne
  useEffect(() => {
    const goOffline = () => setHorsLigne(true);
    const goOnline  = () => setHorsLigne(false);
    window.addEventListener("offline", goOffline);
    window.addEventListener("online",  goOnline);
    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online",  goOnline);
    };
  }, []);

  // Chargement initial
  useEffect(() => {
    setChargement(true);
    setErreur(null);
    fetchAlertes(0, LIMIT)
      .then(({ alertes, total }) => {
        setAlertes(alertes);
        setTotal(total);
        setOffset(LIMIT);
      })
      .catch((err) => setErreur(err.message))
      .finally(() => setChargement(false));
  }, []);

  // Charger plus
  const chargerPlus = useCallback(() => {
    if (offset >= total) return;
    setChargement(true);
    fetchAlertes(offset, LIMIT)
      .then(({ alertes: nouvelles }) => {
        setAlertes((prev) => [...prev, ...nouvelles]);
        setOffset((prev) => prev + LIMIT);
      })
      .catch((err) => setErreur(err.message))
      .finally(() => setChargement(false));
  }, [offset, total]);

  return {
    alertes,
    total,
    chargement,
    erreur,
    horsLigne,
    chargerPlus,
    aPlus: offset < total,
  };
}