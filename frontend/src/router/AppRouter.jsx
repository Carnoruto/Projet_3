import { BrowserRouter, Routes, Route } from "react-router-dom";

import Accueil from "../pages/Accueil";
import AlerteDetail from "../pages/AlerteDetail";
import AbonnementIndisponible from "../pages/AbonnementIndisponible";


function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Accueil />} />
        <Route path="/alertes/:id" element={<AlerteDetail />} />
        <Route path="/abonnement" element={<AbonnementIndisponible />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRouter;