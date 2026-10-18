# 🎵 MusicLink Analytics — Test Technique Full-Stack

Application Full-Stack de création de Smartlinks musicaux (type Fanbase / Songwhip) avec moteur de tracking d'audience en temps réel et tableau de bord analytique.

Projet réalisé dans le cadre du test technique pour **Base for Music**.

---

## 🛠 Stack Technique Imposée

- **Frontend :** React 18, TypeScript, Mantine UI v7, Recharts, Tabler Icons, React Router v7.
- **Backend :** Node.js (v20+), Express, TypeScript, Kysely (Query Builder SQL typé), SQLite (`better-sqlite3`).
- **Architecture :** Monorepo orchestré avec scripts racine et `concurrently`.

---

## 🚀 Démarrage Rapide (En une seule commande)

Comme spécifié dans le sujet, l'ensemble du projet (Frontend + Backend) se lance depuis la racine avec :

```bash
npm install && npm run dev