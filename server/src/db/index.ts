import Database from 'better-sqlite3';
import { Kysely, SqliteDialect } from 'kysely';
import path from 'path';
import fs from 'fs';
import { Database as DatabaseSchema } from './types.js';

// 1. Définir le chemin où sera enregistré le fichier SQLite
const dataDir = path.resolve(process.cwd(), 'data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = process.env.DATABASE_URL || path.join(dataDir, 'musiclink.db');

// 2. Ouvrir la connexion avec better-sqlite3
const nativeDb = new Database(dbPath);

// Activer les clés étrangères pour garantir la cohérence entre les 2 tables
nativeDb.pragma('foreign_keys = ON');

// 3. Exporter l'instance Kysely typée avec notre schéma
export const db = new Kysely<DatabaseSchema>({
  dialect: new SqliteDialect({
    database: nativeDb,
  }),
});

/**
 * 4. Fonction qui crée automatiquement les 2 tables au démarrage si elles n'existent pas
 */
export async function initDatabase() {
  // Création de la Table 1 : music_links
  await db.schema
    .createTable('music_links')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('title', 'text', (col) => col.notNull())
    .addColumn('artist', 'text', (col) => col.notNull())
    .addColumn('coverUrl', 'text', (col) => col.notNull())
    .addColumn('spotifyUrl', 'text')
    .addColumn('appleMusicUrl', 'text')
    .addColumn('deezerUrl', 'text')
    .addColumn('youtubeUrl', 'text')
    .addColumn('createdAt', 'text', (col) => col.notNull())
    .addColumn('updatedAt', 'text', (col) => col.notNull())
    .execute();

  // Création de la Table 2 : music_link_events
  await db.schema
    .createTable('music_link_events')
    .ifNotExists()
    .addColumn('id', 'text', (col) => col.primaryKey())
    .addColumn('musicLinkId', 'text', (col) =>
      col.notNull().references('music_links.id').onDelete('cascade')
    )
    .addColumn('eventType', 'text', (col) => col.notNull())
    .addColumn('platform', 'text')
    .addColumn('metadata', 'text')
    .addColumn('createdAt', 'text', (col) => col.notNull())
    .execute();

  console.log('📦 Base SQLite connectée et les 2 tables sont prêtes !');
}