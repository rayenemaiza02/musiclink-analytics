export interface SimilarPlatformLinks {
  appleMusicUrl: string | null;
  deezerUrl: string | null;
  youtubeUrl: string | null;
}

// Vrais liens pour nos morceaux de démonstration
const REAL_MOCK_LINKS: Record<string, SimilarPlatformLinks> = {
  'spotify-1': {
    // Daft Punk - Get Lucky
    deezerUrl: 'https://www.deezer.com/track/67238735',
    youtubeUrl: 'https://www.youtube.com/watch?v=5NV6Rdv1a3I',
    appleMusicUrl: 'https://music.apple.com/fr/album/get-lucky-radio-edit/636988950?i=636988960',
  },
  'spotify-2': {
    // The Weeknd - Blinding Lights
    deezerUrl: 'https://www.deezer.com/track/908604612',
    youtubeUrl: 'https://www.youtube.com/watch?v=4NRXx6U8ABQ',
    appleMusicUrl: 'https://music.apple.com/fr/album/blinding-lights/1499378108?i=1499378607',
  },
  'spotify-3': {
    // Dua Lipa - Levitating
    deezerUrl: 'https://www.deezer.com/track/917578052',
    youtubeUrl: 'https://www.youtube.com/watch?v=TUVcZfQe-Kw',
    appleMusicUrl: 'https://music.apple.com/fr/album/levitating/1532770887?i=1532771142',
  },
  'spotify-4': {
    // The Weeknd ft. Daft Punk - Starboy
    deezerUrl: 'https://www.deezer.com/track/136334542',
    youtubeUrl: 'https://www.youtube.com/watch?v=34Na4j8AVgA',
    appleMusicUrl: 'https://music.apple.com/fr/album/starboy-feat-daft-punk/1440871441?i=1440871446',
  },
};

export async function getSimilarTracksFromSoundcharts(
  spotifyTrackId: string
): Promise<SimilarPlatformLinks> {
  const token = process.env.SOUNDCHARTS_API_TOKEN;

  // 1. Si un vrai token Soundcharts est configuré
  if (token) {
    try {
      const response = await fetch(
        `https://customer.api.soundcharts.com/api/v2/track/${spotifyTrackId}/identifiers`,
        {
          headers: {
            'x-app-id': 'soundcharts',
            'x-api-key': token,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        const identifiers = data.items || [];
        return {
          appleMusicUrl: identifiers.find((i: any) => i.platform === 'apple-music')?.url || null,
          deezerUrl: identifiers.find((i: any) => i.platform === 'deezer')?.url || null,
          youtubeUrl: identifiers.find((i: any) => i.platform === 'youtube')?.url || null,
        };
      }
    } catch (error) {
      console.warn('⚠️ Erreur Soundcharts API, bascule sur les liens mockés.');
    }
  }

  // 2. Si le morceau fait partie de nos morceaux de démo, on renvoie ses vrais liens officiels
  if (REAL_MOCK_LINKS[spotifyTrackId]) {
    return REAL_MOCK_LINKS[spotifyTrackId];
  }

  // 3. Fallback universel pour n'importe quel autre ID
  return {
    deezerUrl: `https://www.deezer.com/search/${encodeURIComponent(spotifyTrackId)}`,
    youtubeUrl: `https://www.youtube.com/results?search_query=${encodeURIComponent(spotifyTrackId)}`,
    appleMusicUrl: `https://music.apple.com/search?term=${encodeURIComponent(spotifyTrackId)}`,
  };
}