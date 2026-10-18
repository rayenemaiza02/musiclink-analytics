export interface MusicLinksTable {
  id: string;              // Identifiant unique du MusicLink (ex: slug ou uuid)
  title: string;           // Titre du morceau
  artist: string;          // Nom de l'artiste
  coverUrl: string;        // URL de la pochette d'album
  spotifyUrl: string | null;     // Lien Spotify
  appleMusicUrl: string | null;  // Lien Apple Music
  deezerUrl: string | null;      // Lien Deezer
  youtubeUrl: string | null;     // Lien YouTube
  createdAt: string;       // Date de création (format ISO: YYYY-MM-DDTHH:mm:ss.sssZ)
  updatedAt: string;       // Date de dernière mise à jour
}

// Les 2 types d'événements demandés par le test (section 4.4)
export type EventType = 'page_view' | 'platform_click';

export interface MusicLinkEventsTable {
  id: string;              // Identifiant de l'événement
  musicLinkId: string;     // Lié à l'id du MusicLink (clé étrangère)
  eventType: EventType;    // 'page_view' ou 'platform_click'
  platform: string | null; // Null pour une vue de page, nom du service pour un clic (ex: 'spotify')
  metadata: string | null; // Informations additionnelles si besoin (ex: JSON)
  createdAt: string;       // Horodatage de l'événement
}

// L'interface globale qui rassemble toutes les tables pour Kysely
export interface Database {
  music_links: MusicLinksTable;
  music_link_events: MusicLinkEventsTable;
}