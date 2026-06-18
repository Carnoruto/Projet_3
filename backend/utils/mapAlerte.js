/**
 * Tente d'extraire l'arrondissement depuis la fin du titre.
 * Ex: "... arrondissement de Montréal-Nord" → "Montréal-Nord"
 * Ex: "... arrondissement du Plateau-Mont-Royal" → "Plateau-Mont-Royal"
 */
function extraireArrondissement(titre) {
  if (!titre) return "Non spécifié";

  const match = titre.match(
    /arrondissement(?:\s+de(?:s)?|\s+du|\s+d')\s+([^–\-,\.]+?)(?:\s*[-–].*)?$/i
  );
  if (match) return match[1].trim();

  const match2 = titre.match(
    /arrondissement\s+([A-ZÀ-Ö][^,\.–\-]+?)(?:\s*[-–,].*)?$/i
  );
  if (match2) return match2[1].trim();

  return "Non spécifié";
}

/**
 * Convertit un enregistrement brut de l'API Ville vers le modèle interne.
 * Champs API : titre, date_debut, date_fin, type, service_publieur, lien
 */
export function mapAlerte(raw) {
  const titre = raw.titre ?? "Sans titre";
  return {
    id:             raw._id,
    titre,
    description:    raw.type          ?? "",
    sujet:          raw.type          ?? "Autre",
    arrondissement: extraireArrondissement(titre),
    dateDebut:      raw.date_debut    ?? null,
    dateFin:        raw.date_fin      ?? null,
    url:            raw.lien          ?? null,
  };
}