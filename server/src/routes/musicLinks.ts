import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import { db } from '../db/index.js';
import { EventType } from '../db/types.js';

const router = Router();

// ==========================================
// 1. GET /api/music-links : Liste pour le Dashboard
// Récupère les morceaux avec le total de vues et de clics
// ==========================================
router.get('/', async (req: Request, res: Response) => {
  try {
    const links = await db
      .selectFrom('music_links')
      .selectAll()
      .select((eb) => [
        // Sous-requête Kysely pour compter les vues
        eb
          .selectFrom('music_link_events')
          .select(eb.fn.count('id').as('views'))
          .whereRef('music_link_events.musicLinkId', '=', 'music_links.id')
          .where('eventType', '=', 'page_view')
          .as('totalViews'),
        // Sous-requête Kysely pour compter les clics
        eb
          .selectFrom('music_link_events')
          .select(eb.fn.count('id').as('clicks'))
          .whereRef('music_link_events.musicLinkId', '=', 'music_links.id')
          .where('eventType', '=', 'platform_click')
          .as('totalClicks'),
      ])
      .orderBy('createdAt', 'desc')
      .execute();

    res.json(links);
  } catch (error) {
    console.error('Erreur GET /api/music-links:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des liens.' });
  }
});

// ==========================================
// 2. POST /api/music-links : Création d'un MusicLink
// ==========================================
router.post('/', async (req: Request, res: Response) => {
  try {
    const { title, artist, coverUrl, spotifyUrl, appleMusicUrl, deezerUrl, youtubeUrl } = req.body;

    // Validation des champs obligatoires
    if (!title || !artist || !coverUrl) {
      return res.status(400).json({ error: 'Le titre, l\'artiste et la pochette sont obligatoires.' });
    }

    // Identifiant court et unique (ex: "a1b2c3d4", similaire aux URLs de démo fanbase.to)
    const id = crypto.randomUUID().slice(0, 8);
    const now = new Date().toISOString();

    const newLink = {
      id,
      title,
      artist,
      coverUrl,
      spotifyUrl: spotifyUrl || null,
      appleMusicUrl: appleMusicUrl || null,
      deezerUrl: deezerUrl || null,
      youtubeUrl: youtubeUrl || null,
      createdAt: now,
      updatedAt: now,
    };

    await db.insertInto('music_links').values(newLink).execute();

    res.status(201).json(newLink);
  } catch (error) {
    console.error('Erreur POST /api/music-links:', error);
    res.status(500).json({ error: 'Erreur lors de la création du lien.' });
  }
});

// ==========================================
// 3. GET /api/music-links/:id : Détail pour la page publique
// ==========================================
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const link = await db
      .selectFrom('music_links')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!link) {
      return res.status(404).json({ error: 'MusicLink introuvable.' });
    }

    res.json(link);
  } catch (error) {
    console.error('Erreur GET /api/music-links/:id:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du lien.' });
  }
});

// ==========================================
// 4. POST /api/music-links/:id/events : Tracking (Vues & Clics)
// ==========================================
router.post('/:id/events', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { eventType, platform, metadata } = req.body;

    // Vérifier que le type d'événement est valide
    if (eventType !== 'page_view' && eventType !== 'platform_click') {
      return res.status(400).json({ error: 'eventType doit être "page_view" ou "platform_click".' });
    }

    // Vérifier que le MusicLink existe bien
    const linkExists = await db
      .selectFrom('music_links')
      .select('id')
      .where('id', '=', id)
      .executeTakeFirst();

    if (!linkExists) {
      return res.status(404).json({ error: 'MusicLink introuvable.' });
    }

    const eventId = crypto.randomUUID();
    const now = new Date().toISOString();

    await db
      .insertInto('music_link_events')
      .values({
        id: eventId,
        musicLinkId: id,
        eventType: eventType as EventType,
        platform: eventType === 'platform_click' ? platform || null : null,
        metadata: metadata ? JSON.stringify(metadata) : null,
        createdAt: now,
      })
      .execute();

    res.status(201).json({ success: true, eventId });
  } catch (error) {
    console.error('Erreur POST /api/music-links/:id/events:', error);
    res.status(500).json({ error: 'Erreur lors de l\'enregistrement de l\'événement.' });
  }
});

// ==========================================
// 5. GET /api/music-links/:id/report : Calcul des Analytics
// ==========================================
router.get('/:id/report', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    // 1. Récupérer le morceau
    const link = await db
      .selectFrom('music_links')
      .selectAll()
      .where('id', '=', id)
      .executeTakeFirst();

    if (!link) {
      return res.status(404).json({ error: 'MusicLink introuvable.' });
    }

    // 2. Récupérer tous les événements de ce morceau
    const events = await db
      .selectFrom('music_link_events')
      .selectAll()
      .where('musicLinkId', '=', id)
      .orderBy('createdAt', 'asc')
      .execute();

    // 3. Calculer les KPIs principaux
    const totalViews = events.filter((e) => e.eventType === 'page_view').length;
    const totalClicks = events.filter((e) => e.eventType === 'platform_click').length;
    const clickThroughRate = totalViews > 0 ? Number(((totalClicks / totalViews) * 100).toFixed(1)) : 0;    
    // 4. Calculer les clics par plateforme
    const platformCounts: Record<string, number> = {};
    for (const e of events) {
      if (e.eventType === 'platform_click' && e.platform) {
        platformCounts[e.platform] = (platformCounts[e.platform] || 0) + 1;
      }
    }
    const clicksByPlatform = Object.entries(platformCounts).map(([platform, clicks]) => ({
      platform,
      clicks,
    }));

    // 5. Calculer l'évolution dans le temps (par jour YYYY-MM-DD)
    const timelineMap: Record<string, { date: string; views: number; clicks: number }> = {};

    for (const e of events) {
      const date = e.createdAt.slice(0, 10); // Ex: "2026-10-17"
      if (!timelineMap[date]) {
        timelineMap[date] = { date, views: 0, clicks: 0 };
      }
      if (e.eventType === 'page_view') {
        timelineMap[date].views += 1;
      } else if (e.eventType === 'platform_click') {
        timelineMap[date].clicks += 1;
      }
    }

    const timeSeries = Object.values(timelineMap).sort((a, b) => a.date.localeCompare(b.date));

    // Réponse complète prête pour le front et Recharts
    res.json({
      musicLink: link,
      metrics: {
        totalViews,
        totalClicks,
        clickThroughRate,
      },
      clicksByPlatform,
      timeSeries,
    });
  } catch (error) {
    console.error('Erreur GET /api/music-links/:id/report:', error);
    res.status(500).json({ error: 'Erreur lors du calcul du rapport.' });
  }
});
// ==========================================
// 6. DELETE /api/music-links/:id : Supprimer un MusicLink
// ==========================================
router.delete('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    await db.deleteFrom('music_links').where('id', '=', id).execute();
    res.json({ success: true, message: 'MusicLink supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur DELETE /api/music-links/:id:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression du lien.' });
  }
});

export default router;