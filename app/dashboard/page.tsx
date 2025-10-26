"use client";

import {
  Alert,
  Box,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  Grid,
  Stack,
  Typography,
  Button,
  Divider,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { useAccount } from "wagmi";
import { BaseTeam, PackTierId, useBaseProgram } from "../../lib/base/useBaseProgram";
import dayjs from "dayjs";

function formatTier(tier: PackTierId) {
  switch (tier) {
    case "A":
      return "Bronze";
    case "B":
      return "Silver";
    case "C":
    default:
      return "Gold";
  }
}

function formatDate(timestamp: number) {
  return dayjs.unix(timestamp).format("DD MMM YYYY HH:mm");
}

export default function DashboardPage() {
  const { isConnected, address } = useAccount();
  const { getUserTeams, setTeamStake, loading, error, refreshPackPrices, packPrices } =
    useBaseProgram();
  const [teams, setTeams] = useState<BaseTeam[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const stakedCount = useMemo(() => teams.filter((team) => team.staked).length, [teams]);

  const loadTeams = async () => {
    if (!isConnected) return;
    try {
      setIsFetching(true);
      const data = await getUserTeams();
      setTeams(data);
    } catch (err: any) {
      setActionError(err?.message ?? "No se pudieron cargar tus equipos.");
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (!isConnected) {
      setTeams([]);
      return;
    }
    loadTeams();
    refreshPackPrices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isConnected, address]);

  const toggleStake = async (team: BaseTeam) => {
    try {
      setActionError(null);
      setActionMessage(null);
      await setTeamStake(team.teamId, !team.staked);
      setActionMessage(
        `Equipo #${team.teamId} ahora está ${!team.staked ? "en stake" : "liberado"}.`,
      );
      await loadTeams();
    } catch (err: any) {
      setActionError(err?.shortMessage ?? err?.message ?? "No pudimos actualizar el equipo.");
    }
  };

  return (
    <Container sx={{ mt: (theme) => theme.spacing(16), pb: 10 }}>
      <Stack spacing={3} alignItems="center" sx={{ mb: 4 }}>
        <Typography variant="h3" textAlign="center">
          Base Batches Dashboard
        </Typography>
        <Typography textAlign="center" color="text.secondary" maxWidth={600}>
          Gestiona tus equipos generados en la blockchain de Base. Desde aquí puedes revisar tus
          packs comprados y activar staking en un click.
        </Typography>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2} alignItems="center">
          <Chip label={`Equipos totales: ${teams.length}`} color="primary" />
          <Chip label={`Equipos en stake: ${stakedCount}`} color="secondary" />
        </Stack>
      </Stack>
      <Card
        sx={{
          mb: 4,
          borderRadius: 5,
          overflow: "hidden",
          position: "relative",
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "linear-gradient(135deg, rgba(15,23,42,0.95) 0%, rgba(30,64,175,0.95) 100%)"
              : "linear-gradient(135deg, rgba(236,254,255,0.95) 0%, rgba(165,243,252,0.95) 100%)",
        }}
      >
        <CardContent sx={{ position: "relative", zIndex: 1 }}>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} md={8}>
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
                Todo centralizado en Base
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: 520 }}>
                Visualiza tus equipos, actualiza su estado de staking y consulta los precios
                on-chain en tiempo real. Cada interacción queda registrada en el contrato Sports.
              </Typography>
            </Grid>
            <Grid
              item
              xs={12}
              md={4}
              sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}
            >
              <Stack spacing={1}>
                <Chip
                  label={`Bronze · ${packPrices.A.formatted}`}
                  variant="outlined"
                  sx={{ borderColor: "rgba(255,255,255,0.4)", color: "inherit" }}
                />
                <Chip
                  label={`Silver · ${packPrices.B.formatted}`}
                  variant="outlined"
                  sx={{ borderColor: "rgba(255,255,255,0.4)", color: "inherit" }}
                />
                <Chip
                  label={`Gold · ${packPrices.C.formatted}`}
                  variant="outlined"
                  sx={{ borderColor: "rgba(255,255,255,0.4)", color: "inherit" }}
                />
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.2), transparent 45%)",
            pointerEvents: "none",
          }}
        />
      </Card>

      {!isConnected ? (
        <Alert severity="info">
          Conecta tu wallet de Base para ver tus equipos y administrar el staking.
        </Alert>
      ) : null}

      {actionMessage ? (
        <Alert severity="success" onClose={() => setActionMessage(null)} sx={{ mb: 2 }}>
          {actionMessage}
        </Alert>
      ) : null}
      {actionError ? (
        <Alert severity="error" onClose={() => setActionError(null)} sx={{ mb: 2 }}>
          {actionError}
        </Alert>
      ) : null}
      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card elevation={8}>
            <CardContent>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
                <Typography variant="h5">Tus equipos</Typography>
                <Button onClick={loadTeams} disabled={isFetching || loading} variant="outlined">
                  {isFetching || loading ? <CircularProgress size={18} /> : "Actualizar"}
                </Button>
              </Stack>
              <Divider sx={{ mb: 2 }} />
              {!isConnected ? (
                <Typography color="text.secondary">
                  Conecta primero tu wallet para cargar los equipos.
                </Typography>
              ) : isFetching ? (
                <Stack alignItems="center" sx={{ py: 6 }}>
                  <CircularProgress />
                  <Typography sx={{ mt: 2 }} color="text.secondary">
                    Consultando blockchain de Base...
                  </Typography>
                </Stack>
              ) : teams.length === 0 ? (
                <Typography color="text.secondary">
                  Todavía no compraste packs en Base. Empieza desde la sección &quot;Buy Pack&quot;.
                </Typography>
              ) : (
                <Stack spacing={2}>
                  {teams.map((team) => (
                    <Card
                      key={team.teamId}
                      variant="outlined"
                      sx={{
                        borderColor: team.staked ? "primary.main" : "divider",
                        bgcolor: team.staked ? "primary.main" : "background.paper",
                        color: team.staked ? "primary.contrastText" : "inherit",
                        transition: "all 0.2s ease-in-out",
                      }}
                    >
                      <CardContent>
                        <Stack
                          direction={{ xs: "column", md: "row" }}
                          spacing={2}
                          justifyContent="space-between"
                        >
                          <Stack spacing={0.5}>
                            <Typography variant="h6">
                              Equipo #{team.teamId} · {formatTier(team.tier)}
                            </Typography>
                            <Typography variant="body2">
                              Creado: {formatDate(team.createdAt)}
                            </Typography>
                            <Typography variant="body2">
                              Última actualización: {formatDate(team.updatedAt)}
                            </Typography>
                          </Stack>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Chip
                              label={team.staked ? "En stake" : "Disponible"}
                              color={team.staked ? "success" : "default"}
                              variant={team.staked ? "filled" : "outlined"}
                            />
                            <Button
                              variant={team.staked ? "outlined" : "contained"}
                              color={team.staked ? "inherit" : "secondary"}
                              onClick={() => toggleStake(team)}
                              disabled={loading}
                            >
                              {team.staked ? "Detener stake" : "Activar stake"}
                            </Button>
                          </Stack>
                        </Stack>
                      </CardContent>
                    </Card>
                  ))}
                </Stack>
              )}
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card elevation={8}>
            <CardContent>
              <Typography variant="h5" mb={2}>
                Recordatorio de precios
              </Typography>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  Los precios se extraen en vivo del contrato. Así puedes verificar on-chain cuánto
                  cuesta cada pack antes de comprar.
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Stack spacing={1}>
                  <Chip label={`Bronze · ${packPrices.A.formatted}`} />
                  <Chip label={`Silver · ${packPrices.B.formatted}`} />
                  <Chip label={`Gold · ${packPrices.C.formatted}`} />
                </Stack>
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
}
