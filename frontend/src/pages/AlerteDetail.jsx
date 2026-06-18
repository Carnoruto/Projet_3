import { useParams, Link } from "react-router-dom";
import { useState, useEffect } from "react";
import { fetchAlertes } from "../services/alertes";
import "./AlerteDetail.css";

function AlerteDetail() {
  const { id } = useParams();
  const [alerte, setAlerte]       = useState(null);
  const [chargement, setChargement] = useState(true);
  const [erreur, setErreur]       = useState(null);

  useEffect(() => {
    fetchAlertes(0, 100)
      .then(({ alertes }) => {
        const trouvee = alertes.find((a) => String(a.id) === String(id));
        setAlerte(trouvee ?? null);
      })
      .catch((err) => setErreur(err.message))
      .finally(() => setChargement(false));
  }, [id]);

  if (chargement) {
    return (
      <div className="alerte-detail">
        <div className="spinner" aria-label="Chargement..." />
      </div>
    );
  }

  if (erreur) {
    return (
      <div className="alerte-detail">
        <h2>⚠️ Erreur : {erreur}</h2>
        <Link to="/" className="btn-retour">← Retour à l'accueil</Link>
      </div>
    );
  }

  if (!alerte) {
    return (
      <div className="alerte-detail">
        <h2>Alerte introuvable</h2>
        <Link to="/" className="btn-retour">← Retour à l'accueil</Link>
      </div>
    );
  }

  return (
    <div className="alerte-detail">
      <Link to="/" className="btn-retour">← Retour</Link>

      <h1>{alerte.titre}</h1>

      <p><strong>Arrondissement :</strong> {alerte.arrondissement}</p>
      <p><strong>Sujet :</strong> {alerte.sujet}</p>
      <p><strong>Date :</strong> {alerte.dateDebut}</p>
      {alerte.dateFin && (
        <p><strong>Date de fin :</strong> {alerte.dateFin}</p>
      )}

      <div className="description">
        {alerte.description}
      </div>

      {alerte.url && (
        <a href={alerte.url} target="_blank" rel="noreferrer" className="btn-plus-info">
          Plus d'informations →
        </a>
      )}
    </div>
  );
}

export default AlerteDetail;