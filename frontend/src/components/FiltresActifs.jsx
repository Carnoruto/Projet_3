import "./FiltresActifs.css";

export default function FiltresActifs({ filtres, onRetirer, onEffacerTout }) {
  const chips = [
    ...filtres.arrondissements.map((v) => ({
      type: "arrondissements",
      valeur: v,
      label: v,
    })),
    ...filtres.sujets.map((v) => ({
      type: "sujets",
      valeur: v,
      label: v,
    })),
    filtres.dateDebut
      ? { type: "dateDebut", valeur: filtres.dateDebut, label: `Depuis le ${filtres.dateDebut}` }
      : null,
    filtres.dateFin
      ? { type: "dateFin", valeur: filtres.dateFin, label: `Jusqu'au ${filtres.dateFin}` }
      : null,
  ].filter(Boolean);

  if (chips.length === 0) return null;

  return (
    <div className="filtres-actifs" role="list" aria-label="Filtres actifs">
      {chips.map((chip) => (
        <button
          key={`${chip.type}-${chip.valeur}`}
          className="chip"
          onClick={() => onRetirer(chip.type, chip.valeur)}
          aria-label={`Retirer le filtre ${chip.label}`}
          role="listitem"
        >
          {chip.label}
          <span className="chip-croix" aria-hidden="true">✕</span>
        </button>
      ))}

      <button className="btn-effacer-tout" onClick={onEffacerTout}>
        Tout effacer
      </button>
    </div>
  );
}