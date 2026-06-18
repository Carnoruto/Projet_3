import "./AbonnementIndisponible.css";
import { Link } from "react-router-dom";

function AbonnementIndisponible() {
  return (
    <div className="abonnement-indispo">
      <h2>Fonctionnalité non disponible</h2>
      <p>
        Cette fonctionnalité n’est pas encore disponible pour le moment.
        Revenez plus tard pour plus de mises à jour.
      </p>
      <Link to="/" className="btn-retour">
        ← Retour à l’accueil
      </Link>
    </div>
  );
}

export default AbonnementIndisponible;