import { Router, Request, Response } from 'express';
import { searchSpotifyTracks } from '../services/spotifyService.js';
import { getSimilarTracksFromSoundcharts } from '../services/soundchartsService.js';

const router = Router();

// GET /api/search/spotify?query=...
router.get('/search/spotify', async (req: Request, res: Response) => {
  try {
    const query = (req.query.query as string) || '';
    const tracks = await searchSpotifyTracks(query);
    res.json(tracks);
  } catch (error) {
    console.error('Erreur search spotify:', error);
    res.status(500).json({ error: 'Erreur lors de la recherche Spotify' });
  }
});

// GET /api/tracks/:spotifyTrackId/similar
router.get('/tracks/:spotifyTrackId/similar', async (req: Request, res: Response) => {
  try {
    const { spotifyTrackId } = req.params;
    const links = await getSimilarTracksFromSoundcharts(spotifyTrackId);
    res.json(links);
  } catch (error) {
    console.error('Erreur soundcharts tracks:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des liens Soundcharts' });
  }
});

export default router;