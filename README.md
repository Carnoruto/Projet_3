---
1. Avis et alertes — Ville de Montréal (Projet_3)

Une application web (PWA) qui affiche les avis et alertes de la
Ville de Montréal avec des notifications push et un mode hors-ligne.

2. Liste des fonctionnalitées 
- Recherche par mot-clé (fonctionne sans accents)
- Filtres par arrondissement et sujet (plusieurs choix possibles)
- Filtres actifs affichés sous forme d'étiquettes retirables
- Filtre par période (date début et date fin)
- Page de détail pour chaque alerte avec URL partageable
- Bouton Charger plus pour voir plus d'alertes
- Fonctionne sur mobile et bureau
- Fonctionne hors-ligne (dernières alertes consultées disponibles)
- Notifications push reçues même application fermée
- Abonnement et désabonnement via une fenêtre modale

3. Organisation du dépôt

Projet_3/
├── backend/          Serveur Express + MongoDB
│   ├── db/           Connexion base de données
│   ├── routes/       Routes de l'API REST
│   └── utils/        Normalisation des données
├── frontend/         Application React PWA
│   ├── public/       Icônes, manifest, service worker
│   └── src/          Composants, pages, hooks, services
├── docs/
│   └── rapport.pdf   Rapport technique
└── README.md

### Ce qu'il faut installer avant de commencer
- Un compte gratuit sur [MongoDB Atlas](https://www.mongodb.com/atlas)

4. Installation du projet

- Installer et démarrer le backend

Dans un terminal :

cd backend

npm install

cp .env.example .env


- Remplissez les valeurs dans le fichier .env

Terminal :

npm run dev


- Le serveur démarre sur "http://localhost:3001".

- Installer et démarrer le frontend

Ouvrez un deuxième terminal :

cd frontend

npm install

cp .env.example .env


- le Contenu : VITE_API_URL=http://localhost:3001

Terminal : 

npm run dev


- Le site est disponible sur "http://localhost:5173".

- Pour tester la PWA complète (service worker + hors-ligne)

Dans un terminal :

cd frontend

npm run build

npm run preview


- Le site est disponible sur "http://localhost:4173".


> ⚠️ Changez "FRONTEND_URL" dans "backend/.env" pour "http://localhost:4173"
> quand vous utilisez "npm run preview".


5. Variables d'environnement

### backend/.env.example

```env
PORT=
MONGODB_URI=
VAPID_PUBLIC_KEY=
VAPID_PRIVATE_KEY=
VAPID_EMAIL=
FRONTEND_URL=
```

### frontend/.env.example

```env
VITE_API_URL=
```


6. Tester l'envoi d'une notification

### Étape 1 — S'abonner
-1. Ouvrez le site sur `http://localhost:4173`
-2. Cliquez sur **M'abonner** dans le panneau à droite
-3. Acceptez la permission de notifications
-4. Le bouton doit afficher **Abonné avec succès**

### Étape 2 — Envoyer une notification avec Postman

-1. Ouvrez Postman
-2. Créez une requête **POST**
-3. URL : `http://localhost:3001/send-notification`
-4. Onglet **Body** → **raw** → **JSON**
-5. Collez ce contenu :

```json
{
  "title": "Nouveau avis",
  "body": "Un nouvel avis a été publié par la Ville.",
  "url": "/"
}
```

6. Cliquez **Send**
7. Vous devriez recevoir la notification sur votre appareil

### Réponse attendue

```json
{
  "data": {
    "message": "Notifications envoyées.",
    "successCount": 1,
    "failureCount": 0
  }
}
```


7. URLs de déploiement


- Frontend/Vercel | https://votre-projet.vercel.app |

- Backend/Render | https://projet-3-gkyl.onrender.com | 

---
