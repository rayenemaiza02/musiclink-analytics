import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Title,
  Text,
  Group,
  Button,
  SimpleGrid,
  Card,
  Image,
  Badge,
  Loader,
  Stack,
  Table,
  Center,
  Alert,
  Paper,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconEye,
  IconPointer,
  IconPercentage,
  IconExternalLink,
  IconAlertCircle,
  IconChartLine,
} from '@tabler/icons-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';

interface ReportData {
  musicLink: {
    id: string;
    title: string;
    artist: string;
    coverUrl: string;
    createdAt: string;
  };
  metrics: {
    totalViews: number;
    totalClicks: number;
    clickThroughRate: number;
  };
  clicksByPlatform: Array<{
    platform: string;
    clicks: number;
  }>;
  timeSeries: Array<{
    date: string;
    views: number;
    clicks: number;
  }>;
}

export default function AnalyticsReportPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<ReportData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchReport = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:3001/api/music-links/${id}/report`);
        if (!res.ok) throw new Error('Rapport introuvable');
        const report = await res.json();
        setData(report);
      } catch (err: any) {
        setError(err.message || 'Erreur lors du calcul du rapport');
      } finally {
        setLoading(false);
      }
    };

    fetchReport();
  }, [id]);

  if (loading) {
    return (
      <Center style={{ minHeight: '80vh' }}>
        <Loader size="xl" color="green" />
      </Center>
    );
  }

  if (error || !data) {
    return (
      <Container size="sm" py={50}>
        <Alert icon={<IconAlertCircle size={20} />} title="Erreur" color="red" radius="md">
          {error || 'Impossible de charger les analytics de ce morceau.'}
        </Alert>
        <Button mt="md" variant="subtle" leftSection={<IconArrowLeft size={16} />} onClick={() => navigate('/')}>
          Retour au tableau de bord
        </Button>
      </Container>
    );
  }

  const { musicLink, metrics, clicksByPlatform, timeSeries } = data;

  return (
    <Container size="lg" py="xl">
      {/* Barre supérieure de navigation */}
      <Group justify="space-between" mb="xl">
        <Button
          variant="subtle"
          color="gray"
          leftSection={<IconArrowLeft size={18} />}
          onClick={() => navigate('/')}
        >
          Retour au Dashboard
        </Button>
        <Button
          variant="light"
          color="green"
          rightSection={<IconExternalLink size={16} />}
          onClick={() => window.open(`/music-link/${musicLink.id}`, '_blank')}
        >
          Voir la page publique
        </Button>
      </Group>

      {/* En-tête du morceau */}
      <Card withBorder radius="md" padding="lg" mb="xl" bg="dark.7">
        <Group>
          <Image
            src={musicLink.coverUrl}
            w={80}
            h={80}
            radius="md"
            alt={musicLink.title}
            fallbackSrc="https://placehold.co/100x100?text=Cover"
          />
          <div>
            <Badge color="green" size="sm" mb={4}>Smartlink actif</Badge>
            <Title order={2}>{musicLink.title}</Title>
            <Text c="dimmed" size="md">{musicLink.artist}</Text>
          </div>
        </Group>
      </Card>

      {/* 1. Métriques Clés (KPIs) */}
      <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" mb="xl">
        <Card withBorder radius="md" padding="lg">
          <Group justify="space-between">
            <Text size="sm" c="dimmed" fw={700} tt="uppercase">
              Total de Vues
            </Text>
            <IconEye size={24} color="#228be6" />
          </Group>
          <Title order={1} mt="md">
            {metrics.totalViews}
          </Title>
          <Text size="xs" c="dimmed" mt={4}>
            Pages ouvertes par des visiteurs
          </Text>
        </Card>

        <Card withBorder radius="md" padding="lg">
          <Group justify="space-between">
            <Text size="sm" c="dimmed" fw={700} tt="uppercase">
              Total de Clics
            </Text>
            <IconPointer size={24} color="#40c057" />
          </Group>
          <Title order={1} mt="md">
            {metrics.totalClicks}
          </Title>
          <Text size="xs" c="dimmed" mt={4}>
            Redirections vers les plateformes
          </Text>
        </Card>

        <Card withBorder radius="md" padding="lg">
          <Group justify="space-between">
            <Text size="sm" c="dimmed" fw={700} tt="uppercase">
              Taux de Clic (CTR)
            </Text>
            <IconPercentage size={24} color="#fab005" />
          </Group>
          <Title order={1} mt="md">
            {metrics.clickThroughRate} %
          </Title>
          <Text size="xs" c="dimmed" mt={4}>
            Efficacité de conversion des visiteurs
          </Text>
        </Card>
      </SimpleGrid>

      {/* 2. Graphique d'évolution dans le temps avec Recharts */}
      <Card withBorder radius="md" padding="lg" mb="xl">
        <Group gap="xs" mb="md">
          <IconChartLine size={22} color="#1DB954" />
          <Title order={3}>Évolution des Vues et Clics dans le temps</Title>
        </Group>
        <Text size="sm" c="dimmed" mb="lg">
          Activité journalière enregistrée sur ce MusicLink
        </Text>

        <div style={{ width: '100%', height: 300 }}>
          {timeSeries.length === 0 ? (
            <Center style={{ height: '100%' }}>
              <Text c="dimmed">Pas encore assez de données temporelles.</Text>
            </Center>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={timeSeries} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#228be6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#228be6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorClicks" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#40c057" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#40c057" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#373A40" />
                <XAxis dataKey="date" stroke="#909296" />
                <YAxis allowDecimals={false} stroke="#909296" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1A1B1E',
                    borderColor: '#2C2E33',
                    borderRadius: 8,
                  }}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="views"
                  name="Vues de page"
                  stroke="#228be6"
                  fillOpacity={1}
                  fill="url(#colorViews)"
                />
                <Area
                  type="monotone"
                  dataKey="clicks"
                  name="Clics plateformes"
                  stroke="#40c057"
                  fillOpacity={1}
                  fill="url(#colorClicks)"
                />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </Card>

      {/* 3. Répartition des Clics par Plateforme */}
      <Card withBorder radius="md" padding="lg">
        <Title order={3} mb="sm">Clics par Plateforme</Title>
        <Text size="sm" c="dimmed" mb="md">
          Détail de l'engagement des fans selon les services d'écoute
        </Text>

        {clicksByPlatform.length === 0 ? (
          <Paper p="md" withBorder ta="center">
            <Text c="dimmed" size="sm">Aucun clic enregistré pour le moment.</Text>
          </Paper>
        ) : (
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Plateforme</Table.Th>
                <Table.Th ta="right">Nombre de Clics</Table.Th>
                <Table.Th ta="right">Part (%)</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {clicksByPlatform.map((item) => {
                const percentage =
                  metrics.totalClicks > 0
                    ? ((item.clicks / metrics.totalClicks) * 100).toFixed(1)
                    : '0';

                return (
                  <Table.Tr key={item.platform}>
                    <Table.Td>
                      <Badge variant="dot" color="green" tt="capitalize" size="lg">
                        {item.platform}
                      </Badge>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text fw={700}>{item.clicks}</Text>
                    </Table.Td>
                    <Table.Td ta="right">
                      <Text c="dimmed">{percentage} %</Text>
                    </Table.Td>
                  </Table.Tr>
                );
              })}
            </Table.Tbody>
          </Table>
        )}
      </Card>
    </Container>
  );
}