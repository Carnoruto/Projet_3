// src/pages/Accueil.jsx
import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { useAlertes } from "../hooks/useAlertes";
import removeAccents from "../utils/removeAccents";
import Squelette from "../components/Squelette";
import BanniereHorsLigne from "../components/BanniereHorsLigne";
import FiltresActifs from "../components/FiltresActifs";
import FiltreDropdown from "../components/FiltreDropdown";
import ModaleAbonnement from "../components/ModaleAbonnement";
import "./Accueil.css";

const FILTRES_VIDES = {
  recherche: "",
  arrondissements: [],
  sujets: [],
  dateDebut: "",
  dateFin: "",
};

function Accueil() {
  const { alertes, chargement, erreur, horsLigne, chargerPlus, aPlus } = useAlertes();
  const [filtres, setFiltres] = useState(FILTRES_VIDES);
  const [modaleOuverte, setModaleOuverte] = useState(false);

  // --- Valeurs disponibles (déduites des données réelles) ---
const arrondissements = useMemo(
  () => [...new Set(
    alertes
      .map((a) => a.arrondissement)
      .filter((v) => v !== "Non spécifié")
  )].sort(),
  [alertes]
);

  const sujets = useMemo(
    () => [...new Set(alertes.map((a) => a.sujet))].sort(),
    [alertes]
  );

  // --- Filtrage ---
  const alertesFiltrees = useMemo(() => {
    return alertes.filter((a) => {
      if (filtres.recherche) {
        const q     = removeAccents(filtres.recherche.toLowerCase());
        const titre = removeAccents(a.titre.toLowerCase());
        const desc  = removeAccents(a.description.toLowerCase());
        if (!titre.includes(q) && !desc.includes(q)) return false;
      }
      if (filtres.arrondissements.length > 0 &&
          !filtres.arrondissements.includes(a.arrondissement)) return false;
      if (filtres.sujets.length > 0 &&
          !filtres.sujets.includes(a.sujet)) return false;
      if (filtres.dateDebut && a.dateDebut < filtres.dateDebut) return false;
      if (filtres.dateFin   && a.dateDebut > filtres.dateFin)   return false;
      return true;
    });
  }, [alertes, filtres]);

  // --- Helpers ---
  const retirerChip = (type, valeur) => {
    if (type === "dateDebut" || type === "dateFin") {
      setFiltres((prev) => ({ ...prev, [type]: "" }));
    } else {
      setFiltres((prev) => ({
        ...prev,
        [type]: prev[type].filter((v) => v !== valeur),
      }));
    }
  };

  const effacerTout = () => setFiltres(FILTRES_VIDES);

  // --- Rendu ---
  return (
    <div className="accueil-page">
      <div className="accueil-main">

        {horsLigne && <BanniereHorsLigne />}

        <h2 className="titre">Avis et alertes</h2>
        <p className="sous-titre">Trouver un avis</p>

        <div className="encadre-recherche">
          <p className="label-recherche">Rechercher par mot-clé</p>

          <div className="recherche-section">
            <input
              type="text"
              placeholder="Que cherchez-vous?"
              value={filtres.recherche}
              onChange={(e) =>
                setFiltres((prev) => ({ ...prev, recherche: e.target.value }))
              }
              className="barre-recherche"
            />
            <button className="btn-effacer" onClick={effacerTout}>
              Effacer
            </button>
          </div>

          {/* Filtres */}
          <div className="filtres">

            <FiltreDropdown
  label="Arrondissement"
  options={arrondissements}
  valeurs={filtres.arrondissements}
  onChange={(val) =>
    setFiltres((prev) => ({ ...prev, arrondissements: val }))
  }
/>

            <FiltreDropdown
              label="Sujet"
              options={sujets}
              valeurs={filtres.sujets}
              onChange={(val) =>
                setFiltres((prev) => ({ ...prev, sujets: val }))
              }
            />

            {/* Période */}
            <div className="filtre-dates-champs">
              <input
                type="date"
                value={filtres.dateDebut}
                onChange={(e) =>
                  setFiltres((prev) => ({ ...prev, dateDebut: e.target.value }))
                }
              />
              <span>au</span>
              <input
                type="date"
                value={filtres.dateFin}
                onChange={(e) =>
                  setFiltres((prev) => ({ ...prev, dateFin: e.target.value }))
                }
              />
            </div>

          </div>

          {/* Chips filtres actifs */}
          <FiltresActifs
            filtres={filtres}
            onRetirer={retirerChip}
            onEffacerTout={effacerTout}
          />
        </div>

        {/* Chargement / erreur */}
        {chargement && alertes.length === 0 && <Squelette />}

        {erreur && (
          <div className="erreur-api">
            ⚠️ Impossible de charger les alertes : {erreur}
          </div>
        )}

        {!chargement && !erreur && (
          <p className="result-count">{alertesFiltrees.length} résultats</p>
        )}

        <div className="liste-alertes">
          {alertesFiltrees.map((a) => (
            <Link to={`/alertes/${a.id}`} key={a.id} className="carte-alerte">
              <h3>{a.titre}</h3>
              <p className="categorie">{a.sujet}</p>
              <p className="date">{a.dateDebut}</p>
              <p className="arrondissement">{a.arrondissement}</p>
            </Link>
          ))}
        </div>

        {aPlus && !chargement && (
          <button className="btn-charger-plus" onClick={chargerPlus}>
            Charger plus
          </button>
        )}

        {chargement && alertes.length > 0 && (
          <div className="spinner" aria-label="Chargement..." />
        )}

      </div>

      {/* Abonnement */}
      <aside className="abonnement">
  <h3>S'abonner aux alertes</h3>
  <p>Recevez des avis et alertes directement sur votre appareil.</p>
  <button
    className="btn-abonner"
    onClick={() => setModaleOuverte(true)}
  >
    M'abonner →
  </button>
</aside>

{modaleOuverte && (
  <ModaleAbonnement onFermer={() => setModaleOuverte(false)} />
)}
    </div>
  );
}

export default Accueil;