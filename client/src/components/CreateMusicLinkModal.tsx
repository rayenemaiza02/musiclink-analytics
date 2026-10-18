import { useState, useEffect } from 'react';
  import {
  Modal,
  TextInput,
  Button,
  Group,
  Stack,
  Card,
  Image,
  Text,
  Loader,
  Badge,
  Alert,
  Divider,
} from '@mantine/core';
import { IconSearch, IconCheck, IconMusic, IconAlertCircle } from '@tabler/icons-react';

interface SpotifyTrack {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  spotifyUrl: string;
}

interface CreateMusicLinkModalProps {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function CreateMusicLinkModal({
  opened,
  onClose,
  onSuccess,
}: CreateMusicLinkModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searching, setSearching] = useState(false);
  const [tracks, setTracks] = useState<SpotifyTrack[]>([]);
  const [selectedTrack, setSelectedTrack] = useState<SpotifyTrack | null>(null);

  // Liens des plateformes
  const [spotifyUrl, setSpotifyUrl] = useState('');
  const [appleMusicUrl, setAppleMusicUrl] = useState('');
  const [deezerUrl, setDeezerUrl] = useState('');
  const [youtubeUrl, setYoutubeUrl] = useState('');

  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Charger les morceaux suggérés dès l'ouverture de la modale
  useEffect(() => {
    if (opened && tracks.length === 0) {
      fetch('http://localhost:3001/api/search/spotify?query=')
        .then((res) => res.json())
        .then((data) => setTracks(data))
        .catch(console.error);
    }
  }, [opened]);
  // 1. Rechercher une track Spotify
  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setSearching(true);
    setError(null);
    try {
      const res = await fetch(`http://localhost:3001/api/search/spotify?query=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setTracks(data);
      if (data.length === 0) {
        setError('Aucun morceau trouvé.');
      }
    } catch (err) {
      setError('Erreur lors de la recherche Spotify.');
    } finally {
      setSearching(false);
    }
  };

  // 2. Sélectionner une track et interroger Soundcharts pour les autres plateformes
  const handleSelectTrack = async (track: SpotifyTrack) => {
    setSelectedTrack(track);
    setSpotifyUrl(track.spotifyUrl);
    setLoadingSimilar(true);
    setError(null);

    try {
      const res = await fetch(`http://localhost:3001/api/tracks/${track.id}/similar`);
      const similar = await res.json();
      setAppleMusicUrl(similar.appleMusicUrl || '');
      setDeezerUrl(similar.deezerUrl || '');
      setYoutubeUrl(similar.youtubeUrl || '');
    } catch (err) {
      console.error('Erreur Soundcharts:', err);
    } finally {
      setLoadingSimilar(false);
    }
  };

  // 3. Valider et créer le MusicLink
  const handleCreate = async () => {
    if (!selectedTrack) return;

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:3001/api/music-links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: selectedTrack.title,
          artist: selectedTrack.artist,
          coverUrl: selectedTrack.coverUrl,
          spotifyUrl: spotifyUrl || null,
          appleMusicUrl: appleMusicUrl || null,
          deezerUrl: deezerUrl || null,
          youtubeUrl: youtubeUrl || null,
        }),
      });

      if (!res.ok) throw new Error('Erreur de création');

      // Réinitialiser l'état et fermer la modale
      setSelectedTrack(null);
      setTracks([]);
      setSearchQuery('');
      onSuccess();
      onClose();
    } catch (err) {
      setError('Impossible de créer le MusicLink.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={
        <Group>
          <IconMusic size={22} color="#1DB954" />
          <Text fw={700} size="lg">Créer un nouveau MusicLink</Text>
        </Group>
      }
      size="lg"
      radius="md"
    >
      <Stack gap="md">
        {error && (
          <Alert icon={<IconAlertCircle size={16} />} color="red" radius="md">
            {error}
          </Alert>
        )}

        {/* Étape 1 : Barre de recherche */}
        <form onSubmit={handleSearch}>
          <Group align="flex-end">
            <TextInput
              style={{ flex: 1 }}
              label="Rechercher une chanson sur Spotify"
              placeholder="Ex: Get Lucky, The Weeknd, Dua Lipa..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.currentTarget.value)}
              leftSection={<IconSearch size={16} />}
            />
            <Button type="submit" loading={searching} color="green">
              Rechercher
            </Button>
          </Group>
        </form>

        {/* Résultats de recherche */}
        {!selectedTrack && tracks.length > 0 && (
          <Stack gap="xs" style={{ maxHeight: 300, overflowY: 'auto' }}>
            <Text size="sm" c="dimmed">Sélectionnez le morceau :</Text>
            {tracks.map((track) => (
              <Card
                key={track.id}
                padding="xs"
                radius="sm"
                withBorder
                style={{ cursor: 'pointer', transition: 'transform 0.1s' }}
                onClick={() => handleSelectTrack(track)}
              >
                <Group justify="space-between">
                  <Group>
                    <Image src={track.coverUrl} w={45} h={45} radius="sm" />
                    <div>
                      <Text fw={600} size="sm">{track.title}</Text>
                      <Text size="xs" c="dimmed">{track.artist}</Text>
                    </div>
                  </Group>
                  <Button size="xs" variant="light" color="green">
                    Choisir
                  </Button>
                </Group>
              </Card>
            ))}
          </Stack>
        )}

        {/* Étape 2 : Aperçu et liens des plateformes */}
        {selectedTrack && (
          <Stack gap="sm">
            <Divider label="Morceau sélectionné" labelPosition="center" />
            <Card withBorder padding="sm" radius="md" bg="dark.7">
              <Group>
                <Image src={selectedTrack.coverUrl} w={60} h={60} radius="md" />
                <div style={{ flex: 1 }}>
                  <Text fw={700} size="md">{selectedTrack.title}</Text>
                  <Text size="sm" c="dimmed">{selectedTrack.artist}</Text>
                  <Badge color="green" size="xs" mt={4}>Prêt à générer</Badge>
                </div>
                <Button size="xs" variant="subtle" color="gray" onClick={() => setSelectedTrack(null)}>
                  Changer
                </Button>
              </Group>
            </Card>

            {loadingSimilar ? (
              <Group justify="center" py="md">
                <Loader size="sm" color="green" />
                <Text size="sm" c="dimmed">Récupération des correspondances via Soundcharts...</Text>
              </Group>
            ) : (
              <Stack gap="xs">
                <Text size="sm" fw={500}>Liens des plateformes (détectés automatiquement) :</Text>
                <TextInput
                  label="Spotify"
                  value={spotifyUrl}
                  onChange={(e) => setSpotifyUrl(e.target.value)}
                  size="xs"
                />
                <TextInput
                  label="Apple Music"
                  value={appleMusicUrl}
                  onChange={(e) => setAppleMusicUrl(e.target.value)}
                  size="xs"
                />
                <TextInput
                  label="Deezer"
                  value={deezerUrl}
                  onChange={(e) => setDeezerUrl(e.target.value)}
                  size="xs"
                />
                <TextInput
                  label="YouTube"
                  value={youtubeUrl}
                  onChange={(e) => setYoutubeUrl(e.target.value)}
                  size="xs"
                />
              </Stack>
            )}

            <Button
              fullWidth
              size="md"
              color="green"
              mt="md"
              onClick={handleCreate}
              loading={submitting}
              leftSection={<IconCheck size={18} />}
            >
              Générer le MusicLink
            </Button>
          </Stack>
        )}
      </Stack>
    </Modal>
  );
}