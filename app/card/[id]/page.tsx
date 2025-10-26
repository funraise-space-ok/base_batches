'use client';

import { useParams, useRouter } from 'next/navigation';
import { Button, Container, Stack, Box } from '@mui/material';
import { ArrowBack } from '@mui/icons-material';
import { Card } from 'components/Card/Card';
import { CardDetails } from 'components/CardDetails/CardDetails';
import { useMemo } from 'react';

// Mock data - reemplazar con datos reales del contrato
const mockCards = [
  {
    id: 1,
    name: "Lionel Messi",
    country: "Argentina",
    sport: "soccer" as const,
    type: "gold" as const,
    source: "https://example.com/messi.jpg",
    image: "https://example.com/messi.jpg",
    rarity: "Legendary",
    metadata: {
      age: 36,
      bio: "Considerado uno de los mejores futbolistas de todos los tiempos...",
      latestResults: [
        { 
          tournament: "World Cup",
          category: "Final",
          result: "Winner", 
          awardAmount: 50000,
          date: "2022-12-18"
        },
        { 
          tournament: "Copa America",
          category: "Final",
          result: "Runner-up", 
          awardAmount: 25000,
          date: "2021-07-10"
        }
      ],
      profileUrl: "https://example.com/messi"
    }
  }
];

export default function CardPage() {
  const params = useParams();
  const router = useRouter();
  const cardId = parseInt(params.id as string);

  const card = useMemo(() => {
    return mockCards.find(c => c.id === cardId) || mockCards[0];
  }, [cardId]);

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
        
        <Box
          sx={{
            display: 'flex',
            gap: 4,
            flexDirection: { xs: 'column', md: 'row' },
            alignItems: { xs: 'center', md: 'flex-start' }
          }}
        >
          <Box sx={{ flexShrink: 0 }}>
            <Card
              {...card}
            />
          </Box>
          
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <CardDetails card={card} />
          </Box>
        </Box>
      </Stack>
    </Container>
  );
}
