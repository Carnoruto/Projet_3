import { useState, useRef, useEffect } from "react";
import "./FiltreDropdown.css";

export default function FiltreDropdown({ label, options, valeurs, onChange }) {
  const [ouvert, setOuvert] = useState(false);
  const ref = useRef(null);

  // Fermer si on clique ailleurs
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOuvert(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const toggle = (valeur) => {
    const existe = valeurs.includes(valeur);
    onChange(existe ? valeurs.filter((v) => v !== valeur) : [...valeurs, valeur]);
  };

  return (
    <div className="filtre-dropdown" ref={ref}>
      <button
        className={`filtre-dropdown-btn ${valeurs.length > 0 ? "actif" : ""}`}
        onClick={() => setOuvert((o) => !o)}
      >
        {label}
        {valeurs.length > 0 && (
          <span className="filtre-dropdown-compte">{valeurs.length}</span>
        )}
        <span className="filtre-dropdown-chevron">{ouvert ? "▲" : "▼"}</span>
      </button>

      {ouvert && (
        <div className="filtre-dropdown-liste">
          {options.length === 0 && (
            <p className="filtre-dropdown-vide">Chargement...</p>
          )}
          {options.map((option) => (
            <label key={option} className="filtre-dropdown-item">
              <input
                type="checkbox"
                checked={valeurs.includes(option)}
                onChange={() => toggle(option)}
              />
              <span>{option}</span>
            </label>
          ))}
          {valeurs.length > 0 && (
            <button
              className="filtre-dropdown-effacer"
              onClick={() => onChange([])}
            >
              Tout désélectionner
            </button>
          )}
        </div>
      )}
    </div>
  );
}