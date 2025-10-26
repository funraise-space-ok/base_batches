"use client";

import React, { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  Chip,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  IconButton,
} from '@mui/material';
import { ChevronLeft, ChevronRight, ArrowBack, Star } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAccount } from 'wagmi';
import { BasePlayer, PackTierId, useBaseProgram } from '../../lib/base/useBaseProgram';
import { getLocalPlayerImageByName, normalizePlayerImageSources } from '../../lib/utils';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import PackOpeningAnimation from '../PackOpening/PackOpeningAnimation';

interface PackageInfo {
  id: PackTierId;
  name: string;
  price: number;
  priceDisplay: string;
  description: string;
  features: string[];
  color: 'primary' | 'secondary' | 'warning';
  gradient: string;
  popular?: boolean;
  imageSrc: string;
  accentColor: string;
}

type PurchasedPlayer = {
  id: number;
  name: string;
  image: string;
  type: "gold" | "silver" | "bronze";
  country: string;
  fallbackImage?: string;
  placeholderImage?: string;
};

const categoryToDisplayType = (category: string | undefined | null): "gold" | "silver" | "bronze" => {
  if (!category) return "bronze";
  const lower = String(category).toLowerCase();
  switch (lower) {
    case "gold":
      return "gold";
    case "silver":
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

  const [selectedPackage, setSelectedPackage] = useState<PackageInfo | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [playerLoadError, setPlayerLoadError] = useState<string | null>(null);
  const [showPackOpening, setShowPackOpening] = useState(false);
  const [purchasedPlayers, setPurchasedPlayers] = useState<PurchasedPlayer[]>([]);
  const [currentIndex, setCurrentIndex] = useState(1); // Start with the middle package (Premium)
  const [openingPackImage, setOpeningPackImage] = useState<string | null>(null);
  const [txHash, setTxHash] = useState<string | null>(null);

  // Preload del fondo de campo apenas se monta la página
  useEffect(() => {
    try {
      const l = document.createElement('link');
      l.rel = 'preload';
      l.as = 'image';
      l.href = '/field.png';
      document.head.appendChild(l);
      const img = new window.Image();
      img.decoding = 'async' as any;
      img.loading = 'eager' as any;
      img.src = '/field.png';
      return () => { try { document.head.removeChild(l); } catch {} };
    } catch {}
  }, []);

  // Fixed-price packages
  const packages: PackageInfo[] = useMemo(() => {
    const pricesMap: Record<PackTierId, number> = {
      A: packPrices.A?.raw ? Number(packPrices.A.raw) / 1e18 : 10,
      B: packPrices.B?.raw ? Number(packPrices.B.raw) / 1e18 : 15,
      C: packPrices.C?.raw ? Number(packPrices.C.raw) / 1e18 : 20,
    };
    
    return [
      {
        id: 'A' as PackTierId,
        name: 'Basic Pack',
        price: pricesMap.A,
        priceDisplay: `${pricesMap.A.toFixed(4)} BASE ETH`,
        description: '5 random players',
        features: [
          '5 random players',
          'All categories available',
          'More affordable price'
        ],
        color: 'primary' as const,
        gradient: 'linear-gradient(135deg, #CD7F32 0%, #8B5E3C 100%)',
        imageSrc: '/booster_pack_bronce.png',
        accentColor: '#CD7F32'
      },
      {
        id: 'B' as PackTierId,
        name: 'Premium Pack', 
        price: pricesMap.B,
        priceDisplay: `${pricesMap.B.toFixed(4)} BASE ETH`,
        description: '4 random + 1 Silver/Gold',
        features: [
          '4 random players',
          '1 guaranteed Silver or Gold',
          'Higher chance of rare cards'
        ],
        color: 'secondary' as const,
        gradient: 'linear-gradient(135deg, #C0C0C0 0%, #8A8A8A 100%)',
        popular: false,
        imageSrc: '/booster_pack_plata.png',
        accentColor: '#C0C0C0'
      },
      {
        id: 'C' as PackTierId,
        name: 'Elite Pack',
        price: pricesMap.C,
        priceDisplay: `${pricesMap.C.toFixed(4)} BASE ETH`,
        description: '3 random + 2 Silver/Gold',
        features: [
          '3 random players',
          '2 guaranteed Silver or Gold',
          'Highest chance of epic cards'
        ],
        color: 'warning' as const,
        gradient: 'linear-gradient(135deg, #F5D76E 0%, #D4AF37 45%, #B78628 100%)',
        imageSrc: '/booster_pack_gold.png',
        accentColor: '#D4AF37'
      }
    ];
  }, [packPrices]);

  const handleBuyClick = (packageInfo: PackageInfo) => {
    setSelectedPackage(packageInfo);
    setDialogOpen(true);
    setFeedback(null);
    setPlayerLoadError(null);
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
    // Navegar inmediatamente para evitar flicker del carrusel debajo
    router.push('/dashboard');
  };

  const handleCloseDialog = () => {
    // Cerrar el diálogo sin limpiar aún para evitar flash de color por fallback
    setDialogOpen(false);
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % packages.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + packages.length) % packages.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  if (!isConnected) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Alert severity="info">
          Connect your wallet to buy teams
        </Alert>
      </Box>
    );
  }

  return (
    <>
      {/* Overlay de apertura de pack */}
      <AnimatePresence>
        {showPackOpening && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, zIndex: 2000, background: 'rgba(0,0,0,0.85)' } as any}
          >
            <Box sx={{ maxWidth: '1200px', mx: 'auto', py: 4 }}>
              <PackOpeningAnimation
                open={showPackOpening}
                players={purchasedPlayers}
                onClose={handlePackOpeningComplete}
                audioSrc="/audio/open.mp3"
                packImageSrc={openingPackImage || '/booster_pack.png'}
              />
            </Box>
          </motion.div>
        )}
      </AnimatePresence>
      {/* CSS Global para animaciones */}
      <style jsx global>{`
        @keyframes shimmerEffect {
          0% { left: -100%; }
          100% { left: 100%; }
        }
        
        @keyframes pulseEffect {
          0%, 100% { 
            transform: translate(-50%, -50%) scale(1);
            opacity: 0.7;
          }
          50% { 
            transform: translate(-50%, -50%) scale(1.2);
            opacity: 0.3;
          }
        }
        
        @keyframes heartbeat {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.02); }
        }
        
        @keyframes fireGlow {
          0%, 100% { 
            text-shadow: 0 0 5px #ff6b35, 0 0 10px #ff6b35, 0 0 15px #ff6b35;
            transform: scale(1);
          }
          50% { 
            text-shadow: 0 0 10px #ff4500, 0 0 20px #ff4500, 0 0 30px #ff4500;
            transform: scale(1.1);
          }
        }

        @keyframes sheen {
          0% { left: -60%; }
          100% { left: 160%; }
        }

        @keyframes neonPulse {
          0%, 100% {
            box-shadow: 0 0 12px rgba(255,80,0,0.35), 0 0 24px rgba(255,120,0,0.30), 0 0 42px rgba(255,160,0,0.25);
          }
          50% {
            box-shadow: 0 0 22px rgba(255,80,0,0.6), 0 0 44px rgba(255,120,0,0.55), 0 0 76px rgba(255,160,0,0.45);
          }
        }
        @keyframes rotateGlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Silver/steel glow for Premium (Plata) */
        @keyframes silverPulse {
          0%, 100% {
            box-shadow: 0 0 16px rgba(220,220,220,0.5), 0 0 34px rgba(170,170,170,0.45), 0 0 68px rgba(255,255,255,0.35);
          }
          50% {
            box-shadow: 0 0 28px rgba(235,235,235,0.8), 0 0 58px rgba(180,180,180,0.7), 0 0 96px rgba(255,255,255,0.55);
          }
        }
        @keyframes rotateSilverGlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Gold glow */
        @keyframes goldPulse {
          0%, 100% {
            box-shadow: 0 0 16px rgba(212,175,55,0.55), 0 0 34px rgba(255,215,0,0.45), 0 0 68px rgba(255,255,200,0.35);
          }
          50% {
            box-shadow: 0 0 28px rgba(212,175,55,0.85), 0 0 58px rgba(255,215,0,0.75), 0 0 110px rgba(255,255,220,0.55);
          }
        }
        @keyframes rotateGoldGlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        /* Bronze glow */
        @keyframes bronzePulse {
          0%, 100% {
            box-shadow: 0 0 16px rgba(205,127,50,0.45), 0 0 34px rgba(193,103,29,0.4), 0 0 68px rgba(255,220,200,0.3);
          }
          50% {
            box-shadow: 0 0 26px rgba(205,127,50,0.75), 0 0 54px rgba(193,103,29,0.65), 0 0 96px rgba(255,220,200,0.5);
          }
        }
        @keyframes rotateBronzeGlow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>

      <Box sx={{ py: 4 }}>
        {/* Header con navegación elegante */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative',
              mb: 4,
            px: 2
          }}>
            {/* Botón de retorno */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ position: 'absolute', left: 0 } as any}
            >
              <IconButton
                onClick={() => router.push('/dashboard')}
                sx={{
                  background: 'linear-gradient(135deg, #9C27B0 0%, #673AB7 100%)',
                  backdropFilter: 'blur(20px)',
                  border: '1px solid rgba(156, 39, 176, 0.3)',
                  borderRadius: '16px',
                  width: 56,
                  height: 56,
                  color: 'white',
                  boxShadow: '0 8px 32px rgba(156, 39, 176, 0.2)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #AD42C4 0%, #7E57C2 100%)',
                    boxShadow: '0 12px 40px rgba(156, 39, 176, 0.3)',
                    transform: 'translateY(-2px)',
                  },
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                <ArrowBack sx={{ fontSize: 24 }} />
              </IconButton>
            </motion.div>

            {/* Título central con efecto */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <Typography
                variant="h3"
                component="h1" 
                sx={{
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.8) 100%)',
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textAlign: 'center',
                  letterSpacing: '-0.02em',
                  textShadow: '0 4px 20px rgba(0,0,0,0.1)',
                  position: 'relative',
                  '&::after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: 60,
                    height: 3,
                    background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)',
                    borderRadius: '2px'
                  }
                }}
              >
                Buy Team
              </Typography>
            </motion.div>
          </Box>
        </motion.div>

        <Typography variant="body1" align="center" color="text.secondary" sx={{ mb: 4 }}>
          Choose your pack and build your dream team
        </Typography>

        {/* Carrusel de paquetes */}
        <Box sx={{ 
          position: 'relative', 
          maxWidth: '1000px', 
          mx: 'auto'
        }}>
          {/* Botones de navegación */}
                <IconButton
                  onClick={prevSlide}
                  sx={{
              position: 'absolute',
              left: -60,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }
                  }}
                >
                  <ChevronLeft />
                </IconButton>

                <IconButton
                  onClick={nextSlide}
                  sx={{
              position: 'absolute',
              right: -60,
              top: '50%',
              transform: 'translateY(-50%)',
              zIndex: 2,
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              color: 'white',
              '&:hover': {
                backgroundColor: 'rgba(255, 255, 255, 0.2)',
              }
                  }}
                >
                  <ChevronRight />
                </IconButton>

          {/* Contenedor del carrusel 3D */}
          <Box sx={{ 
            overflow: 'visible', 
            borderRadius: 2, 
            perspective: '1200px',
            height: '650px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Box
              sx={{
                position: 'relative',
                width: '360px',
                height: '416px',
                transformStyle: 'preserve-3d',
                transition: 'transform 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                transform: `rotateY(${-currentIndex * 120}deg)`
              }}
            >
              {packages.map((pkg, index) => (
                <Box
                  key={pkg.id}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    transform: `rotateY(${index * 120}deg) translateZ(300px)`,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    pointerEvents: index === currentIndex ? 'auto' : 'none',
                  }}
                >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0.7 }}
                    animate={{ 
                      scale: index === currentIndex ? 1 : 0.8,
                      opacity: index === currentIndex ? 1 : 0.5,
                    }}
                    transition={{ 
                      duration: 0.6,
                      type: "spring",
                      stiffness: 100,
                      damping: 25
                    }}
                    whileHover={{ 
                      scale: index === currentIndex ? 1.05 : 0.85,
                    }}
                    style={{
                      transformStyle: index === currentIndex ? 'flat' : 'preserve-3d',
                      width: '100%',
                      maxWidth: '360px',
                      animation: (index === currentIndex && pkg.popular) ? 'heartbeat 2s infinite' : 'none'
                    } as any}
                >
                  <Card
                    sx={{
                        height: '416px',
                        display: 'flex',
                        flexDirection: 'column',
                        position: 'relative',
                        background: pkg.gradient,
                        color: 'white',
                        cursor: index === currentIndex ? 'default' : 'pointer',
                        borderRadius: '8px',
                        border: '1px solid',
                        borderColor: index === currentIndex ? `${pkg.accentColor}66` : 'rgba(255,255,255,0.15)',
                        boxShadow: index === currentIndex 
                          ? '0 12px 24px rgba(0,0,0,0.25)'
                          : '0 6px 12px rgba(0,0,0,0.18)',
                        transition: 'box-shadow 0.3s ease',
                        ...(pkg.id === 'B' && index === currentIndex ? {
                          animation: 'silverPulse 1.4s ease-in-out infinite',
                          borderColor: 'rgba(220,220,220,0.95)',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            inset: -3,
                            borderRadius: '10px',
                            background: 'conic-gradient(from 0deg, rgba(255,255,255,0.6), rgba(200,200,200,0.55), rgba(170,170,170,0.5), rgba(255,255,255,0.6))',
                            filter: 'blur(8px)',
                            zIndex: -2,
                            animation: 'rotateSilverGlow 10s linear infinite',
                          },
                        } : {}),
                        ...(pkg.id === 'C' && index === currentIndex ? {
                          animation: 'goldPulse 1.4s ease-in-out infinite',
                          borderColor: 'rgba(212,175,55,0.95)',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            inset: -3,
                            borderRadius: '10px',
                            background: 'conic-gradient(from 0deg, rgba(212,175,55,0.55), rgba(255,215,0,0.55), rgba(255,235,180,0.5))',
                            filter: 'blur(8px)',
                            zIndex: -2,
                            animation: 'rotateGoldGlow 10s linear infinite',
                          },
                        } : {}),
                        ...(pkg.id === 'A' && index === currentIndex ? {
                          animation: 'bronzePulse 1.4s ease-in-out infinite',
                          borderColor: 'rgba(205,127,50,0.9)',
                          '&::after': {
                            content: '""',
                            position: 'absolute',
                            inset: -3,
                            borderRadius: '10px',
                            background: 'conic-gradient(from 0deg, rgba(205,127,50,0.5), rgba(193,103,29,0.5), rgba(255,220,200,0.45))',
                            filter: 'blur(8px)',
                            zIndex: -2,
                            animation: 'rotateBronzeGlow 10s linear infinite',
                          },
                        } : {}),
                        '&:hover': {
                          boxShadow: '0 16px 28px rgba(0,0,0,0.28)',
                          borderColor: pkg.accentColor,
                        },
                        '&::before': {
                          content: '""',
                          position: 'absolute',
                          top: 0,
                          left: 0,
                          right: 0,
                          bottom: 0,
                          background: index === currentIndex 
                            ? 'linear-gradient(45deg, rgba(255,255,255,0.08) 0%, transparent 50%, rgba(255,255,255,0.04) 100%)'
                            : 'none',
                          borderRadius: 'inherit',
                          pointerEvents: 'none',
                          zIndex: -1
                        }
                      }}
                      onClick={index === currentIndex ? undefined : () => goToSlide(index)}
                    >
                      {/* Sheen especial sólo para Gold */}
                      {pkg.id === 'C' && (
                        <Box
                        sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            zIndex: 1,
                            borderRadius: 'inherit',
                            overflow: 'hidden',
                            pointerEvents: 'none',
                            '&::before': {
                              content: '""',
                              position: 'absolute',
                              top: 0,
                              left: '-60%',
                              width: '40%',
                              height: '100%',
                              background: 'linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)',
                              transform: 'skewX(-20deg)',
                              animation: index === currentIndex ? 'sheen 2.8s linear infinite' : 'none',
                            }
                          }}
                        />
                      )}
                          {/* Sheen especial para Silver */}
                          {pkg.id === 'B' && (
                            <Box
                            sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                zIndex: 1,
                                borderRadius: 'inherit',
                                overflow: 'hidden',
                                pointerEvents: 'none',
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: '-60%',
                                  width: '40%',
                                  height: '100%',
                                  background: 'linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0) 100%)',
                                  transform: 'skewX(-20deg)',
                                  animation: index === currentIndex ? 'sheen 3s linear infinite' : 'none',
                                }
                              }}
                            />
                          )}
                          {/* Sheen especial para Bronze */}
                          {pkg.id === 'A' && (
                        <Box
                          sx={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                zIndex: 1,
                                borderRadius: 'inherit',
                                overflow: 'hidden',
                                pointerEvents: 'none',
                                '&::before': {
                                  content: '""',
                                  position: 'absolute',
                                  top: 0,
                                  left: '-60%',
                                  width: '40%',
                                  height: '100%',
                                  background: 'linear-gradient(120deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0) 100%)',
                                  transform: 'skewX(-20deg)',
                                  animation: index === currentIndex ? 'sheen 3.2s linear infinite' : 'none',
                                }
                              }}
                            />
                          )}
                      <CardContent sx={{ flexGrow: 1, p: 2, textAlign: 'center', position: 'relative', zIndex: 2 }}>
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          style={{
                            fontSize: '1.5rem',
                            fontWeight: 'bold',
                            marginBottom: '0.3rem',
                            textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.3rem'
                          } as any}
                        >
                          {pkg.priceDisplay}
                          {pkg.popular && (
                            <span 
                              style={{
                                fontSize: '1.5rem',
                                filter: 'drop-shadow(0 0 8px #ff6b35)',
                                animation: 'fireGlow 2s ease-in-out infinite alternate'
                              }}
                            >
                              🔥
                            </span>
                          )}
                        </motion.div>

                        {/* Chips/badges solo en diálogo: carrusel limpio */}

                        {/* Imagen del pack */}
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          whileHover={{ y: -4, rotateY: 2 }}
                          transition={{ duration: 0.4 }}
                          style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.25rem' } as any}
                        >
                          <Image
                            src={pkg.imageSrc}
                            alt={`${pkg.name} pack`}
                            width={240}
                            height={240}
                            style={{ objectFit: 'contain', filter: index === currentIndex ? 'none' : 'grayscale(0.2) opacity(0.9)' }}
                            priority={index === currentIndex}
                          />
                        </motion.div>
                        
                        {/* Título reemplazado por precio arriba; se remueve bloque de precio duplicado */}
                        
                        {/* Descripción removida: mantener solo los puntos con check */}
                        
                        <Box sx={{ mb: 2 }}>
                          {pkg.features.slice(0, 2).map((feature, featureIndex) => (
                            <motion.div
                              key={featureIndex}
                              initial={{ opacity: 0, x: -20 }}
                              animate={index === currentIndex ? { opacity: 1, x: 0 } : { opacity: 0.7, x: 0 }}
                              transition={{ 
                                delay: index === currentIndex ? featureIndex * 0.1 : 0,
                                duration: 0.3 
                              }}
                            >
                              <Typography 
                                variant="body2" 
                                    sx={{
                                  display: 'flex', 
                                  alignItems: 'center', 
                                  justifyContent: 'center',
                                  mb: 1,
                                  opacity: 0.95,
                                  fontSize: '0.85rem',
                                  fontWeight: 500
                                }}
                              >
                                <motion.span
                                  animate={index === currentIndex ? { 
                                    color: ['#fff', '#4CAF50', '#fff'],
                                    scale: [1, 1.2, 1]
                                  } : {}}
                                  transition={{ 
                                    duration: 1,
                                    delay: featureIndex * 0.2,
                                    repeat: Infinity,
                                    repeatDelay: 2
                                  }}
                                  style={{ marginRight: '8px' } as any}
                                >
                                  ✓
                                </motion.span>
                                {feature}
                              </Typography>
                            </motion.div>
                          ))}
                                  </Box>
                              </CardContent>

                      <Box sx={{ p: 2, pt: 0, mt: -3, position: 'relative', zIndex: 1000 }}>
                        {index === currentIndex ? (
                        <Button
                          variant="contained"
                            fullWidth
                            size="medium"
                            onClick={() => handleBuyClick(pkg)}
                          sx={{
                              backgroundColor: 'rgba(255, 255, 255, 0.2)',
                              color: 'white',
                              fontWeight: 'bold',
                              fontSize: '1rem',
                              py: 1.25,
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: pkg.id === 'B' ? 'rgba(220,220,220,0.95)' : pkg.id === 'C' ? 'rgba(212,175,55,0.95)' : pkg.id === 'A' ? 'rgba(205,127,50,0.9)' : 'rgba(255,255,255,0.25)',
                              boxShadow: pkg.id === 'B'
                                ? '0 0 14px rgba(220,220,220,0.55), 0 0 28px rgba(180,180,180,0.45)'
                                : pkg.id === 'C'
                                  ? '0 0 16px rgba(212,175,55,0.65), 0 0 32px rgba(255,215,0,0.55)'
                                  : pkg.id === 'A'
                                    ? '0 0 16px rgba(205,127,50,0.5), 0 0 32px rgba(193,103,29,0.45)'
                                    : 'none',
                              zIndex: 1000,
                              position: 'relative',
                              '&:hover': {
                                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                                borderColor: pkg.id === 'B' ? 'rgba(235,235,235,0.95)' : pkg.id === 'C' ? 'rgba(255,215,0,0.95)' : pkg.id === 'A' ? 'rgba(205,127,50,0.95)' : pkg.accentColor,
                                boxShadow: pkg.id === 'B'
                                  ? '0 0 20px rgba(235,235,235,0.8), 0 0 40px rgba(180,180,180,0.7)'
                                  : pkg.id === 'C'
                                    ? '0 0 22px rgba(255,215,0,0.85), 0 0 46px rgba(212,175,55,0.7)'
                                    : pkg.id === 'A'
                                      ? '0 0 20px rgba(205,127,50,0.75), 0 0 40px rgba(193,103,29,0.65)'
                                      : `0 0 12px ${pkg.accentColor}80`,
                              }
                            }}
                          >
                            Buy Now
                        </Button>
                        ) : (
                        <Button
                            variant="contained"
                            fullWidth
                            size="medium"
                            disabled
                          sx={{
                              backgroundColor: 'rgba(255, 255, 255, 0.05)',
                              color: 'rgba(255, 255, 255, 0.3)',
                              fontWeight: 'bold',
                              fontSize: '1rem',
                              py: 1.25,
                              borderRadius: 1,
                              border: '1px solid',
                              borderColor: 'rgba(255,255,255,0.15)',
                            }}
                          >
                            Buy Now
                        </Button>
                        )}
                      </Box>

                  </Card>
                </motion.div>
            </Box>
              ))}
            </Box>
          </Box>

          {/* Puntos de paginación */}
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3, gap: 1 }}>
            {packages.map((_, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 0.9 }}
              >
                <Box
                  onClick={() => goToSlide(index)}
                      sx={{
                    width: index === currentIndex ? 16 : 12,
                    height: index === currentIndex ? 16 : 12,
                    borderRadius: '50%',
                    backgroundColor: index === currentIndex ? 'primary.main' : 'rgba(255, 255, 255, 0.4)',
                    cursor: 'pointer',
                    transition: 'all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                    border: index === currentIndex ? '2px solid rgba(255, 255, 255, 0.8)' : '2px solid transparent',
                    boxShadow: index === currentIndex 
                      ? '0 0 15px rgba(25, 118, 210, 0.6), 0 4px 8px rgba(0,0,0,0.2)' 
                      : '0 2px 4px rgba(0,0,0,0.1)',
                    position: 'relative',
                    '&:hover': {
                      backgroundColor: index === currentIndex ? 'primary.main' : 'rgba(255, 255, 255, 0.7)',
                      transform: 'translateY(-2px)',
                    },
                    '&::after': index === currentIndex ? {
                      content: '""',
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: 'translate(-50%, -50%)',
                      width: '200%',
                      height: '200%',
                      borderRadius: '50%',
                      background: 'radial-gradient(circle, rgba(25, 118, 210, 0.2) 0%, transparent 70%)',
                      animation: 'pulseEffect 2s infinite',
                      zIndex: -1
                    } : {}
                  }}
                />
              </motion.div>
            ))}
                    </Box>

                    </Box>
      </Box>

      {/* Dialog de confirmación mejorado */}
      <Dialog 
        open={dialogOpen} 
        onClose={handleCloseDialog} 
        maxWidth="sm" 
        fullWidth
        TransitionProps={{
          onExited: () => {
            // Limpiar estado una vez que la transición haya terminado
            setSelectedPackage(null);
            setTermsAccepted(false);
            setFeedback(null);
          }
        }}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            background: selectedPackage?.gradient || 'rgba(0,0,0,0.6)',
            color: 'white',
            overflow: 'visible',
            position: 'relative',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'linear-gradient(45deg, rgba(255,255,255,0.1) 0%, transparent 50%, rgba(255,255,255,0.05) 100%)',
              borderRadius: 'inherit',
              pointerEvents: 'none',
              zIndex: 1
            }
          }
        }}
      >
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.4, type: "spring", stiffness: 120 }}
        >
          <DialogTitle sx={{ 
            textAlign: 'center', 
            position: 'relative', 
            zIndex: 2,
            pb: 1
          }}>
            <motion.div
              animate={{ 
                textShadow: [
                  '0 0 10px rgba(255,255,255,0.3)',
                  '0 0 20px rgba(255,255,255,0.6)',
                  '0 0 10px rgba(255,255,255,0.3)'
                ]
              }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
              style={{ 
                fontSize: '1.5rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              } as any}
            >
              Confirm Purchase - {selectedPackage ? (selectedPackage.id === 'C' ? 'Gold Pack' : selectedPackage.id === 'B' ? 'Silver Pack' : 'Bronze Pack') : ''}
              {selectedPackage?.popular && (
                <span 
                  style={{
                    fontSize: '1.2rem',
                    filter: 'drop-shadow(0 0 8px #ff6b35)',
                    animation: 'fireGlow 2s ease-in-out infinite alternate'
                  }}
                >
                  🔥
                </span>
              )}
            </motion.div>
          </DialogTitle>
          
          <DialogContent sx={{ position: 'relative', zIndex: 2, textAlign: 'center' }}>
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Typography variant="h4" sx={{ mb: 2, fontWeight: 'bold' }}>
                {selectedPackage?.priceDisplay}
              </Typography>
            </motion.div>

            {/* Chip de rareza dentro del diálogo */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <Chip
                size="small"
                variant="filled"
                icon={<Star />}
                label={selectedPackage ? (selectedPackage.id === 'C' ? 'Gold' : selectedPackage.id === 'B' ? 'Silver' : 'Bronze') : ''}
                sx={{
                  color: '#ffffff',
                  backgroundColor: '#9C27B0',
                  border: '1px solid #7E57C2',
                  '& .MuiChip-icon': { color: '#FFFFFF' },
                  '& .MuiChip-label': { color: '#FFFFFF', fontWeight: 700 }
                }}
              />
            </Box>

            {/* Badges removidos del diálogo para mantenerlo limpio */}
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Typography variant="body1" sx={{ mb: 3, opacity: 0.9 }}>
                {selectedPackage?.description}
              </Typography>
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
          <FormControlLabel
            control={
              <Checkbox
                checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    sx={{
                      color: 'rgba(255,255,255,0.7)',
                      '&.Mui-checked': {
                        color: 'white',
                      }
                    }}
                  />
                }
                label="I accept the terms and conditions"
                sx={{ color: 'white' }}
              />
            </motion.div>
            
            {feedback && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ type: "spring", stiffness: 120 }}
              >
                <Alert 
                  severity="error" 
                  sx={{ 
                    mt: 2,
                    backgroundColor: 'rgba(244, 67, 54, 0.2)',
                    color: 'white',
                    '& .MuiAlert-icon': {
                      color: '#ff6b6b'
                    }
                  }}
                >
                  {feedback}
                </Alert>
              </motion.div>
            )}
        </DialogContent>
          
          <DialogActions sx={{ 
            position: 'relative', 
            zIndex: 2, 
            justifyContent: 'center',
            gap: 2,
            pb: 3
          }}>
            <Button 
              onClick={handleCloseDialog}
              sx={{
                color: 'white',
                borderColor: 'rgba(255,255,255,0.3)',
                '&:hover': {
                  borderColor: 'rgba(255,255,255,0.6)',
                  backgroundColor: 'rgba(255,255,255,0.1)'
                }
              }}
              variant="outlined"
            >
              Cancel
            </Button>
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
          <Button
            onClick={handleConfirmPurchase}
            variant="contained"
            disabled={!termsAccepted || loading}
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : null}
                sx={{
                  background: 'rgba(255,255,255,0.2)',
                  color: 'white',
                  fontWeight: 'bold',
                  px: 4,
                  py: 1.5,
                  borderRadius: '12px',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255,255,255,0.3)',
                  '&:hover': {
                    background: 'rgba(255,255,255,0.3)',
                    transform: 'translateY(-2px)',
                    boxShadow: '0 8px 25px rgba(0,0,0,0.3)'
                  },
                  '&:disabled': {
                    background: 'rgba(255,255,255,0.1)',
                    color: 'rgba(255,255,255,0.5)'
                  }
                }}
              >
                {loading ? 'Buying...' : 'Confirm Purchase'}
          </Button>
            </motion.div>
        </DialogActions>
        </motion.div>
      </Dialog>
    </>
  );
}
