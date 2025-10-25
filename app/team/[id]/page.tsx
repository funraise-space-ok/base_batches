'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button, Container, Stack, Box, Typography, Grid } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Card } from 'components/Card/Card';
import { useMemo } from 'react';

// Mock data - reemplazar con datos reales del contrato
const mockTeams = [
  {
    id: 1,
    name: "Team #1",
    package: "A",
    players: [
      { id: 1, name: "Lionel Messi", country: "Argentina", sport: "soccer" as const, type: "gold" as const, source: "https://example.com/messi.jpg", image: "https://example.com/messi.jpg" },
      { id: 2, name: "Cristiano Ronaldo", country: "Portugal", sport: "soccer" as const, type: "gold" as const, source: "https://example.com/ronaldo.jpg", image: "https://example.com/ronaldo.jpg" },
      { id: 3, name: "Neymar Jr", country: "Brazil", sport: "soccer" as const, type: "gold" as const, source: "https://example.com/neymar.jpg", image: "https://example.com/neymar.jpg" },
      { id: 4, name: "Kylian Mbappé", country: "France", sport: "soccer" as const, type: "gold" as const, source: "https://example.com/mbappe.jpg", image: "https://example.com/mbappe.jpg" },
      { id: 5, name: "Erling Haaland", country: "Norway", sport: "soccer" as const, type: "silver" as const, source: "https://example.com/haaland.jpg", image: "https://example.com/haaland.jpg" }
    ]
  }
];

export default function TeamPage() {
  const params = useParams();
  const router = useRouter();
  const teamId = parseInt(params.id as string);

  const team = useMemo(() => {
    return mockTeams.find(t => t.id === teamId) || mockTeams[0];
  }, [teamId]);

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Stack gap={3}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.back()}
          sx={{ alignSelf: 'flex-start' }}
        >
          Volver
        </Button>
        
        <Stack gap={2}>
          <Typography variant="h4" component="h1">
            {team.name}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary">
            Paquete {team.package} • {team.players.length} jugadores
          </Typography>
        </Stack>

        <Grid container spacing={3}>
          {team.players.map((player, index) => (
            <Grid item xs={12} sm={6} md={4} lg={2.4} key={player.id}>
              <Card
                {...player}
                onClick={() => router.push(`/card/${player.id}`)}
              />
            </Grid>
          ))}
        </Grid>
      </Stack>
    </Container>
  );
}
