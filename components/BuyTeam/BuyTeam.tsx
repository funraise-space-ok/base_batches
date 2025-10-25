"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Grid,
  Stack,
  Typography,
} from "@mui/material";
import { useState } from "react";
import { useAccount } from "wagmi";
import { PackTierId, useBaseProgram } from "../../lib/base/useBaseProgram";
import { RocketLaunch } from "@mui/icons-material";

const PACKS: Array<{
  id: PackTierId;
  name: string;
  description: string;
  perks: string[];
  gradient: string;
  accentColor: string;
  bestValue?: boolean;
}> = [
  {
    id: "A",
    name: "Bronze Pack",
    description: "Ideal to start collecting Base Batches with a friendly entry price.",
    perks: ["Random team generated on-chain", "Entry level rewards"],
    gradient: "linear-gradient(135deg, #CD7F32 0%, #8B5E3C 100%)",
    accentColor: "#CD7F32",
  },
  {
    id: "B",
    name: "Silver Pack",
    description: "Balanced option with improved staking multipliers.",
    perks: ["Better staking rewards", "Priority drops when staked"],
    gradient: "linear-gradient(135deg, #C0C0C0 0%, #8A8A8A 100%)",
    accentColor: "#C0C0C0",
    bestValue: true,
  },
  {
    id: "C",
    name: "Gold Pack",
    description: "Premium pack with the highest staking boost and rarity chances.",
    perks: ["Top staking multipliers", "Access to limited drops", "Priority governance votes"],
    gradient: "linear-gradient(135deg, #F5D76E 0%, #D4AF37 45%, #B78628 100%)",
    accentColor: "#D4AF37",
  },
];

export function BuyTeam() {
  const { isConnected } = useAccount();
  const { packPrices, buyPack, loading, error, contractAddress } = useBaseProgram();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  const handleBuy = async (packId: PackTierId) => {
    if (!isConnected) {
      setSuccessMessage("Conecta tu wallet para comprar un pack.");
      return;
    }

    try {
      const result = await buyPack(packId);
      if (result.teamId) {
        setSuccessMessage(
          `Equipo #${result.teamId} generado correctamente. Ya puedes verlo en tu dashboard.`,
        );
      } else {
        setSuccessMessage("Compra confirmada, espera unos segundos y refresca tu dashboard.");
      }
      setTxHash(result.hash);
    } catch {
      // the hook already sets the error state; nothing else to do
    }
  };

  return (
    <Box sx={{ py: 8 }}>
      <Stack spacing={2} alignItems="center" sx={{ mb: 6 }}>
        <Chip
          color="primary"
          label="Nueva experiencia en Base"
          sx={{ fontWeight: 600, letterSpacing: 0.5 }}
        />
        <Typography variant="h2" textAlign="center">
          Compra packs generados en la blockchain de Base
        </Typography>
        <Typography variant="body1" color="text.secondary" textAlign="center" maxWidth={640}>
          Cada pack genera un equipo en cadena y desbloquea opciones de staking. Los precios y
          resultados provienen directamente del contrato inteligente desplegado en Base.
        </Typography>
        {contractAddress && contractAddress !== "0x0000000000000000000000000000000000000000" ? (
          <Typography variant="caption" color="text.secondary">
            Contrato: {contractAddress.slice(0, 6)}...{contractAddress.slice(-4)}
          </Typography>
        ) : (
          <Alert severity="warning" sx={{ mt: 2 }}>
            Define <code>NEXT_PUBLIC_BASE_CONTRACT_ADDRESS</code> para operar con el contrato real.
          </Alert>
        )}
      </Stack>

      <Grid container spacing={4}>
        {PACKS.map((pack) => (
          <Grid key={pack.id} item xs={12} md={4}>
            <Card
              elevation={12}
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                border: `1px solid rgba(255, 255, 255, 0.1)`,
                background: pack.gradient,
                color: "white",
                overflow: "hidden",
              }}
            >
              {pack.bestValue ? (
                <Chip
                  icon={<RocketLaunch fontSize="small" />}
                  label="Más popular"
                  color="secondary"
                  sx={{ position: "absolute", top: 16, right: 16 }}
                />
              ) : null}
              <CardHeader
                title={
                  <Typography variant="h5" fontWeight={700}>
                    {pack.name}
                  </Typography>
                }
                subheader={
                  <Typography variant="subtitle2" sx={{ color: "rgba(255,255,255,0.75)" }}>
                    {pack.description}
                  </Typography>
                }
              />
              <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", gap: 2 }}>
                <Stack spacing={1}>
                  <Typography variant="h4" component="p">
                    {packPrices[pack.id].formatted}
                  </Typography>
                  <Typography variant="body2" sx={{ color: "rgba(255,255,255,0.85)" }}>
                    Paga con ETH en Base. Los ingresos se guardan en el contrato y pueden ser
                    retirados por el owner.
                  </Typography>
                </Stack>

                <Stack spacing={1} component="ul" sx={{ pl: 3, m: 0 }}>
                  {pack.perks.map((perk) => (
                    <Typography component="li" variant="body2" key={perk}>
                      {perk}
                    </Typography>
                  ))}
                </Stack>

                <Box sx={{ flexGrow: 1 }} />
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => handleBuy(pack.id)}
                  disabled={loading}
                  sx={{
                    mt: 2,
                    bgcolor: "rgba(0,0,0,0.4)",
                    "&:hover": { bgcolor: "rgba(0,0,0,0.6)" },
                  }}
                >
                  {loading ? <CircularProgress size={20} color="inherit" /> : "Comprar pack"}
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Stack spacing={2} sx={{ mt: 4 }}>
        {successMessage ? (
          <Alert severity="success" onClose={() => setSuccessMessage(null)}>
            {successMessage}{" "}
            {txHash ? (
              <Typography component="span" sx={{ ml: 1 }}>
                Hash: {txHash.slice(0, 8)}...{txHash.slice(-6)}
              </Typography>
            ) : null}
          </Alert>
        ) : null}
        {error ? (
          <Alert severity="error" onClose={() => undefined}>
            {error}
          </Alert>
        ) : null}
      </Stack>
    </Box>
  );
}
