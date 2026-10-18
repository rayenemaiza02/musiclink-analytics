# 🎵 MusicLink Analytics — Test Technique Full-Stack
Application Full-Stack de création de Smartlinks musicaux avec moteur de tracking d'audience en temps réel et tableau de bord analytique.
Projet réalisé dans le cadre du test technique pour **Base for Music**.

##  1. Installation et Lancement Rapide
Comme spécifié dans le sujet (Section 7), l'ensemble du projet (Frontend + Backend) se lance depuis la racine avec **une seule commande** :
```bash
npm install && npm run dev
  
Frontend : http://localhost:5173 
Backend API : http://localhost:3001

Initialisation de la base : La base de données SQLite et ses tables s'initialisent automatiquement au premier démarrage dans server/data/musiclink.db. Aucune commande de migration manuelle n'est requise.

 2. Parcours de Test pour l'Évaluateur (en 2 minutes)
Création d'un MusicLink :
Cliquez sur "Créer un MusicLink" sur le Dashboard.
Les morceaux de démonstration sont suggérés immédiatement dès l'ouverture (Daft Punk, The Weeknd, Dua Lipa...).
Cliquez sur "Choisir" : les liens officiels Spotify, Deezer, YouTube et Apple Music sont détectés et pré-remplis automatiquement.
Cliquez sur "Générer le MusicLink".
Page Publique & Tracking en Temps Réel :
Cliquez sur "Page publique" sur la carte créée : la page Fanlink s'ouvre (une vue page_view est immédiatement comptabilisée).
Cliquez sur Deezer, Spotify ou YouTube : la vraie musique se lance dans un nouvel onglet et un événement platform_click est enregistré dans SQLite.
Un bouton "← Retour au Dashboard" permet de revenir facilement.
Rapport Analytics (/music-link/:id/report) :
Cliquez sur "Analytics" sur la carte : visualisez le Total de Vues, Total de Clics, le Taux de Clic (CTR %), le graphique Recharts d'évolution journalière et le tableau de répartition par plateforme.
Suppression :
Une icône corbeille sur chaque carte permet de supprimer un MusicLink (la suppression en cascade SQLite nettoie automatiquement tous les événements liés).

 3. Présentation de l'Architecture
Le projet est structuré sous la forme d'un Monorepo simple orchestré par des scripts racine et l'outil concurrently :

musiclink-analytics/
├── client/                     # Frontend React + TypeScript (Vite)
│   ├── src/
│   │   ├── components/
│   │   │   └── CreateMusicLinkModal.tsx  # Modale avec suggestions et auto-remplissage
│   │   ├── pages/
│   │   │   ├── DashboardPage.tsx         # Accueil : Liste des smartlinks, compteurs et suppression
│   │   │   ├── PublicMusicLinkPage.tsx   # Page publique Fanlink (/music-link/:id)
│   │   │   └── AnalyticsReportPage.tsx   # Reporting avec KPIs, Recharts et tableau (/music-link/:id/report)
│   │   ├── App.tsx             # Configuration du routage React Router v7
│   │   └── main.tsx            # Providers Mantine (Dark Theme) et Router
├── server/                     # Backend Node.js + Express + TypeScript
│   ├── src/
│   │   ├── db/
│   │   │   ├── index.ts        # Connexion SQLite (better-sqlite3) et auto-init des tables
│   │   │   └── types.ts        # Schéma Kysely fortement typé
│   │   ├── routes/
│   │   │   ├── musicLinks.ts   # Endpoints CRUD, tracking (/events) et analytics (/report)
│   │   │   └── external.ts     # Endpoints de recherche Spotify et correspondances Soundcharts
│   │   ├── services/
│   │   │   ├── spotifyService.ts      # Service Spotify (API officielle + Fallback Mock)
│   │   │   └── soundchartsService.ts  # Service Soundcharts (API officielle + Fallback Mock)
│   │   └── index.ts            # Point d'entrée serveur Express
├── .env.example
├── package.json                # Scripts racine (npm run dev)
└── README.md

  
Modélisation des Données (SQLite avec Kysely)
Table music_links : id (PK), title, artist, coverUrl, spotifyUrl, appleMusicUrl, deezerUrl, youtubeUrl, createdAt, updatedAt.

Table music_link_events : id (PK), musicLinkId (FK avec ON DELETE CASCADE), eventType (page_view ou platform_click), platform, metadata, createdAt.
 
 4. Choix Techniques Effectués et Justifications
React 18 & Mantine UI v7 :
Utilisation de Mantine UI pour concevoir une interface épurée, responsive et immersive en Dark Theme (proche des codes graphiques de Spotify et Fanbase).
Recharts :
Intégration d'un composant AreaChart avec dégradés pour répondre à la techno imposée et visualiser l'évolution journalière des vues et clics.
Kysely & better-sqlite3 :
Kysely a été choisi pour construire des requêtes SQL 100% typées et sécurisées en TypeScript. L'agrégation des vues et des clics pour le Dashboard est réalisée directement en SQL via des sous-requêtes imbriquées pour garantir des performances optimales.
Protection Anti-Doublon React 18 :
En mode strict (StrictMode), React 18 monte les composants deux fois en développement. Une référence useRef a été implémentée pour garantir qu'exactement une seule vue soit enregistrée par visite réelle.
Architecture API Hybride Résiliente :
Si un SPOTIFY_ACCESS_TOKEN ou SOUNDCHARTS_API_TOKEN est présent dans .env, le backend interroge les vraies API.
Sans token, l'application bascule automatiquement sur un catalogue de démonstration réaliste avec de vrais liens d'écoute. 

 5. Éventuelles Limites Rencontrées
Expiration des Tokens Spotify : Les tokens d'accès Spotify expirent toutes les 60 minutes, ce qui nécessite habituellement un flux OAuth complexe de rafraîchissement avec client_secret. Le mode hybride implémenté permet de s'affranchir de cette contrainte pour l'évaluation.
Environnement Sandbox Soundcharts : L'API Soundcharts en mode Sandbox limite l'accès à certaines données d'identifiants selon les régions. Le fallback mock pré-remplit des liens officiels Deezer/YouTube garantissant une écoute fonctionnelle.

🔮 6. Améliorations Possibles avec Plus de Temps
Authentification & Espaces Artistes : Ajout d'une table users pour cloisonner les smartlinks par artiste ou label.
Enrichissement des Métadonnées : Collecte du pays d'origine (via IP) et du type d'appareil (Mobile vs Desktop via User-Agent) dans le champ metadata des événements pour fournir des statistiques démographiques.
Export des Rapports : Bouton d'export des analytics au format CSV ou PDF pour les bilans marketing d'artistes.
Tests Automatisés : Mise en place d'une suite de tests d'intégration avec Vitest et Supertest pour valider automatiquement les routes API et le tracking.
