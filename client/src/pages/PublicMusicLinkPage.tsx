import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Card,
  Image,
  Text,
  Title,
  Button,
  Stack,
  Group,
  Loader,
  Alert,
  Center,
  Box,
} from '@mantine/core';
import {
  IconBrandSpotify,
  IconBrandApple,
  IconBrandYoutube,
  IconMusic,
  IconAlertCircle,
  IconArrowLeft,
} from '@tabler/icons-react';

interface MusicLink {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  spotifyUrl: string | null;
  appleMusicUrl: string | null;
  deezerUrl: string | null;
  youtubeUrl: string | null;
}

export default function PublicMusicLinkPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [link, setLink] = useState<MusicLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Protection contre le double-tracking de React 18 en mode développement
  const viewTrackedRef = useRef(false);

  // 1. Récupérer les données du lien et enregistrer la vue de page
  useEffect(() => {
    if (!id) return;

    const fetchLinkAndTrack = async () => {
      try {
        setLoading(true);
        // Récupérer les infos de la chanson
        const res = await fetch(`http://localhost:3001/api/music-links/${id}`);
        if (!res.ok) {
          throw new Error('MusicLink non trouvé');
        }
        const data = await res.json();
        setLink(data);

        // Tracker la vue de page (une seule fois par chargement)
        if (!viewTrackedRef.current) {
          viewTrackedRef.current = true;
          fetch(`http://localhost:3001/api/music-links/${id}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ eventType: 'page_view' }),
          }).catch((err) => console.error('Erreur tracking page_view:', err));
        }
      } catch (err: any) {
        setError(err.message || 'Erreur lors du chargement');
      } finally {
        setLoading(false);
      }
    };

    fetchLinkAndTrack();
  }, [id]);

  // 2. Tracker le clic sur une plateforme musicale
  const handlePlatformClick = (platform: string, url: string) => {
    if (!id) return;

    // Envoi de l'événement platform_click au backend
    fetch(`http://localhost:3001/api/music-links/${id}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType: 'platform_click',
        platform,
      }),
    }).catch((err) => console.error('Erreur tracking platform_click:', err));

    // Ouvrir le lien dans un nouvel onglet
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  if (loading) {
    return (
      <Center style={{ minHeight: '100vh' }}>
        <Loader size="xl" color="green" />
      </Center>
    );
  }

  if (error || !link) {
    return (
      <Container size="xs" py={100}>
        <Alert icon={<IconAlertCircle size={20} />} title="Oups !" color="red" radius="md">
          {error || 'Ce MusicLink n\'existe pas.'}
        </Alert>
        <Button mt="md" variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate('/')}>
          Retour au tableau de bord
        </Button>
      </Container>
    );
  }

  // Liste des plateformes disponibles pour cette chanson
  const platforms = [
    {
      key: 'spotify',
      name: 'Spotify',
      url: link.spotifyUrl,
      icon: <IconBrandSpotify size={24} color="#1DB954" />,
      actionText: 'Écouter',
      color: 'green',
    },
    {
      key: 'appleMusic',
      name: 'Apple Music',
      url: link.appleMusicUrl,
      icon: <IconBrandApple size={24} color="#FA2D48" />,
      actionText: 'Écouter',
      color: 'pink',
    },
    {
      key: 'deezer',
      name: 'Deezer',
      url: link.deezerUrl,
      icon: <IconMusic size={24} color="#A238FF" />,
      actionText: 'Écouter',
      color: 'grape',
    },
    {
      key: 'youtube',
      name: 'YouTube',
      url: link.youtubeUrl,
      icon: <IconBrandYoutube size={24} color="#FF0000" />,
      actionText: 'Regarder',
      color: 'red',
    },
  ].filter((p) => Boolean(p.url)); // Ne garde que les plateformes qui ont un lien valide

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'radial-gradient(circle at top, #1a2a1d 0%, #101113 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <Container size={420} style={{ width: '100%' }}>
         {/* Bouton retour vers le Dashboard */}
      <Group justify="flex-start" mb="sm">
        <Button
          variant="subtle"
          color="gray"
          size="xs"
          leftSection={<IconArrowLeft size={16} />}
          onClick={() => navigate('/')}
        >
          ← Retour au Dashboard
        </Button>
      </Group>
        <Card
          shadow="xl"
          padding="xl"
          radius="lg"
          withBorder
          style={{ backdropFilter: 'blur(10px)', backgroundColor: 'rgba(26, 27, 30, 0.9)' }}
        >
          {/* Pochette de l'album */}
          <Center mb="lg">
            <Image
              src={link.coverUrl}
              w={260}
              h={260}
              radius="md"
              alt={link.title}
              shadow="md"
              fallbackSrc="https://placehold.co/300x300?text=Music"
            />
          </Center>

          {/* Titre et Artiste */}
          <Stack gap={4} ta="center" mb="xl">
            <Title order={2} fw={800} size="h3">
              {link.title}
            </Title>
            <Text size="md" c="dimmed" fw={500}>
              {link.artist}
            </Text>
          </Stack>

          {/* Boutons des plateformes */}
          <Stack gap="sm">
            {platforms.map((platform) => (
              <Button
                key={platform.key}
                size="lg"
                radius="md"
                variant="default"
                justify="space-between"
                leftSection={platform.icon}
                rightSection={
                  <Text size="xs" fw={700} c={platform.color}>
                    {platform.actionText}
                  </Text>
                }
                styles={{
                  root: {
                    border: '1px solid rgba(255, 255, 255, 0.1)',
                    transition: 'all 0.2s ease',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      borderColor: 'rgba(255, 255, 255, 0.3)',
                    },
                  },
                }}
                onClick={() => handlePlatformClick(platform.key, platform.url!)}
              >
                <Text fw={600} size="sm">
                  {platform.name}
                </Text>
              </Button>
            ))}
          </Stack>

          <Text size="xs" c="dimmed" ta="center" mt="xl">
            Powered by <strong>MusicLink Analytics</strong>
          </Text>
        </Card>
      </Container>
    </Box>
  );
}