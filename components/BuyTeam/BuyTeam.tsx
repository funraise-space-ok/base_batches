"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Checkbox,
  Grid,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import {
  ArrowBack,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Dashboard,
  ShoppingCartCheckout,
  Star,
  Wallet,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { BasePlayer, PackTierId, useBaseProgram } from "lib/base/useBaseProgram";
import { getLocalPlayerImageByName, normalizePlayerImageSources } from "lib/utils";
import PackOpeningAnimation from "../PackOpening/PackOpeningAnimation";

interface PackageInfo {
  id: PackTierId;
  name: string;
  description: string;
  perks: string[];
  gradient: string;
  accentColor: string;
  highlight?: string;
  imageSrc: string;
}

type DisplayPack = PackageInfo & {
  priceFormatted: string;
};

type PurchasedPlayer = {
  id: number;
  name: string;
  image: string;
  type: "gold" | "silver" | "bronze";
  country: string;
  fallbackImage?: string;
  placeholderImage?: string;
};

const MOCK_LEGACY_PLAYERS = [] as never[];

const BASE_PACKS: PackageInfo[] = [
  {
    id: "A",
    name: "Basic Pack",
    description: "Tus primeras cards para entrar en la temporada.",
    perks: [
      "5 jugadores generados on-chain",
      "Probabilidad balanceada de rarezas",
      "Ideal para comenzar a experimentar",
    ],
    gradient: "linear-gradient(135deg, #CD7F32 0%, #8B5E3C 100%)",
    accentColor: "#CD7F32",
    imageSrc: "/booster_pack_bronce.png",
  },
  {
    id: "B",
    name: "Silver Pack",
    description: "Subí de nivel el roster con rarezas especiales.",
    perks: [
      "4 cartas aleatorias + 1 asegurada Silver/Gold",
      "Mayor recompensa en staking",
      "Eventos exclusivos cuando está staked",
    ],
    gradient: "linear-gradient(135deg, #C0C0C0 0%, #8A8A8A 100%)",
    accentColor: "#C0C0C0",
    imageSrc: "/booster_pack_plata.png",
    highlight: "Más popular",
  },
  {
    id: "C",
    name: "Gold Pack",
    description: "El paquete elite para los coleccionistas más competitivos.",
    perks: [
      "3 aleatorias + 2 aseguradas Silver/Gold",
      "Boost premium para recompensas en Base",
      "Acceso anticipado a drops limitados",
    ],
    gradient:
      "linear-gradient(135deg, #F5D76E 0%, #D4AF37 45%, #B78628 100%)",
    accentColor: "#D4AF37",
    imageSrc: "/booster_pack_gold.png",
  },
];

const categoryToDisplayType = (category: BasePlayer["category"]): PurchasedPlayer["type"] => {
  switch (category) {
    case "Gold":
      return "gold";
    case "Silver":
      return "silver";
    default:
      return "bronze";
  }
};

const buildPlayersFromOnChain = (players: BasePlayer[]): PurchasedPlayer[] => {
  return players.map((player) => {
    const { local, remote, placeholder } = normalizePlayerImageSources(player.metadataUri || "", player.name);
    const primary = local !== placeholder ? local : remote ?? placeholder;
    const secondary = primary === local ? remote : (local !== placeholder ? local : undefined);
    return {
      id: player.id,
      name: player.name,
      image: primary,
      fallbackImage: secondary,
      placeholderImage: placeholder,
      type: categoryToDisplayType(player.category),
      country: player.country ? player.country.toLowerCase() : "",
    };
  });
};

export function BuyTeam() {
  const router = useRouter();
  const { isConnected } = useAccount();
  const { packPrices, buyPack, loading, error, contractAddress, getPlayersByIds, getTeamDetail } =
    useBaseProgram();

  const [selectedPackage, setSelectedPackage] = useState<DisplayPack | null>(
    null,
  );
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(1);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [playerLoadError, setPlayerLoadError] = useState<string | null>(null);
  const [showPackOpening, setShowPackOpening] = useState(false);
  const [purchasedPlayers, setPurchasedPlayers] = useState<PurchasedPlayer[]>(
    [],
  );
  const [openingPackImage, setOpeningPackImage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<`0x${string}` | null>(null);

  useEffect(() => {
    try {
      const link = document.createElement("link");
      link.rel = "preload";
      link.as = "image";
      link.href = "/field.png";
      document.head.appendChild(link);
      const img = new Image();
      img.src = "/field.png";
      return () => {
        document.head.removeChild(link);
      };
    } catch {
      // ignore
    }
  }, []);

  const packages = useMemo<DisplayPack[]>(() => {
    return BASE_PACKS.map((pack) => {
      const formatted =
        packPrices[pack.id]?.formatted ?? packPrices[pack.id]?.raw?.toString();
      return {
        ...pack,
        priceFormatted: formatted || "$?",
      };
    });
  }, [packPrices]);

  const handleBuyClick = (packInfo: DisplayPack) => {
    setSelectedPackage(packInfo);
    setDialogOpen(true);
    setFeedback(null);
    setTermsAccepted(false);
  };

  const handleConfirmPurchase = async () => {
    if (!selectedPackage || !termsAccepted) return;

    try {
      setPlayerLoadError(null);
      const result = await buyPack(selectedPackage.id, termsAccepted);

      let onChainPlayers: BasePlayer[] = [];
      try {
        if (result.playerIds && result.playerIds.length > 0) {
          onChainPlayers = await getPlayersByIds(result.playerIds);
        } else if (result.teamId) {
          const detail = await getTeamDetail(result.teamId);
          
          if (detail?.playerIds && detail.playerIds.length > 0) {
            onChainPlayers = await getPlayersByIds(detail.playerIds);
          }
        }
      } catch (playerErr: any) {
        console.error("[BuyTeam] Error al cargar jugadores:", playerErr);
        setPlayerLoadError("No pudimos recuperar los jugadores generados on-chain. Mostramos un ejemplo.");
      }

      const displayPlayers =
        onChainPlayers.length > 0
          ? buildPlayersFromOnChain(onChainPlayers)
          : [];
      
      setPurchasedPlayers(displayPlayers);
      setOpeningPackImage(selectedPackage.imageSrc);
      setDialogOpen(false);
      setShowPackOpening(true);
      setTxHash(result.hash);
      setFeedback(
        result.teamId
          ? `Equipo #${result.teamId} generado correctamente.`
          : "Compra confirmada. Revisa tu dashboard en unos segundos.",
      );
    } catch (purchaseError: any) {
      console.error('[BuyTeam] Error en la compra:', purchaseError);
      const message =
        purchaseError?.shortMessage ||
        purchaseError?.message ||
        "No se pudo completar la compra.";
      setFeedback(message);
    }
  };

  const handlePackOpeningComplete = () => {
    setShowPackOpening(false);
    router.push("/dashboard");
  };

  const nextSlide = () =>
    setCurrentIndex((prev) => (prev + 1) % packages.length);
  const prevSlide = () =>
    setCurrentIndex((prev) => (prev - 1 + packages.length) % packages.length);
  const goToSlide = (index: number) => setCurrentIndex(index);

  if (!isConnected) {
    return (
      <Box sx={{ textAlign: "center", py: 6 }}>
        <Alert severity="info">
          Conecta tu wallet de Base para comprar packs y generar equipos.
        </Alert>
      </Box>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showPackOpening ? (
          <motion.div
            key="pack-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(0,0,0,0.85)",
              zIndex: 2000,
            }}
          >
            <Box sx={{ maxWidth: 1200, mx: "auto", py: 4 }}>
              <PackOpeningAnimation
                open={showPackOpening}
                players={purchasedPlayers}
                onClose={handlePackOpeningComplete}
                audioSrc="/audio/open.mp3"
                packImageSrc={openingPackImage || "/booster_pack.png"}
              />
            </Box>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <Box sx={{ py: { xs: 4, md: 6 } }}>
        <motion.div
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
              mb: 4,
              px: 2,
            }}
          >
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ position: "absolute", left: 0 }}
            >
              <IconButton
                onClick={() => router.push("/dashboard")}
                sx={{
                  background:
                    "linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)",
                  backdropFilter: "blur(20px)",
                  border: "1px solid rgba(156, 39, 176, 0.3)",
                  borderRadius: "16px",
                  width: 56,
                  height: 56,
                  color: "white",
                  boxShadow: "0 8px 32px rgba(156, 39, 176, 0.2)",
                  "&:hover": {
                    background:
                      "linear-gradient(135deg, #AD42C4 0%, #7E57C2 100%)",
                    boxShadow: "0 12px 40px rgba(156, 39, 176, 0.3)",
                    transform: "translateY(-2px)",
                  },
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              >
                <ArrowBack sx={{ fontSize: 24 }} />
              </IconButton>
            </motion.div>

            <Stack spacing={1} alignItems="center">
              <Typography
                variant="h3"
                sx={{
                  textAlign: "center",
                  fontWeight: 700,
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                }}
              >
                Selecciona tu pack en Base
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ maxWidth: 620, textAlign: "center" }}
              >
                Comprar un pack genera un equipo on-chain en Base. Cada carta
                habilita recompensas reales según tus decisiones de staking.
              </Typography>
            </Stack>
          </Box>
        </motion.div>

        <Grid
          container
          spacing={4}
          sx={{ position: "relative", alignItems: "stretch" }}
        >
          <Grid
            item
            xs={12}
            md={7}
            sx={{ display: "flex", alignItems: "center" }}
          >
            <Box sx={{ position: "relative", width: "100%" }}>
              <Box
                sx={{
                  position: "absolute",
                  top: "35%",
                  left: 0,
                  transform: "translateY(-50%)",
                  zIndex: 1,
                }}
              >
                <IconButton
                  onClick={prevSlide}
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "16px",
                    backgroundColor: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    backdropFilter: "blur(18px)",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.14)",
                    },
                  }}
                >
                  <ChevronLeft />
                </IconButton>
              </Box>

              <Box
                sx={{
                  position: "absolute",
                  top: "35%",
                  right: 0,
                  transform: "translateY(-50%)",
                  zIndex: 1,
                }}
              >
                <IconButton
                  onClick={nextSlide}
                  sx={{
                    width: 48,
                    height: 48,
                    borderRadius: "16px",
                    backgroundColor: "rgba(255,255,255,0.08)",
                    border: "1px solid rgba(255,255,255,0.15)",
                    backdropFilter: "blur(18px)",
                    "&:hover": {
                      backgroundColor: "rgba(255,255,255,0.14)",
                    },
                  }}
                >
                  <ChevronRight />
                </IconButton>
              </Box>

              <AnimatePresence mode="wait">
                <motion.div
                  key={packages[currentIndex].id}
                  initial={{ opacity: 0, y: 24, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: -24, scale: 0.96 }}
                  transition={{ duration: 0.45, ease: "easeOut" }}
                >
                  <Card
                    sx={{
                      borderRadius: 6,
                      background: packages[currentIndex].gradient,
                      color: "white",
                      position: "relative",
                      overflow: "hidden",
                      boxShadow:
                        "0 35px 80px rgba(0, 0, 0, 0.35), inset 0 0 60px rgba(255, 255, 255, 0.08)",
                    }}
                  >
                    {packages[currentIndex].highlight ? (
                      <Chip
                        icon={<Star sx={{ color: "inherit!important" }} />}
                        label={packages[currentIndex].highlight}
                        color="secondary"
                        sx={{
                          position: "absolute",
                          top: 24,
                          left: 24,
                          fontWeight: 600,
                          px: 2,
                          py: 0.5,
                          backgroundColor: "rgba(255,255,255,0.16)",
                          borderRadius: 3,
                          backdropFilter: "blur(12px)",
                        }}
                      />
                    ) : null}

                    <CardContent sx={{ p: { xs: 4, md: 6 } }}>
                      <Stack
                        spacing={3}
                        direction={{ xs: "column", md: "row" }}
                        alignItems={{ xs: "center", md: "flex-start" }}
                        justifyContent="space-between"
                      >
                        <Box sx={{ flex: 1, textAlign: { xs: "center", md: "left" } }}>
                          <Typography variant="h4" sx={{ fontWeight: 700 }}>
                            {packages[currentIndex].name}
                          </Typography>
                          <Typography
                            variant="subtitle1"
                            sx={{ opacity: 0.85, mt: 1 }}
                          >
                            {packages[currentIndex].description}
                          </Typography>
                          <Typography
                            variant="h3"
                            sx={{
                              mt: 3,
                              fontWeight: 700,
                              textShadow:
                                "0 6px 30px rgba(0,0,0,0.25), 0 0 12px rgba(255,255,255,0.2)",
                            }}
                          >
                            {packages[currentIndex].priceFormatted}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            position: "relative",
                            width: 220,
                            height: 220,
                            filter: "drop-shadow(0 25px 45px rgba(0,0,0,0.45))",
                          }}
                        >
                          <Image
                            src={packages[currentIndex].imageSrc}
                            alt={packages[currentIndex].name}
                            fill
                            style={{ objectFit: "contain" }}
                          />
                        </Box>
                      </Stack>

                      <Grid container spacing={2} sx={{ mt: 4 }}>
                        {packages[currentIndex].perks.map((perk) => (
                          <Grid item xs={12} md={4} key={perk}>
                            <Card
                              variant="outlined"
                              sx={{
                                borderColor: "rgba(255,255,255,0.2)",
                                backgroundColor: "rgba(255,255,255,0.08)",
                                color: "inherit",
                                borderRadius: 3,
                                height: "100%",
                              }}
                            >
                              <CardContent>
                                <Stack direction="row" spacing={2} alignItems="center">
                                  <Box
                                    sx={{
                                      width: 40,
                                      height: 40,
                                      borderRadius: "50%",
                                      backgroundColor: "rgba(255,255,255,0.12)",
                                      display: "flex",
                                      alignItems: "center",
                                      justifyContent: "center",
                                      color: "white",
                                      fontWeight: 700,
                                      backdropFilter: "blur(12px)",
                                    }}
                                  >
                                    <Star fontSize="small" />
                                  </Box>
                                  <Typography variant="body2">{perk}</Typography>
                                </Stack>
                              </CardContent>
                            </Card>
                          </Grid>
                        ))}
                      </Grid>

                      <Stack direction="row" spacing={2} sx={{ mt: 4 }}>
                        <Button
                          variant="contained"
                          size="large"
                          onClick={() => handleBuyClick(packages[currentIndex])}
                          sx={{
                            backgroundColor: "rgba(0,0,0,0.35)",
                            backdropFilter: "blur(15px)",
                            borderRadius: 3,
                            px: 4,
                            py: 1.5,
                            "&:hover": { backgroundColor: "rgba(0,0,0,0.5)" },
                          }}
                          endIcon={<ShoppingCartCheckout />}
                        >
                          Comprar Pack
                        </Button>
                        <Button
                          variant="outlined"
                          size="large"
                          color="inherit"
                          onClick={() => router.push("/dashboard")}
                          endIcon={<Dashboard />}
                          sx={{
                            borderRadius: 3,
                            borderColor: "rgba(255,255,255,0.4)",
                            color: "white",
                          }}
                        >
                          Ir al Dashboard
                        </Button>
                      </Stack>
                    </CardContent>
                  </Card>
                </motion.div>
              </AnimatePresence>
            </Box>
          </Grid>

          <Grid item xs={12} md={5}>
            <Card
              sx={{
                height: "100%",
                borderRadius: 4,
                border: "1px solid",
                borderColor: "rgba(255,255,255,0.08)",
                background:
                  "linear-gradient(180deg, rgba(22,28,36,0.9) 0%, rgba(11,15,24,0.9) 100%)",
                color: "white",
                overflow: "hidden",
              }}
            >
              <CardHeader
                title={
                  <Typography variant="h5" sx={{ fontWeight: 700 }}>
                    ¿Por qué comprar en Base?
                  </Typography>
                }
                subheader="Todos los equipos se acuñan on-chain y podes administrarlos desde nuestro dashboard."
                sx={{ pb: 0 }}
              />
              <CardContent>
                <Stack spacing={3}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        background:
                          "linear-gradient(135deg, rgba(79,70,229,0.4) 0%, rgba(56,189,248,0.35) 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                      }}
                    >
                      <Wallet />
                    </Box>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Pagos en USDC vía Base Pay
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Integrado con el SDK oficial, listo para aceptar pagos con un clic.
                      </Typography>
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        background:
                          "linear-gradient(135deg, rgba(16,185,129,0.35) 0%, rgba(56,189,248,0.35) 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                      }}
                    >
                      <CreditCard />
                    </Box>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Propiedad y prueba on-chain
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Cada equipo se registra en el contrato Sports y se actualiza en tu dashboard.
                      </Typography>
                    </Stack>
                  </Stack>

                  <Stack direction="row" spacing={2} alignItems="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 2,
                        background:
                          "linear-gradient(135deg, rgba(255,159,28,0.35) 0%, rgba(251,113,133,0.35) 100%)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                      }}
                    >
                      <ShoppingCartCheckout />
                    </Box>
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                        Staking y recompensas
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.8 }}>
                        Activá el staking desde el dashboard y sumá recompensas según tu estrategia.
                      </Typography>
                    </Stack>
                  </Stack>

                  <Box
                    sx={{
                      background: "rgba(255,255,255,0.04)",
                      borderRadius: 3,
                      p: 3,
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                      Dirección del contrato
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        wordBreak: "break-all",
                        fontFamily: "monospace",
                        opacity: 0.8,
                      }}
                    >
                      {contractAddress && contractAddress !== "0x0000000000000000000000000000000000000000"
                        ? contractAddress
                        : "Setea NEXT_PUBLIC_BASE_CONTRACT_ADDRESS en tu .env.local"}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Stack
          direction="row"
          spacing={2}
          justifyContent="center"
          sx={{ mt: 4 }}
        >
          {packages.map((pack, index) => (
            <motion.div
              key={pack.id}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => goToSlide(index)}
              style={{ cursor: "pointer" }}
            >
              <Box
                sx={{
                  width: index === currentIndex ? 36 : 12,
                  height: 12,
                  borderRadius: 999,
                  backgroundColor:
                    index === currentIndex
                      ? "primary.main"
                      : "rgba(255,255,255,0.2)",
                  transition: "all 0.3s ease",
                }}
              />
            </motion.div>
          ))}
        </Stack>

        {playerLoadError ? (
          <Alert severity="warning" sx={{ mt: feedback ? 2 : 4 }} onClose={() => setPlayerLoadError(null)}>
            {playerLoadError}
          </Alert>
        ) : null}

        {feedback ? (
          <Alert
            severity={feedback.toLowerCase().includes("error") ? "error" : "info"}
            sx={{ mt: 4 }}
            onClose={() => setFeedback(null)}
          >
            {feedback}
            {txHash ? (
              <Typography component="span" sx={{ ml: 1 }}>
                Hash: {txHash.slice(0, 8)}...{txHash.slice(-6)}
              </Typography>
            ) : null}
          </Alert>
        ) : null}

        {error ? (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        ) : null}
      </Box>

      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Confirmar compra</DialogTitle>
        <DialogContent>
          <Typography>
            Estás a punto de comprar el pack{" "}
            <strong>{selectedPackage?.name}</strong> por{" "}
            <strong>{selectedPackage?.priceFormatted}</strong>. Este pago se
            procesa en la red Base y genera un equipo único.
          </Typography>
          <FormControlLabel
            control={
              <Checkbox
                checked={termsAccepted}
                onChange={(event) => setTermsAccepted(event.target.checked)}
              />
            }
            label="Confirmo que entiendo que el pago se ejecuta on-chain y no es reversible."
            sx={{ mt: 2 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={handleConfirmPurchase}
            variant="contained"
            disabled={!termsAccepted || loading}
          >
            {loading ? <CircularProgress size={20} color="inherit" /> : "Confirmar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
