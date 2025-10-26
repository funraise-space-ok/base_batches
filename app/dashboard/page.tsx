"use client";

import {
  Alert,
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Stack,
  Typography,
  Button,
  Grow,
  Slide,
  Collapse,
  CircularProgress,
  Fade,
} from "@mui/material";
import { useEffect, useMemo, useState, useCallback } from "react";
import { useAccount } from "wagmi";
import { useBaseProgram } from "../../lib/base/useBaseProgram";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ShoppingCartCheckout } from "@mui/icons-material";
import { StakedTeamsList } from "components/StakedTeamsList";
import { UserTeamsList } from "components/UserTeamsList";

export default function DashboardPage() {
  const router = useRouter();
  const { isConnected, address } = useAccount();
  const { getUserTeams, getTimeLockSeconds, getTeamDetail } = useBaseProgram();
  
  const [stakedTeamIds, setStakedTeamIds] = useState<number[]>([]);
  const [warmingUpTeamIds, setWarmingUpTeamIds] = useState<number[]>([]);
  const [toWithdrawTeamIds, setToWithdrawTeamIds] = useState<number[]>([]);
  const [userTeamsCount, setUserTeamsCount] = useState<number | null>(null);
  const [isLoadingStakedTeams, setIsLoadingStakedTeams] = useState(true);
  const [hasInitialized, setHasInitialized] = useState(false);
  const [refreshUserTeams, setRefreshUserTeams] = useState(0);
  const [timeLock, setTimeLock] = useState(0);
  
  // Animation states
  const [showOnField, setShowOnField] = useState(false);
  const [showWarmingUp, setShowWarmingUp] = useState(false);
  const [showToWithdraw, setShowToWithdraw] = useState(false);
  const [showMyWallet, setShowMyWallet] = useState(false);

  // Función para agregar equipo a la lista de warming up
  const addToWarmingUpTeams = useCallback((teamId: number) => {
    setWarmingUpTeamIds((prev) => {
      if (!prev.includes(teamId)) {
        return [...prev, teamId];
      }
      return prev;
    });
  }, []);

  // Función para mover equipo de warming up a on field
  const moveFromWarmingUpToOnField = useCallback((teamId: number) => {
    setWarmingUpTeamIds((prev) => prev.filter((id) => id !== teamId));
    setStakedTeamIds((prev) => {
      if (!prev.includes(teamId)) {
        return [...prev, teamId];
      }
      return prev;
    });
  }, []);

  // Función para mover equipo de on field a to withdraw
  const moveFromOnFieldToToWithdraw = useCallback((teamId: number) => {
    setStakedTeamIds((prev) => prev.filter((id) => id !== teamId));
    setToWithdrawTeamIds((prev) => [...prev, teamId]);
  }, []);

  // Función para mover equipo de to withdraw de vuelta a wallet
  const handleTeamWithdrawn = useCallback((teamId: number) => {
    setToWithdrawTeamIds((prev) => prev.filter((id) => id !== teamId));
    setRefreshUserTeams((prev) => prev + 1);
  }, []);

  // Función para actualizar el contador de equipos del usuario
  const updateUserTeamsCount = useCallback((count: number) => {
    setUserTeamsCount(count);
  }, []);

  // Cargar equipos y clasificarlos por estado
  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        if (hasInitialized && isConnected) {
          return;
        }

        setIsLoadingStakedTeams(true);

        // Obtener time_lock
        const globalTimeLock = await getTimeLockSeconds();
        setTimeLock(globalTimeLock);

        // Cargar equipos en stake
        if (isConnected) {
          const basicTeams = await getUserTeams();
          
          // Limpiar arrays
          setWarmingUpTeamIds([]);
          setStakedTeamIds([]);
          setToWithdrawTeamIds([]);

          // Clasificar equipos según su estado
          const warming: number[] = [];
          const onField: number[] = [];
          const toWithdraw: number[] = [];

          // Obtener detalles de cada equipo para saber su estado
          for (const basicTeam of basicTeams) {
            const teamDetail = await getTeamDetail(basicTeam.teamId);
            if (!teamDetail) continue;

            if (teamDetail.state === "WarmingUp") {
              warming.push(teamDetail.teamId);
            } else if (teamDetail.state === "OnField") {
              onField.push(teamDetail.teamId);
            } else if (teamDetail.state === "ToWithdraw") {
              toWithdraw.push(teamDetail.teamId);
            }
          }

          setWarmingUpTeamIds(warming);
          setStakedTeamIds(onField);
          setToWithdrawTeamIds(toWithdraw);
          setHasInitialized(true);
        } else {
          setStakedTeamIds([]);
          setWarmingUpTeamIds([]);
          setToWithdrawTeamIds([]);
          setHasInitialized(false);
        }
      } catch (error) {
        console.error("Error loading dashboard data:", error);
    } finally {
        setIsLoadingStakedTeams(false);
      }
    };

    if (isConnected !== undefined) {
      loadDashboardData();
    }
  }, [isConnected, address, hasInitialized, getUserTeams, getTimeLockSeconds, getTeamDetail]);

  // Efectos para mostrar las secciones con animaciones escalonadas
  useEffect(() => {
    if (isConnected) {
      setTimeout(() => setShowOnField(true), 200);
      setTimeout(() => setShowWarmingUp(true), 400);
      setTimeout(() => setShowToWithdraw(true), 600);
      setTimeout(() => setShowMyWallet(true), 800);
    } else {
      setShowOnField(false);
      setShowWarmingUp(false);
      setShowToWithdraw(false);
      setShowMyWallet(false);
    }
  }, [isConnected]);

  if (!isConnected) {
    return (
      <Box sx={{ p: 3, mt: 8, textAlign: "center" }}>
        <Alert severity="info" sx={{ maxWidth: 600, mx: "auto" }}>
          Connect your wallet to view your teams
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 1, sm: 2, md: 3 } }}>
      <Grid container spacing={{ xs: 2, sm: 2, md: 3 }}>
        {/* Left Column: My Wallet + To Withdraw (38%) */}
        <Grid item xs={12} lg sx={{ flexBasis: { lg: "38%" }, maxWidth: { lg: "38%" } }}>
          <Grow in={showMyWallet} timeout={800}>
      <Card
        sx={{
                background: "linear-gradient(135deg, #1a0d2e 0%, #16213e 50%, #0f3460 100%)",
                border: "2px solid #6a1b9a",
                borderRadius: "16px",
                boxShadow:
                  "0 8px 32px rgba(106, 27, 154, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                position: "relative",
          overflow: "hidden",
                transition: "all 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 12px 40px rgba(106, 27, 154, 0.4)",
                },
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background:
                    "radial-gradient(circle at 20% 80%, rgba(156, 39, 176, 0.2) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(103, 58, 183, 0.2) 0%, transparent 50%)",
                  pointerEvents: "none",
                },
        }}
      >
              <CardContent sx={{ position: "relative", zIndex: 1, px: { xs: 1.5, sm: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
                <Slide direction="up" in={showMyWallet} timeout={600}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center" pb={1}>
                    <Typography
                      variant="overline"
                      sx={{
                        color: "#e1bee7",
                        fontWeight: "bold",
                        letterSpacing: "2px",
                        textShadow: "0 0 10px rgba(156, 39, 176, 0.5)",
                      }}
                    >
                      MY WALLET
              </Typography>
                    <Button
                      variant="outlined"
                      size="small"
                      startIcon={<ShoppingCartCheckout />}
                      onClick={() => router.push("/buy-pack")}
                      sx={{
                        borderColor: "rgba(156, 39, 176, 0.5)",
                        color: "#e1bee7",
                        "&:hover": {
                          borderColor: "#9C27B0",
                          backgroundColor: "rgba(156, 39, 176, 0.1)",
                        },
                      }}
                    >
                      Buy Packs
                    </Button>
                  </Stack>
                </Slide>
                <Divider
                  sx={{
                    borderColor: "rgba(156, 39, 176, 0.3)",
                    boxShadow: "0 1px 0 rgba(156, 39, 176, 0.1)",
                  }}
                />
                <Collapse in={showMyWallet} timeout={1000}>
                  <UserTeamsList
                    onTeamStaked={addToWarmingUpTeams}
                    onTeamsCountChange={updateUserTeamsCount}
                    refreshKey={refreshUserTeams}
                  />
                </Collapse>
              </CardContent>
            </Card>
          </Grow>

          {/* To Withdraw moved below My Wallet */}
          <Grow in={showToWithdraw} timeout={800}>
            <Card
              sx={{
                background: "linear-gradient(135deg, #0b1a2b 0%, #0a2a43 50%, #07324d 100%)",
                border: "2px solid #2196f3",
                borderRadius: "16px",
                boxShadow:
                  "0 8px 32px rgba(33, 150, 243, 0.28), inset 0 1px 0 rgba(255, 255, 255, 0.06)",
                position: "relative",
                overflow: "hidden",
                mt: 3,
              }}
            >
              <CardContent sx={{ position: "relative", zIndex: 1, px: { xs: 1.5, sm: 2, md: 3 }, py: { xs: 2, md: 3 } }}>
                <Slide direction="up" in={showToWithdraw} timeout={600}>
                  <Typography
                    variant="overline"
                    sx={{
                      color: "#b3e5fc",
                      fontWeight: "bold",
                      letterSpacing: "2px",
                      textShadow: "0 0 10px rgba(33, 150, 243, 0.5)",
                    }}
                  >
                    TO WITHDRAW
                  </Typography>
                </Slide>
                <Divider sx={{ borderColor: "rgba(33, 150, 243, 0.35)" }} />
                <Collapse in={showToWithdraw} timeout={1000}>
                  <StakedTeamsList
                    stakedTeamIds={toWithdrawTeamIds}
                    onTeamWithdrawn={handleTeamWithdrawn}
                    isLoading={isLoadingStakedTeams || !hasInitialized}
                    section="to_withdraw"
                  />
                </Collapse>
              </CardContent>
            </Card>
          </Grow>
            </Grid>

        {/* Center Column: Stadium (Warm Up + On Field) - 62% with field background */}
        <Grid item xs={12} lg sx={{ flexBasis: { lg: "62%" }, maxWidth: { lg: "62%" } }}>
          <Box sx={{ position: "relative", borderRadius: 2, overflow: "hidden", minHeight: { xs: 400, sm: 500, md: 600 } }}>
            {/* Field background */}
            <Box sx={{ position: "absolute", inset: 0 }}>
              <Image
                src="/field.png"
                alt="Field"
                fill
                priority
                style={{
                  objectFit: "cover",
                  filter: "brightness(1.03) saturate(1.06) contrast(1.05)",
                }}
                sizes="100vw"
              />
            </Box>
            {/* Vignette overlay */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background:
                  "radial-gradient(ellipse at center, rgba(0,0,0,0.12) 0%, rgba(0,0,0,0.45) 70%, rgba(0,0,0,0.6) 100%)",
              }}
            />

            <Stack
              spacing={3}
              sx={{
                position: "relative",
                zIndex: 1,
                p: { xs: 1, md: 2 },
                alignItems: "center",
                mx: "auto",
                width: { md: "92%" },
              }}
            >
              <Grow in={showWarmingUp} timeout={800}>
                    <Card
                      sx={{
                    border: "2px solid #ff9800",
                    borderRadius: "16px",
                    boxShadow:
                      "0 8px 32px rgba(255, 152, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                    position: "relative",
                    overflow: "visible",
                    width: 1,
                    mx: "auto",
                    background: "rgba(0, 0, 0, 0.6)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <CardContent
                    sx={{ position: "relative", zIndex: 1, px: { xs: 1.5, md: 3 }, pb: { xs: 2, md: 3 } }}
                  >
                    <Slide direction="left" in={showWarmingUp} timeout={600}>
                      <Typography
                        variant="overline"
                        sx={{
                          color: "#ffe0b2",
                          fontWeight: "bold",
                          letterSpacing: "2px",
                          textShadow: "0 0 10px rgba(255, 152, 0, 0.5)",
                        }}
                      >
                        WARMING UP ({warmingUpTeamIds.length})
                            </Typography>
                    </Slide>
                    <Divider sx={{ borderColor: "rgba(255, 152, 0, 0.3)" }} />
                    <Collapse in={showWarmingUp} timeout={1000}>
                      <Box sx={{ mt: 2 }}>
                        <StakedTeamsList
                          stakedTeamIds={warmingUpTeamIds}
                          onTeamTransitioned={moveFromWarmingUpToOnField}
                          isLoading={isLoadingStakedTeams || !hasInitialized}
                          section="warming_up"
                        />
                      </Box>
                    </Collapse>
                      </CardContent>
                    </Card>
              </Grow>

              <Grow in={showOnField} timeout={800}>
                <Card
                  sx={{
                    border: "2px solid #4caf50",
                    borderRadius: "16px",
                    boxShadow:
                      "0 8px 32px rgba(76, 175, 80, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
                    position: "relative",
                    overflow: "visible",
                    width: 1,
                    mx: "auto",
                    background: "rgba(0, 0, 0, 0.6)",
                    backdropFilter: "blur(10px)",
                  }}
                >
                  <CardContent
                    sx={{ position: "relative", zIndex: 1, px: { xs: 1.5, md: 3 }, pb: { xs: 2, md: 3 } }}
                  >
                    <Slide direction="right" in={showOnField} timeout={600}>
                      <Typography
                        variant="overline"
                        sx={{
                          color: "#c8e6c9",
                          fontWeight: "bold",
                          letterSpacing: "2px",
                          textShadow: "0 0 10px rgba(76, 175, 80, 0.5)",
                        }}
                      >
                        ON FIELD ({stakedTeamIds.length})
                      </Typography>
                    </Slide>
                    <Divider sx={{ borderColor: "rgba(76, 175, 80, 0.3)" }} />
                    <Collapse in={showOnField} timeout={1000}>
                      <Box sx={{ mt: 2 }}>
                        <StakedTeamsList
                          stakedTeamIds={stakedTeamIds}
                          onTeamWithdrawn={moveFromOnFieldToToWithdraw}
                          isLoading={isLoadingStakedTeams || !hasInitialized}
                          section="on_field"
                        />
                      </Box>
                    </Collapse>
            </CardContent>
          </Card>
              </Grow>
                </Stack>
          </Box>
        </Grid>
      </Grid>
    </Box>
  );
}
