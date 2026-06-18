import "./Squelette.css";

export default function Squelette() {
  return (
    <div className="squelette" aria-busy="true" aria-label="Chargement...">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="squelette-carte">
          <div className="squelette-ligne large"  />
          <div className="squelette-ligne moyen"  />
          <div className="squelette-ligne court"  />
        </div>
      ))}
    </div>
  );
}