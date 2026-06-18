import "./BanniereHorsLigne.css";

export default function BanniereHorsLigne() {
  return (
    <div className="banniere-hors-ligne" role="status">
      <span className="banniere-icone">📴</span>
      Vous êtes hors ligne — les dernières données enregistrées sont affichées.
    </div>
  );
}