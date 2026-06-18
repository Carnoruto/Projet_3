// ============================================================
//  sw.js – Service Worker complet pour Avis MTL (Projet 3)
// ============================================================

// -----------------------------------------------------------
// Configuration
// -----------------------------------------------------------
const CACHE_STATIQUE  = 'avis-mtl-v1';
const CACHE_DYNAMIQUE = 'dynamic-v1';
const CACHE_API       = 'api-v1';

// Assets du shell applicatif précachés à l'installation
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/icons/icon-192.png',
  '/icons/icon-512.png',
];

// Regex qui matche les appels vers votre backend Express
const API = /\/avis-alertes/;

// URL du backend (adaptée selon l'environnement)
const API_BASE = self.location.hostname === 'localhost'
  ? 'http://localhost:3001'
  : 'https://votre-backend.onrender.com'; // ← remplacer après déploiement

// -----------------------------------------------------------
// INSTALL – mise en cache des ressources statiques
// -----------------------------------------------------------
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_STATIQUE).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting();
});

// -----------------------------------------------------------
// ACTIVATE – nettoyage des vieux caches
// -----------------------------------------------------------
self.addEventListener('activate', event => {
  const cachesActuels = [CACHE_STATIQUE, CACHE_DYNAMIQUE, CACHE_API];

  event.waitUntil(
    caches.keys().then(clefs =>
      Promise.all(
        clefs
          .filter(c => !cachesActuels.includes(c))
          .map(c => caches.delete(c))
      )
    )
  );
  self.clients.claim();
});

// -----------------------------------------------------------
// FETCH – stratégie API backend : Stale-While-Revalidate
// Matche les appels vers /avis-alertes sur votre serveur Express
// -----------------------------------------------------------
self.addEventListener('fetch', event => {
  if (!API.test(event.request.url)) return;

  event.respondWith(
    caches.open(CACHE_API).then(cache =>
      cache.match(event.request).then(cached => {
        const reseau = fetch(event.request)
          .then(res => {
            // Mise en cache de la réponse fraîche
            cache.put(event.request, res.clone());
            return res;
          })
          .catch(() => cached); // repli sur le cache si hors-ligne

        // Retourne le cache immédiatement si disponible
        // sinon attend le réseau
        return cached || reseau;
      })
    )
  );
});

// -----------------------------------------------------------
// FETCH – stratégie ressources statiques : Cache First
// Gère le shell React (index.html, JS, CSS, images, icônes)
// -----------------------------------------------------------
self.addEventListener('fetch', event => {
  // Ignorer les requêtes API (déjà gérées ci-dessus)
  if (API.test(event.request.url)) return;
  // Ignorer les requêtes non-GET
  if (event.request.method !== 'GET') return;
  // Ignorer les extensions Chrome
  if (event.request.url.startsWith('chrome-extension')) return;

  event.respondWith(
    caches.match(event.request).then(r => {
      if (r) return r; // trouvé dans le cache → retour immédiat

      // Pas dans le cache → réseau + mise en cache dynamique
      return fetch(event.request)
        .then(res => {
          // Ne pas cacher les réponses invalides
          if (!res || res.status !== 200 || res.type === 'opaque') {
            return res;
          }
          const clone = res.clone();
          caches.open(CACHE_DYNAMIQUE).then(c => c.put(event.request, clone));
          return res;
        })
        .catch(() => {
          // Si hors-ligne et ressource non cachée →
          // retourner index.html pour que React Router prenne le relais
          if (event.request.destination === 'document') {
            return caches.match('/index.html');
          }
        });
    })
  );
});

// -----------------------------------------------------------
// PUSH – réception d'une notification push
// Déclenché par votre route POST /send-notification
// Le payload JSON contient : { title, body, url }
// -----------------------------------------------------------
self.addEventListener('push', event => {
  const data = event.data?.json() ?? {};

  const title   = data.title ?? 'Avis et alertes MTL';
  const options = {
    body:  data.body  ?? 'Nouvel avis disponible.',
    icon:  '/icons/icon-192.png',
    badge: '/icons/icon-192.png',
    data:  { url: data.url ?? '/' },
    // Actions optionnelles sur la notification
    actions: [
      { action: 'voir', title: 'Voir l\'avis' },
      { action: 'fermer', title: 'Fermer' },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// -----------------------------------------------------------
// NOTIFICATIONCLICK – clic sur une notification
// Ouvre la page de détail de l'alerte concernée
// -----------------------------------------------------------
self.addEventListener('notificationclick', event => {
  event.notification.close();

  const url = event.notification.data?.url ?? '/';

  // Si l'action "fermer" est cliquée, on ne fait rien
  if (event.action === 'fermer') return;

  event.waitUntil(
    // Cherche si un onglet de l'app est déjà ouvert
    self.clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then(clientList => {
        for (const client of clientList) {
          // Si l'app est déjà ouverte, on la focus et on navigue
          if ('focus' in client) {
            client.focus();
            return client.navigate(url);
          }
        }
        // Sinon on ouvre un nouvel onglet
        if (self.clients.openWindow) {
          return self.clients.openWindow(url);
        }
      })
  );
});

// -----------------------------------------------------------
// SYNC – envoi des abonnements en attente au retour du réseau
// Utilisé si l'abonnement push échoue hors-ligne
// -----------------------------------------------------------
self.addEventListener('sync', event => {
  if (event.tag === 'sync-abonnement') {
    event.waitUntil(syncAbonnementEnAttente());
  }
});

// -----------------------------------------------------------
// Fonction utilitaire – synchronise un abonnement mis en
// attente dans IndexedDB quand le réseau était indisponible
// -----------------------------------------------------------
async function syncAbonnementEnAttente() {
  const db = await ouvrirDB();
  const abonnements = await lireTousLesMessages(db);

  for (const abonnement of abonnements) {
    try {
      const reponse = await fetch(`${API_BASE}/subscribe`, {
        method:  'POST',
        headers: { 'Content-Type': 'application/json' },
        body:    JSON.stringify({ subscription: abonnement }),
      });

      if (reponse.ok) {
        // Abonnement envoyé avec succès → on retire de IndexedDB
        await supprimerMessage(db, abonnement.id);
      }
    } catch (err) {
      // Réseau toujours indisponible → le navigateur retentera
      console.error('Échec sync abonnement :', abonnement.id, err);
      throw err;
    }
  }
}

// -----------------------------------------------------------
// Helpers IndexedDB
// Stocke temporairement les abonnements quand hors-ligne
// -----------------------------------------------------------
function ouvrirDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open('avis-mtl-db', 1);

    req.onupgradeneeded = e => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains('abonnements-en-attente')) {
        db.createObjectStore('abonnements-en-attente', {
          keyPath:       'id',
          autoIncrement: true,
        });
      }
    };

    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  });
}

function lireTousLesMessages(db) {
  return new Promise((resolve, reject) => {
    const tx    = db.transaction('abonnements-en-attente', 'readonly');
    const store = tx.objectStore('abonnements-en-attente');
    const req   = store.getAll();

    req.onsuccess = e => resolve(e.target.result);
    req.onerror   = e => reject(e.target.error);
  });
}

function supprimerMessage(db, id) {
  return new Promise((resolve, reject) => {
    const tx    = db.transaction('abonnements-en-attente', 'readwrite');
    const store = tx.objectStore('abonnements-en-attente');
    const req   = store.delete(id);

    req.onsuccess = () => resolve();
    req.onerror   = e  => reject(e.target.error);
  });
}