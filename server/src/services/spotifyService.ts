export interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  spotifyUrl: string;
}

// Données de démonstration réalistes pour tester sans avoir besoin de compte développeur Spotify
const MOCK_TRACKS: SpotifyTrack[] = [
  {
    id: 'spotify-1',
    title: 'Get Lucky',
    artist: 'Daft Punk ft. Pharrell Williams',
    coverUrl: 'https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=500&auto=format&fit=crop&q=60',
    spotifyUrl: 'https://open.spotify.com/track/2Foc5Q5nqNiosCNqttzHof',
  },
  {
    id: 'spotify-2',
    title: 'Blinding Lights',
    artist: 'The Weeknd',
    coverUrl: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=60',
    spotifyUrl: 'https://open.spotify.com/track/0VjIjW4GlUZAMYd2vXMi3b',
  },
  {
    id: 'spotify-3',
    title: 'Levitating',
    artist: 'Dua Lipa',
    coverUrl: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=60',
    spotifyUrl: 'https://open.spotify.com/track/463CkQjx2Zk1yXoBuierM9',
  },
  {
    id: 'spotify-4',
    title: 'Starboy',
    artist: 'The Weeknd ft. Daft Punk',
    coverUrl: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=60',
    spotifyUrl: 'https://open.spotify.com/track/7MXVkk9YM5IZxh0WSlVI1q',
  },
];

export async function searchSpotifyTracks(query: string): Promise<SpotifyTrack[]> {
  const token = process.env.SPOTIFY_ACCESS_TOKEN;

  // 1. Si un vrai token est fourni dans le .env, on interroge la vraie API Spotify
  if (token) {
    try {
      const response = await fetch(
        `https://api.spotify.com/v1/search?q=${encodeURIComponent(query)}&type=track&limit=10`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.ok) {
        const data = await response.json();
        return data.tracks.items.map((item: any) => ({
          id: item.id,
          title: item.name,
          artist: item.artists.map((a: any) => a.name).join(', '),
          coverUrl: item.album.images[0]?.url || '',
          spotifyUrl: item.external_urls.spotify,
        }));
      }
      console.warn('⚠️ Token Spotify invalide ou expiré, bascule sur les données de test (Mock).');
    } catch (error) {
      console.warn('⚠️ Erreur réseau Spotify, bascule sur les données de test (Mock).');
    }
  }

  // 2. Mode Mock (sans token ou si l'API échoue) : recherche par mot-clé dans notre catalogue de démo
  const cleanQuery = query.toLowerCase().trim();
  if (!cleanQuery) return MOCK_TRACKS;

  const filtered = MOCK_TRACKS.filter(
    (t) =>
      t.title.toLowerCase().includes(cleanQuery) ||
      t.artist.toLowerCase().includes(cleanQuery)
  );

  return filtered.length > 0 ? filtered : MOCK_TRACKS;
}