import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Button,
  Group,
  SimpleGrid,
  Card,
  Image,
  Text,
  Badge,
  Loader,
  Stack,
  ActionIcon,
  Tooltip,
} from '@mantine/core';
import {
  IconPlus,
  IconEye,
  IconPointer,
  IconChartBar,
  IconExternalLink,
  IconDisc,
  IconTrash,
} from '@tabler/icons-react';
import CreateMusicLinkModal from '../components/CreateMusicLinkModal';

interface MusicLink {
  id: string;
  title: string;
  artist: string;
  coverUrl: string;
  spotifyUrl: string | null;
  appleMusicUrl: string | null;
  deezerUrl: string | null;
  youtubeUrl: string | null;
  createdAt: string;
  totalViews: number;
  totalClicks: number;
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const [links, setLinks] = useState<MusicLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpened, setModalOpened] = useState(false);

  // Charger la liste des liens
  const fetchLinks = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/music-links');
      const data = await res.json();
      setLinks(data);
    } catch (err) {
      console.error('Erreur chargement links:', err);
    } finally {
      setLoading(false);
    }
  };

  // Supprimer un lien
  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Voulez-vous vraiment supprimer "${title}" ?`)) return;

    try {
      const res = await fetch(`http://localhost:3001/api/music-links/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        fetchLinks();
      }
    } catch (err) {
      console.error('Erreur suppression:', err);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  return (
    <Container size="lg" py="xl">
      {/* En-tête */}
      <Group justify="space-between" mb="xl">
        <div>
          <Group gap="xs">
            <IconDisc size={32} color="#1DB954" />
            <Title order={1}>MusicLink Analytics</Title>
          </Group>
          <Text c="dimmed" size="sm">
            Gérez vos smartlinks musicaux et analysez leurs performances
          </Text>
        </div>
        <Button
          leftSection={<IconPlus size={18} />}
          color="green"
          radius="md"
          size="md"
          onClick={() => setModalOpened(true)}
        >
          Créer un MusicLink
        </Button>
      </Group>

      {/* Contenu principal */}
      {loading ? (
        <Group justify="center" py="xl">
          <Loader color="green" size="lg" />
        </Group>
      ) : links.length === 0 ? (
        <Card padding="xl" radius="md" withBorder ta="center" py={60}>
          <Stack align="center" gap="sm">
            <IconDisc size={50} color="gray" opacity={0.5} />
            <Title order={3}>Aucun MusicLink créé pour le moment</Title>
            <Text c="dimmed" maw={450}>
              Créez votre premier smartlink en recherchant un morceau sur Spotify. Nous générerons automatiquement les liens pour les autres plateformes.
            </Text>
            <Button
              mt="sm"
              color="green"
              leftSection={<IconPlus size={18} />}
              onClick={() => setModalOpened(true)}
            >
              Créer mon premier MusicLink
            </Button>
          </Stack>
        </Card>
      ) : (
        <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
          {links.map((link) => (
            <Card key={link.id} padding="md" radius="md" withBorder shadow="sm">
              <Card.Section>
                <Image
                  src={link.coverUrl}
                  height={180}
                  alt={link.title}
                  fallbackSrc="https://placehold.co/400x400?text=No+Cover"
                />
              </Card.Section>

              <Stack gap="xs" mt="md">
                <Group justify="space-between" align="flex-start" wrap="nowrap">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <Text fw={700} size="lg" lineClamp={1}>
                      {link.title}
                    </Text>
                    <Text size="sm" c="dimmed" lineClamp={1}>
                      {link.artist}
                    </Text>
                  </div>
                  {/* Bouton de suppression */}
                  <Tooltip label="Supprimer ce MusicLink">
                    <ActionIcon
                      variant="subtle"
                      color="red"
                      size="sm"
                      onClick={() => handleDelete(link.id, link.title)}
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Tooltip>
                </Group>

                {/* Badges de vues / clics */}
                <Group justify="space-between" mt="xs">
                  <Badge variant="light" color="blue" leftSection={<IconEye size={14} />}>
                    {link.totalViews || 0} vues
                  </Badge>
                  <Badge variant="light" color="green" leftSection={<IconPointer size={14} />}>
                    {link.totalClicks || 0} clics
                  </Badge>
                  <Text size="xs" c="dimmed">
                    {new Date(link.createdAt).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'short',
                    })}
                  </Text>
                </Group>

                {/* Actions */}
                <Group gap="xs" mt="md" grow>
                  <Button
                    variant="light"
                    color="gray"
                    size="xs"
                    leftSection={<IconExternalLink size={14} />}
                    onClick={() => navigate(`/music-link/${link.id}`)}
                  >
                    Page publique
                  </Button>
                  <Button
                    variant="filled"
                    color="green"
                    size="xs"
                    leftSection={<IconChartBar size={14} />}
                    onClick={() => navigate(`/music-link/${link.id}/report`)}
                  >
                    Analytics
                  </Button>
                </Group>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {/* Modale de création */}
      <CreateMusicLinkModal
        opened={modalOpened}
        onClose={() => setModalOpened(false)}
        onSuccess={fetchLinks}
      />
    </Container>
  );
}