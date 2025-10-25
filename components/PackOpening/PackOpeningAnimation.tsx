"use client";

import React, { useState, useEffect, useRef, useMemo, useLayoutEffect } from 'react';
import { Box, Typography } from '@mui/material';
import { motion, AnimatePresence } from "framer-motion";
import { getLocalPlayerImageByName } from "../../lib/utils";
import Image from 'next/image';

/* ---------- Tipos ---------- */
type Player = {
  id: number;
  name: string;   // no se muestra (va en la imagen)
  image: string;  // http(s):// o ipfs://
  type: string;   // "gold" | "silver" | "bronze" | ...
  country: string;// no se muestra
};

type Props = {
  players: Player[];
  open: boolean;
  onClose: () => void;
  audioSrc?: string;       // "/open.mp3"
  bpm?: number;            // brillo al beat (sin escala)
  ipfsGateway?: string;    // "https://cloudflare-ipfs.com/ipfs/"
  packImageSrc?: string;   // "/booster_pack.png"
};

/* ---------- Utils ---------- */
// Centralizado en getLocalPlayerImage(idLike)

const rarityBg = (t: string) => {
  const x = (t||"").toLowerCase();
  // Gradientes con varias paradas para efecto metálico
  if (x === "gold")   return "linear-gradient(135deg, #fff4c2 0%, #f9d977 18%, #d4af37 40%, #a47c1b 60%, #f9d977 82%, #fff4c2 100%)";
  if (x === "silver") return "linear-gradient(135deg, #f8f9fb 0%, #dfe3e8 18%, #c0c6cf 40%, #8b93a1 60%, #dfe3e8 82%, #f8f9fb 100%)";
  if (x === "bronze") return "linear-gradient(135deg, #ffe0c2 0%, #e3a570 18%, #cd7f32 40%, #8a4f1a 60%, #e3a570 82%, #ffe0c2 100%)";
  // fallback violeta de marca
  return "linear-gradient(135deg, #a78bfa 0%, #7c3aed 50%, #a78bfa 100%)";
};

// PRNG determinístico para partículas
function makeRand(seed: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seed.length; i++) { h ^= seed.charCodeAt(i); h = Math.imul(h, 16777619) >>> 0; }
  return () => ((h = (1103515245 * h + 12345) >>> 0) / 0xffffffff);
}

/* ---------- Componente principal ---------- */
function PackOpeningAnimation({
  players,
  open,
  onClose,
  audioSrc = "/open.mp3",
  bpm = 120,
  ipfsGateway = "https://cloudflare-ipfs.com/ipfs/",
  packImageSrc = "/booster_pack.png",
}: Props) {
  console.log('[PackOpeningAnimation] Props recibidas:', { 
    players: players?.map(p => ({ id: p.id, name: p.name, image: p.image, type: p.type })),
    playersCount: players?.length 
  });
  // visibilidad interna
  const [internalOpen, setInternalOpen] = useState(false);
  useEffect(() => {
    if (open) {
      // Reinicia estado para nueva apertura y muestra overlay
      setInternalOpen(true);
      setStage('closed');
      setRevealed(0);
      setLaunched(0);
      setSlotsVisible(0);
      setMaxSlotsVisible(0);
      crashPlayedRef.current = false;
    } else {
      // Cerrar overlay si el padre apagó open
      if (internalOpen) {
        setInternalOpen(false);
        cleanup();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

type Stage = "closed" | "exploding" | "launching" | "revealing" | "grid" | "beating";
  const [stage, setStage] = useState<Stage>("closed");
  const [revealed, setRevealed] = useState(0);
  const [launched, setLaunched] = useState(0);
  const [isBeat, setIsBeat] = useState(false);
  const [beatSeed, setBeatSeed] = useState(0);
  const [packLoaded, setPackLoaded] = useState(false);
  // Control de aparición del equipo en el marco (luego de TODAS las cartas grandes)
  const [slotsVisible, setSlotsVisible] = useState(0);
  const [maxSlotsVisible, setMaxSlotsVisible] = useState(0);


  // Zoom
  const [zoomSrc, setZoomSrc] = useState<string | null>(null);
  const [viewport, setViewport] = useState<{ w:number; h:number }>({ w: 0, h: 0 });
  const [explosionStep, setExplosionStep] = useState(0); // 0 -> base, 1 -> _02, 2 -> _03

  // audio/timers
  const audioRef = useRef<HTMLAudioElement|null>(null);
  const goalAudioRef = useRef<HTMLAudioElement|null>(null);
  const rafRef = useRef<number|null>(null);
  const intervalRef = useRef<number|null>(null);
  const beatTRef = useRef<number|null>(null);
  const crashPlayedRef = useRef(false);
  const timeoutsRef = useRef<number[]>([]);

  const setTO = (fn: () => void, delay: number) => {
    const id = window.setTimeout(() => {
      // Remover id al disparar para no intentar limpiarlo de nuevo
      timeoutsRef.current = timeoutsRef.current.filter((x) => x !== id);
      fn();
    }, delay);
    timeoutsRef.current.push(id as unknown as number);
    return id;
  };

  // FLAG: apertura sólo una vez por sesión
  const startedRef = useRef(false);
  // Simple SFX helper
  const playSfx = (src: string, volume = 0.9) => {
    try {
      const s = new Audio(src);
      s.volume = volume;
      s.play().catch(() => {});
    } catch {}
  };


  // Medir viewport para decidir escala de fondo y evitar bordes
  useEffect(() => {
    const onResize = () => setViewport({ w: window.innerWidth, h: window.innerHeight });
    onResize();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Color de acento del marco según pack (oro/plata/bronce)
  const frameAccent = useMemo(() => {
    const s = (packImageSrc || '').toLowerCase();
    if (s.includes('gold') || s.includes('oro')) {
      return {
        base: '#D4AF37',
        ringA: 'rgba(255,215,0,0.95)',
        ringB: 'rgba(255,240,200,0.9)',
        border: 'rgba(255,215,0,0.95)',
        text: '#FFD700',
      } as const;
    }
    if (s.includes('silver') || s.includes('plata')) {
      return {
        base: '#C0C0C0',
        ringA: 'rgba(245,248,255,0.95)',
        ringB: 'rgba(192,198,207,0.9)',
        border: 'rgba(245,248,255,0.95)',
        text: '#E6EBF5',
      } as const;
    }
    if (s.includes('bronze') || s.includes('bronce')) {
      return {
        base: '#CD7F32',
        ringA: 'rgba(255,220,200,0.95)',
        ringB: 'rgba(205,127,50,0.9)',
        border: 'rgba(255,220,200,0.95)',
        text: '#FFD9B3',
      } as const;
    }
    // fallback electric violet
    return {
      base: '#8A2BE2',
      ringA: 'rgba(138,43,226,0.95)',
      ringB: 'rgba(124,77,255,0.9)',
      border: 'rgba(180,120,255,0.95)',
      text: '#E8D7FF',
    } as const;
  }, [packImageSrc]);

  // layout determinístico (px fijos)
  const GAP = 24;
  const CARD_W = 160;
  const CARD_H = Math.round(CARD_W * 4/3); // 213
  const TOTAL_W = 5*CARD_W + 4*GAP;

  // 5 cartas ordenadas por rareza (oro, plata, bronce)
  const five: Player[] = useMemo(() => {
    const a = (players||[]).slice(0,5);
    while (a.length < 5) a.push({ id: -1000-a.length, name:"", image:"", type:"silver", country:"" });
    
    // Ordenar por rareza: oro primero, luego plata, luego bronce
    return a.sort((a, b) => {
      const rarityOrder = { gold: 0, silver: 1, bronze: 2 };
      const aRarity = rarityOrder[a.type.toLowerCase() as keyof typeof rarityOrder] ?? 3;
      const bRarity = rarityOrder[b.type.toLowerCase() as keyof typeof rarityOrder] ?? 3;
      return aRarity - bRarity;
    });
  }, [players]);

  // Preload de imágenes de cartas (top 5) cuando se abre
  useEffect(() => {
    if (!internalOpen) return;
    const uniqueSrcs = Array.from(new Set((five || []).map(p => p.image).filter(Boolean)));
    const links: HTMLLinkElement[] = [];
    uniqueSrcs.slice(0, 5).forEach((src) => {
      try {
        const l = document.createElement('link');
        l.rel = 'preload';
        l.as = 'image';
        l.href = src!;
        document.head.appendChild(l);
        links.push(l);
      } catch {}
    });
    return () => {
      links.forEach(l => {
        try { document.head.removeChild(l); } catch {}
      });
    };
  }, [internalOpen, five.map(p => p.image).join(',')]);

  // Solo cargar la imagen del pack - las cartas se encargan de sí mismas
  const [ready, setReady] = useState(false);
  
  useEffect(() => {
    if (!internalOpen) return;

    const img = new window.Image();
    img.onload = () => {
      setPackLoaded(true);
      setReady(true);
    };
    img.onerror = () => {
      setPackLoaded(true);
      setReady(true);
    };
    img.src = packImageSrc;

    // Preload de frames _02 y _03 para evitar parpadeos en Chrome
    const derive = (s:string, suffix:string) => {
      const idx = s.lastIndexOf('.');
      if (idx === -1) return s + suffix;
      return s.slice(0, idx) + suffix + s.slice(idx);
    };
    try {
      // link rel=preload para dar máxima prioridad al navegador
      const links: HTMLLinkElement[] = [];
      const addPreload = (href: string) => {
        const l = document.createElement('link');
        l.rel = 'preload';
        l.as = 'image';
        l.href = href;
        document.head.appendChild(l);
        links.push(l);
      };
      addPreload(packImageSrc);
      addPreload(derive(packImageSrc, '_02'));
      addPreload(derive(packImageSrc, '_03'));
      addPreload('/field.png');

      const img2 = new window.Image();
      img2.decoding = 'async' as any;
      img2.loading = 'eager' as any;
      img2.src = derive(packImageSrc, '_02');
      const img3 = new window.Image();
      img3.decoding = 'async' as any;
      img3.loading = 'eager' as any;
      img3.src = derive(packImageSrc, '_03');

      return () => {
        links.forEach(l => { try { document.head.removeChild(l); } catch {} });
      };
    } catch {}
  }, [internalOpen, packImageSrc]);

  // reveal inteligente basado en imágenes cargadas
  const REVEAL_MS = 2000;
  const beatPeriod = Math.max(0.1, 60 / bpm);

  useEffect(() => {
    if (!internalOpen || !ready || startedRef.current) return;

    // Evitar dobles inicios
    if (startedRef.current) return;
    startedRef.current = true; // ← sólo una vez
    const a = new Audio(audioSrc);
    a.volume = 0.8;
    a.preload = "auto";
    a.loop = true; // Se reproducirá cuando empiece el reveal
    audioRef.current = a;
    
    // Sin protecciones de audio para permitir cerrarlo correctamente

    // 1) Explosión de pack centrado → 2) lanzamiento y revelado secuencial
    setStage("exploding");
    // SFX crash al comienzo de la animación de explosión
    playSfx('/audio/crash.mp3', 0.9);

    // Después de un breve delay de explosión, iniciar lanzamientos
    const EXPLOSION_MS = 2000; // más lento para apreciar el "crash"
    const REVEAL_PAUSE_MS = 2200; // Pausa por carta grande
    const FADE_MS = 200;          // Fade de transición entre cartas grandes
    const GRID_STEP_MS = 1100;    // Aparición por slot (más lenta)
    const FRAME_LEAD_MS = 600; // tiempo para mostrar marco antes de la primera carta

    // Secuencia de frames del sobre roto (0→1→2)
    setExplosionStep(0);
    setTO(() => { 
      setExplosionStep(1);
      if (!crashPlayedRef.current) { playSfx('/audio/crash.mp3', 0.9); crashPlayedRef.current = true; }
    }, Math.round(EXPLOSION_MS * 0.35));
    setTO(() => { setExplosionStep(2); }, Math.round(EXPLOSION_MS * 0.7));

    // Música de fondo: iniciar 1s antes del primer overlay/reveal
    const musicStartDelay = Math.max(EXPLOSION_MS + FRAME_LEAD_MS - 1000, 0);
    setTO(() => { 
      if (audioRef.current) {
        audioRef.current.play().catch(() => {
          // Fallback para Chrome: requerir interacción del usuario
          const onClick = () => {
            audioRef.current?.play().finally(() => {
              document.removeEventListener('click', onClick);
            });
          };
          document.addEventListener('click', onClick);
        });
      }
    }, musicStartDelay);

    setTO(() => {
      setStage("launching");

      for (let i = 0; i < five.length; i++) {
        // carta grande i
        setTO(() => setLaunched(v => Math.max(v, i + 1)), FRAME_LEAD_MS + i * (REVEAL_PAUSE_MS + FADE_MS));
        // desaparecer grande i (mostrar siguiente)
        setTO(() => setLaunched(v => v), FRAME_LEAD_MS + i * (REVEAL_PAUSE_MS + FADE_MS) + REVEAL_PAUSE_MS);
      }

      // al terminar la quinta grande, mostrar grid de izq a der con fade-in
      const gridStart = FRAME_LEAD_MS + five.length * (REVEAL_PAUSE_MS + FADE_MS);
      setTO(() => {
        setStage('grid');
        setSlotsVisible(0);
        for (let i = 0; i < five.length; i++) {
          setTO(() => setSlotsVisible(v => Math.max(v, i + 1)), i * GRID_STEP_MS);
        }
      }, gridStart);

      // goal + beating después
      const beatStart = gridStart + five.length * GRID_STEP_MS + 600;
      setTO(() => {
        try {
          if (!goalAudioRef.current) {
            goalAudioRef.current = new Audio('/audio/enter_the_field.mp3');
            goalAudioRef.current.volume = 1.0;
            goalAudioRef.current.preload = 'auto';
          } else {
            goalAudioRef.current.currentTime = 0;
          }
          goalAudioRef.current.play().catch(() => {
            const onClick = () => {
              goalAudioRef.current?.play().finally(() => {
                document.removeEventListener('click', onClick);
              });
            };
            document.addEventListener('click', onClick);
          });
        } catch {}
        setStage('beating');
      }, beatStart);
    }, EXPLOSION_MS);
    
    
    // No reproducir música aún: se iniciará al revelar la primera carta

    return () => {
      // cleanup cuando se desmonta/cierran
      if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
      if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime=0; audioRef.current=null; }
      // Evitar re-ejecución: cerrar completamente estado interno
      setInternalOpen(false);
      startedRef.current = false;
      setStage('closed');
      setRevealed(0);
      setLaunched(0);
      crashPlayedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [internalOpen, ready, audioSrc]);

  // Asegurar que la primera carta sea visible desde el primer frame del grid/beating
  useLayoutEffect(() => {
    if (stage === 'grid' || stage === 'beating') {
      setMaxSlotsVisible((prev) => (prev < 1 ? 1 : prev));
    }
  }, [stage]);

  // Evitar retroceso: guardar el máximo alcanzado de slots visibles
  useEffect(() => {
    setMaxSlotsVisible(prev => Math.max(prev, slotsVisible));
  }, [slotsVisible]);

  // ESC: en un efecto separado (no toca la apertura)
  useEffect(() => {
    if (!internalOpen) return;
    const onEsc = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      if (zoomSrc) setZoomSrc(null);
      else handleClose();
    };
    window.addEventListener("keydown", onEsc);
    return () => window.removeEventListener("keydown", onEsc);
  }, [internalOpen, zoomSrc]);

  // latido (solo brillo)
  useEffect(() => {
    if (stage !== "beating" || !audioRef.current) return;
    let last = -1;
    const tick = () => {
      const t = audioRef.current!.currentTime;
      const idx = Math.floor(t / beatPeriod);
      if (idx !== last) {
        last = idx;
        setIsBeat(true);
        setBeatSeed(s=>s+1);
        if (beatTRef.current) clearTimeout(beatTRef.current);
        beatTRef.current = window.setTimeout(() => setIsBeat(false), 160);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); if (beatTRef.current) clearTimeout(beatTRef.current); };
  }, [stage, beatPeriod]);

  // Cleanup al desmontar el componente
  useEffect(() => {
    return () => {
      // Asegurar que el audio se detenga al desmontar
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        // No intentar cambiar src ya que puede estar protegido
        audioRef.current = null;
      }
      if (goalAudioRef.current) {
        goalAudioRef.current.pause();
        goalAudioRef.current.currentTime = 0;
        goalAudioRef.current = null;
      }
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      if (beatTRef.current) clearTimeout(beatTRef.current);
    };
  }, []);

  // Reproducir gol cuando cae el confeti (al entrar en "beating").
  // Si por autoplay no sonó 1s antes, forzar aquí.
  useEffect(() => {
    if (stage !== 'beating') return;
    try {
      if (!goalAudioRef.current) {
        goalAudioRef.current = new Audio('/audio/enter_the_field.mp3');
        goalAudioRef.current.volume = 1.0;
        goalAudioRef.current.preload = 'auto';
      } else {
        goalAudioRef.current.currentTime = 0;
      }
      goalAudioRef.current.play().catch(() => {
        const onClick = () => {
          goalAudioRef.current?.play().finally(() => {
            document.removeEventListener('click', onClick);
          });
        };
        document.addEventListener('click', onClick);
      });
    } catch {}
  }, [stage]);

  const cleanup = () => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
    if (rafRef.current) { cancelAnimationFrame(rafRef.current); rafRef.current = null; }
    if (beatTRef.current) { clearTimeout(beatTRef.current); beatTRef.current = null; }
    // Limpiar todos los timeouts pendientes para evitar re-disparos
    if (timeoutsRef.current.length) {
      timeoutsRef.current.forEach((id) => clearTimeout(id));
      timeoutsRef.current = [];
    }
    if (audioRef.current) { 
      audioRef.current.pause(); 
      audioRef.current.currentTime = 0;
      // No intentar cambiar src ya que puede estar protegido
      audioRef.current = null; 
    }
    // Reset de estados para evitar re-ejecución automática si el overlay sigue montado
    setStage("closed");
    setRevealed(0);
    setLaunched(0);
    startedRef.current = false;
  };

  const handleClose = () => {
    // Detener audio ANTES de cleanup
    if (audioRef.current) {
      try {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        // No intentar cambiar src ya que puede estar protegido
        audioRef.current = null;
      } catch (e) {
        console.log('Error deteniendo audio:', e);
      }
    }
    if (goalAudioRef.current) {
      try {
        goalAudioRef.current.pause();
        goalAudioRef.current.currentTime = 0;
        goalAudioRef.current = null;
      } catch {}
    }
    
    // Llamar onClose primero para que el padre navegue y evitemos flickers
    onClose?.();
    // Luego limpiar en background
    cleanup();
    setInternalOpen(false);
  };

  if (!internalOpen) return null;

  return (
    <div
      // Overlay FULL aislado
      style={{
        position: "fixed", inset: 0, zIndex: 999999,
        background: "linear-gradient(180deg, rgba(0,0,0,0.6), rgba(0,0,0,0.8))",
        isolation: "isolate", contain: "layout paint size style",
        fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, Arial",
      }}
      onClick={() => (zoomSrc ? setZoomSrc(null) : handleClose())}
    >
      {/* Fondo global sin campo (solo degradado del overlay superior) */}
      {/* Botón cerrar (zIndex alto y stopPropagation) */}
      <button
        onClick={(e) => { e.stopPropagation(); handleClose(); }}
        aria-label="Cerrar"
        style={{
          position: "absolute", top: 16, right: 16, color: "#fff",
          background: "rgba(255,255,255,0.12)", border: "none",
          borderRadius: 8, padding: "8px 10px", cursor: "pointer",
          zIndex: 1000, pointerEvents: "auto",
        }}
      >✕</button>

      {/* Contenedor principal unificado - luces, confeti, haz de luz y cartas */}
      <div
        style={{
          position: "absolute", 
          left: 0, 
          right: 0, 
          top: 0, 
          bottom: 0,
          display: "flex", 
          alignItems: "center", 
          justifyContent: "center",
          padding: "0 32px", 
          overflowX: "auto", 
          overflowY: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div
          style={{
            position: "relative",
            width: `${3 * CARD_W + 2 * GAP + 160}px`, // Ancho ampliado para mejor proporción
            height: `${2 * CARD_H + GAP + 160}px`, // Alto ampliado para mejor proporción
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: `${GAP}px`,
            paddingTop: 56,
          }}
        >
          {/* Campo dentro del marco (recortado al área interna). Debe quedar debajo del borde del marco */}
          {(stage === 'launching' || stage === 'revealing' || stage === 'grid' || stage === 'beating') && (
            <div
              aria-hidden
              style={{
                position: 'absolute',
                top: 0, left: 0, right: 0, bottom: 0,
                overflow: 'hidden', borderRadius: 24,
                zIndex: 0, pointerEvents: 'none',
                border: `1px solid ${frameAccent.border}`
              }}
            >
              <Image
                src="/field.png"
                alt="field"
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 1200px"
                style={{
                  objectFit: 'cover', filter: 'blur(2px) brightness(0.96) saturate(1.05)', transform: 'scale(1.02)'
                }}
              />
            </div>
          )}
          {/* Marco del estadio: aparece después de la explosión y antes de las cartas */}
          {(stage === 'launching' || stage === 'revealing' || stage === 'grid' || stage === 'beating') && (
          <motion.div
            aria-hidden
            initial={{ opacity: 0 }}
            animate={{ opacity: [0.85, 1, 0.85], boxShadow: [
              `0 0 14px ${frameAccent.ringA}, inset 0 0 110px rgba(255,255,255,0.06), 0 0 96px ${frameAccent.ringA}, 0 0 200px ${frameAccent.ringB}`,
              `0 0 20px ${frameAccent.ringB}, inset 0 0 140px rgba(255,255,255,0.08), 0 0 140px ${frameAccent.ringA}, 0 0 240px ${frameAccent.ringB}`,
              `0 0 14px ${frameAccent.ringA}, inset 0 0 110px rgba(255,255,255,0.06), 0 0 96px ${frameAccent.ringA}, 0 0 200px ${frameAccent.ringB}`
            ] }}
            transition={{ duration: 3.0, repeat: Infinity, ease: "easeInOut" }}
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: 24,
              border: `1px solid ${frameAccent.border}`,
              boxShadow: `0 0 14px ${frameAccent.ringA}, inset 0 0 110px rgba(255,255,255,0.06), 0 0 96px ${frameAccent.ringA}, 0 0 200px ${frameAccent.ringB}`,
              pointerEvents: 'none',
              zIndex: 0,
              background: 'linear-gradient(180deg, rgba(255,255,255,0.04), rgba(255,255,255,0.01))'
            }}
          />)}
          {/* Sheen diagonal sobre el borde del marco (metalizado) */}
          {(stage === 'launching' || stage === 'revealing' || stage === 'grid' || stage === 'beating') && (
            <motion.div
              aria-hidden
              initial={{ x: '-130%', opacity: 0 }}
              animate={{ x: '150%', opacity: [0, 0.45, 0] }}
              transition={{ duration: 3.8, repeat: Infinity, repeatDelay: 1.8, ease: 'easeInOut' }}
              style={{
                position: 'absolute',
                top: -2, bottom: -2,
                left: '-16%', width: '32%',
                borderRadius: 26,
                pointerEvents: 'none',
                background: `linear-gradient(30deg, rgba(255,255,255,0.0), ${frameAccent.ringA}, ${frameAccent.ringB}, rgba(255,255,255,0.0))`,
                filter: 'blur(6px)',
                mixBlendMode: 'screen',
                zIndex: 0,
              }}
            />
          )}
          {/* Pack centrado base durante launching (debajo de cartas volando) */}
          {(stage === 'launching') && (
            <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', opacity: 0.2 }}>
              <div style={{ position: 'relative', width: CARD_W + 60, height: CARD_H + 60 }}>
                <Image src={packImageSrc || "/booster_pack.png"} alt="pack" fill style={{ objectFit: 'contain' }} unoptimized />
              </div>
            </div>
          )}
          {/* Efectos de estadio - confeti y texto */}
          {ready && (stage === "revealing" || stage === "beating") && (
            <>
              {/* Confeti dentro del área de cartas */}
              {[...Array(20)].map((_, i) => {
                // Área de confeti basada en el ancho ampliado del contenedor
                const containerWidth = 3 * CARD_W + 2 * GAP + 160;
                const containerHeight = 2 * CARD_H + GAP + 160;
                
                // Distribuir confeti en el área central donde están las cartas
                const margin = 80; // Margen más amplio
                const randomX = margin + Math.random() * (containerWidth - 2 * margin);
                const randomY = -100; // Empezar arriba
                
                return (
                  <motion.div
                    key={`confetti-${i}`}
                    initial={{ 
                      opacity: 0,
                      y: randomY,
                      x: randomX -300,
                      rotate: 0,
                      scale: 0
                    }}
                    animate={{
                      opacity: [0, 1, 1, 0],
                      y: containerHeight + 200,
                      rotate: [0, 360 * (Math.random() > 0.5 ? 1 : -1)],
                      scale: [0, 1, 1, 0.5]
                    }}
                    transition={{
                      duration: 2 + Math.random() * 2,
                      delay: 0.5 + Math.random() * 1,
                      ease: "easeOut"
                    }}
                    style={{
                      position: "absolute",
                      width: "8px",
                      height: "8px",
                      background: i % 3 === 0 ? "#FFD700" : i % 3 === 1 ? "#FFA500" : "#FFFFFF",
                      borderRadius: Math.random() > 0.5 ? "50%" : "0%",
                      zIndex: 15,
                    }}
                  />
                );
              })}

              {/* Texto "YOUR TEAM" dentro del marco, sobre la primera fila */}
              <motion.div
                initial={{ opacity: 0, y: -30, scale: 0.8 }}
                animate={{ 
                  opacity: 1,
                  y: 0,
                  scale: 1
                }}
                transition={{ 
                  duration: 1,
                  delay: 0.8,
                  ease: "easeOut"
                }}
                style={{
                  position: "absolute",
                  top: 28,
                  left: 0,
                  right: 0,
                  transform: "none",
                  fontSize: "28px",
                  fontWeight: "bold",
                  color: frameAccent.text,
                  letterSpacing: "4px",
                  textAlign: "center",
                  zIndex: 5,
                  pointerEvents: "none",
                  whiteSpace: "nowrap",
                }}
              >
                <span style={{ color: '#FFD700', marginRight: 8 }}>🏆</span>
                <motion.span
                  style={{
                    display: 'inline-block',
                    background: `linear-gradient(90deg, ${frameAccent.ringA}, #FFFFFF, ${frameAccent.ringB})`,
                    WebkitBackgroundClip: 'text',
                    backgroundClip: 'text',
                    color: 'transparent',
                    backgroundSize: '200% 100%',
                    filter: 'drop-shadow(0 0 6px rgba(255,255,255,0.35))'
                  }}
                  animate={{ backgroundPosition: ['-60% 0%', '160% 0%', '-60% 0%'] }}
                  transition={{ duration: 6.2, repeat: Infinity, ease: 'easeInOut', repeatDelay: 2.0 }}
                >
                  YOUR TEAM
                </motion.span>
                <span style={{ color: '#FFD700', marginLeft: 8 }}>🏆</span>
              </motion.div>
            </>
          )}

          {/* Explosión de pack centrado */}
          {ready && stage === "exploding" && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: [0, 1, 1, 0.9, 0], scale: [0.9, 1.05, 1.15, 1.35, 1.1], rotate: [0, 4, -3, 6, 0] }}
              transition={{ duration: 1.8, ease: "easeOut" }}
              style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%, -50%)" }}
            >
              <div style={{ position: 'relative', width: CARD_W + 80, height: CARD_H + 80 }}>
                {/* Secuencia de frames: base → _02 → _03 con cross-fade */}
                <FrameSequenceCrossFade baseSrc={packImageSrc || "/booster_pack.png"} step={explosionStep} />
                {/* destello radial */}
                <motion.div
                  initial={{ opacity: 0, scale: 0 }}
                  animate={{ opacity: [0, 0.8, 0], scale: [0, 2.8, 2] }}
                  transition={{ duration: 1.2, ease: 'easeOut' }}
                  style={{ position: 'absolute', inset: 0, borderRadius: 9999, background: 'radial-gradient(circle, rgba(255,255,255,0.75), rgba(255,215,0,0.45), transparent)' }}
                />
                {/* partículas de explosión */}
                <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
                  <BurstParticles w={CARD_W + 80} h={CARD_H + 80} seed={`center-burst`} />
                </div>
              </div>
            </motion.div>
          )}

          {/* Vuelo y revelado de cartas desde el centro */}
          {(stage === "launching") && (
            <>
              {(() => {
                const i = launched - 1; // mostrar solo la actual
                if (i < 0 || i >= five.length) return null;
                const p = five[i];
                const pos = getSlotPosition(i, CARD_W, CARD_H, GAP);
                return (
                  <CardFlightSlot
                    key={`flight-${i}-${p?.id ?? 'x'}`}
                    x={pos.x}
                    y={pos.y}
                    cardW={CARD_W}
                    cardH={CARD_H}
                    gap={GAP}
                    landed={false}
                    packImg={packImageSrc}
                    cardImg={getLocalPlayerImageByName(p?.name || '')}
                    bg={rarityBg(p?.type || '')}
                    beatOn={false}
                    beatSeed={`${i}-${beatSeed}`}
                    onZoom={(src)=> setZoomSrc(src)}
                    rarity={(p?.type || '').toLowerCase()}
                  />
                );
              })()}
            </>
          )}

          {/* Aparición en el marco (luego de todas las grandes) */}
          {(stage === 'grid' || stage === 'beating') && (
            <>
              {(() => {
                // Capa fija para la primera carta (índice 0), sin transición ni animaciones
                // Permanece visible para blindar contra flickers en producción
                const i = 0;
                const p = five[i];
                const pos = getSlotPosition(i, CARD_W, CARD_H, GAP);
                return (
                  <div
                    key={`grid-pinned-0`}
                    style={{
                      position: 'absolute', left: pos.x, top: pos.y,
                      width: CARD_W, height: CARD_H,
                      opacity: (stage === 'grid' || stage === 'beating') ? 1 : 0,
                      transition: 'none',
                      willChange: 'auto',
                      contain: 'paint',
                      transform: 'translateZ(0)',
                      pointerEvents: 'none', // capa pasiva
                    }}
                  >
                    <Card
                      w={CARD_W}
                      h={CARD_H}
                      img={getLocalPlayerImageByName(p?.name || '')}
                      beatOn={false}
                      beatSeed={''}
                      bg={rarityBg(p?.type || '')}
                      revealSeed={`grid-pinned-0`}
                      onZoom={() => {}}
                      rarity={(p?.type || '').toLowerCase()}
                      showIntroGlow={false}
                      staticMode
                    />
                  </div>
                );
              })()}
              {five.map((p, i) => {
                const pos = getSlotPosition(i, CARD_W, CARD_H, GAP);
                const visible = i < maxSlotsVisible;
                // Nunca volver a 0 una vez visible (protección ante glitches)
                // Esto asegura que si slotsVisible baja por cualquier razón, no ocultemos cartas ya mostradas
                // Mantenemos un mapa local de visibilidad alcanzada
                return (
                  <div
                    key={`grid-${i}`}
                    style={{ 
                      position: 'absolute', left: pos.x, top: pos.y, width: CARD_W, height: CARD_H,
                      opacity: (i === 0 && (stage === 'grid' || stage === 'beating')) ? 1 : (visible ? 1 : 0),
                      transition: (i === 0 && (stage === 'grid' || stage === 'beating')) ? 'none' : 'opacity 0.4s ease-out',
                      willChange: (i === 0) ? 'auto' : 'opacity',
                      contain: (i === 0) ? 'paint' : undefined,
                      transform: 'translateZ(0)'
                    }}
                  >
                    <Card
                      w={CARD_W}
                      h={CARD_H}
                      img={getLocalPlayerImageByName(p?.name || '')}
                      beatOn={false}
                      beatSeed={''}
                      bg={rarityBg(p?.type || '')}
                      revealSeed={`grid-${i}`}
                      onZoom={(src)=> setZoomSrc(src)}
                      rarity={(p?.type || '').toLowerCase()}
                      showIntroGlow={false}
                      staticMode={i === 0}
                    />
                  </div>
                );
              })}
            </>
          )}

          {/* Confeti adicional al completar todo el equipo */}
          {stage === "beating" && (
            <div
              style={{
                position: "absolute",
                inset: "-200px",
                zIndex: 200,
                pointerEvents: "none",
              }}
            >
              {[...Array(40)].map((_, i) => (
                <motion.div
                  key={`victory-confetti-${i}`}
                  initial={{ 
                    opacity: 0,
                    y: -100,
                    x: 150 + Math.random() * 800,
                    rotate: 0,
                    scale: 0
                  }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    y: 800,
                    rotate: [0, 720 * (Math.random() > 0.5 ? 1 : -1)],
                    scale: [0, 1.5, 1, 0.3]
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    delay: Math.random() * 0.5,
                    ease: "easeOut"
                  }}
                  style={{
                    position: "absolute",
                    width: Math.random() > 0.5 ? "12px" : "8px",
                    height: Math.random() > 0.5 ? "12px" : "8px",
                    background: i % 4 === 0 ? "#FFD700" : i % 4 === 1 ? "#FFA500" : i % 4 === 2 ? "#FFFFFF" : "#FF6B6B",
                    borderRadius: Math.random() > 0.3 ? "50%" : "0%",
                  }}
                />
              ))}
              
              {/* Estrellas doradas adicionales */}
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={`victory-stars-${i}`}
                  initial={{ 
                    opacity: 0,
                    scale: 0,
                    x: Math.random() * 600,
                    y: Math.random() * 400,
                    rotate: 0
                  }}
                  animate={{
                    opacity: [0, 1, 1, 0],
                    scale: [0, 2, 1.5, 0],
                    rotate: [0, 360]
                  }}
                  transition={{
                    duration: 2,
                    delay: Math.random() * 1,
                    ease: "easeOut"
                  }}
                  style={{
                    position: "absolute",
                    fontSize: "20px",
                    color: "#FFD700",
                    textShadow: "0 0 10px #FFD700",
                  }}
                >
                  ⭐
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox / Zoom */}
      <AnimatePresence>
        {zoomSrc && (
          <motion.div
            key="zoom"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
              position: "fixed", inset: 0, background: "rgba(0,0,0,0.65)",
              display: "flex", alignItems: "center", justifyContent: "center",
              zIndex: 999,
            }}
            onClick={() => setZoomSrc(null)}
          >
            <motion.img
              src={zoomSrc}
              referrerPolicy="no-referrer"
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              transition={{ type: "spring", stiffness: 180, damping: 20 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                maxWidth: "90vw",
                maxHeight: "90vh",
                objectFit: "contain",
                borderRadius: 12,
                boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                background: "#000",
                cursor: "zoom-out",
              }}
              alt="zoom"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- SlotReveal: sobre → carta + partículas ---------- */
function SlotReveal({
  index, revealed, cardW, cardH, beatOn, beatSeed, bg, cardImg, packImg, onZoom, rarity
}:{
  index: number;
  revealed: boolean; cardW:number; cardH:number; beatOn:boolean; beatSeed:string;
  bg:string; cardImg:string; packImg:string; onZoom: (src:string)=>void; rarity?: string;
}) {
  return (
    <div style={{ width: cardW, height: cardH, position: "relative" }}>
      <AnimatePresence mode="wait">
        {!revealed ? (
          <PackPlaceholder
            key={`pack-${index}`}
            w={cardW}
            h={cardH}
            img={packImg}
            beatOn={beatOn}
          />
        ) : (
          <div style={{ position: 'relative', width: cardW, height: cardH }}>
            {/* Halo fijo (sin pulso) */}
            <div
              style={{
                position: 'absolute', inset: -8, borderRadius: 18,
                boxShadow: '0 0 24px rgba(255,255,255,0.2), 0 0 48px rgba(255,215,0,0.18)',
                border: '1px solid rgba(255,255,255,0.12)',
                pointerEvents: 'none', zIndex: 0,
              }}
            />
            {/* Trazo que se dibuja lentamente alrededor (stroke draw) */}
            <motion.svg
              width={cardW + 12}
              height={cardH + 12}
              viewBox={`0 0 ${cardW + 12} ${cardH + 12}`}
              style={{ position: 'absolute', left: -6, top: -6, pointerEvents: 'none', zIndex: 4 }}
            >
              <motion.rect
                x={3}
                y={3}
                width={cardW + 6}
                height={cardH + 6}
                rx={14}
                ry={14}
                fill="transparent"
                stroke={
                  (rarity || '').toLowerCase() === 'gold' ? '#D4AF37' : (rarity || '').toLowerCase() === 'silver' ? '#C0C0C0' : (rarity || '').toLowerCase() === 'bronze' ? '#CD7F32' : 'rgba(255,255,255,0.6)'
                }
                strokeWidth={3}
                pathLength={1}
                initial={{ strokeDasharray: 1, strokeDashoffset: 1, opacity: 0.9 }}
                animate={{ strokeDashoffset: 0, opacity: 1 }}
                transition={{ duration: 4.5, ease: 'easeInOut' }}
                style={{ filter: 'drop-shadow(0 0 10px rgba(255,255,255,0.25))' }}
              />
            </motion.svg>
            <Card
              key={`card-${index}`}
              w={cardW}
              h={cardH}
              img={cardImg}
              beatOn={beatOn}
              beatSeed={beatSeed}
              bg={bg}
              revealSeed={`reveal-${index}`}
              onZoom={onZoom}
              rarity={rarity || ''}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ---------- Sobre/pack con brillo leve ---------- */
function PackPlaceholder({ w, h, img, beatOn }:{
  w:number; h:number; img:string; beatOn:boolean;
}) {
  const SAFE_PAD = 8;
  return (
    <motion.div
      initial={{ opacity: 1, scale: 1, rotateY: 0 }}
      animate={{ opacity: 1, scale: beatOn ? 1.02 : 1, rotateY: 0 }}
      exit={{ opacity: 0, scale: 0.9, rotateY: 90 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      style={{
        width: w, height: h, position: "relative",
        borderRadius: 12, overflow: "hidden",
        boxShadow: "0 10px 28px rgba(0,0,0,0.45)",
        background: "#a07a10",
      }}
    >
      {/* fondo borroso */}
      {img && (
        <div style={{ position: 'absolute', inset: 0 }}>
          <Image
            src={img}
            alt="pack-bg"
            fill
            style={{ objectFit: 'cover', filter: 'blur(10px) brightness(0.95) saturate(1.05)', transform: 'scale(1.06)', opacity: 0.45, pointerEvents: 'none' }}
            sizes="100vw"
            onError={() => { /* noop */ }}
            priority
            unoptimized
          />
        </div>
      )}
      {/* pack nítido sin recorte */}
      {img && (
        <div style={{ position: 'absolute', left: SAFE_PAD, right: SAFE_PAD, top: SAFE_PAD, bottom: SAFE_PAD }}>
          <Image
            src={img}
            alt="pack"
            fill
            style={{ objectFit: 'contain' }}
            sizes="(max-width: 768px) 80vw, 600px"
            onError={() => { /* noop */ }}
            priority
            unoptimized
          />
        </div>
      )}
      {/* brillo al beat */}
      <motion.div
        animate={beatOn
          ? { boxShadow: ["0 0 10px rgba(255,215,0,0.25)", "0 0 22px rgba(255,215,0,0.55)", "0 0 10px rgba(255,215,0,0.25)"] }
          : { boxShadow: ["0 0 8px rgba(255,255,255,0.12)", "0 0 8px rgba(255,255,255,0.12)"] }}
        transition={{ duration: beatOn ? 0.18 : 1, repeat: Infinity }}
        style={{ position: "absolute", inset: 0, borderRadius: 12, pointerEvents: "none" }}
      />
    </motion.div>
  );
}

/* ---------- Vuelo desde centro hacia slot y revelado ---------- */
function CardFlightSlot({ x, y, cardW, cardH, gap, landed, packImg, cardImg, bg, beatOn, beatSeed, onZoom, rarity }:{
  x:number; y:number; cardW:number; cardH:number; gap:number; landed:boolean; packImg?:string; cardImg?:string; bg:string; beatOn:boolean; beatSeed:string; onZoom:(src:string)=>void; rarity?: string;
}) {
  const CENTER_W = cardW + 80;
  const CENTER_H = cardH + 80;
  const [phase, setPhase] = React.useState<'full' | 'fly'>('full');
  React.useEffect(() => {
    if (!landed) {
      const t = window.setTimeout(() => setPhase('fly'), 2000); // 2s exactos en pantalla completa
      return () => window.clearTimeout(t);
    }
  }, [landed]);

  return (
    <div style={{ position: 'absolute', left: x, top: y, width: cardW, height: cardH }}>
      <AnimatePresence initial={false}>
        {!landed ? (
          <>
            {/* Pantalla completa fija 2s, sin efectos */}
            {phase === 'full' && (
              <motion.div
                key={`zoom-full-${x}-${y}`}
                initial={{ opacity: 1, rotate: 0 }}
                animate={{ opacity: 1, rotate: 0 }}
                exit={{ opacity: 0, rotate: 15 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                style={{
                  position: 'fixed', inset: 0, zIndex: 50,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  pointerEvents: 'none'
                }}
              >
                <div style={{ position: 'relative', width: cardW*2.6, height: cardH*2.6 }}>
                  <Image src={cardImg || ''} alt="zoom-card" fill style={{ objectFit: 'contain' }} unoptimized />
                </div>
              </motion.div>
            )}

            {/* Sin transición al slot: se revelará directamente más tarde */}
            {phase === 'fly' && null}
          </>
        ) : (
          <div style={{ position: 'absolute', inset: 0 }}>
            <Card
              w={cardW}
              h={cardH}
              img={cardImg || ''}
              beatOn={beatOn}
              beatSeed={beatSeed}
              bg={bg}
              revealSeed={`landed-${x}-${y}`}
              onZoom={onZoom}
              rarity={rarity}
            />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

function getSlotPosition(i:number, CARD_W:number, CARD_H:number, GAP:number) {
  // 0..1 en la primera fila, 2..4 en la segunda fila
  const firstRow = [0,1];
  const isFirst = i <= 1;
  const idx = i;
  const containerW = 3 * CARD_W + 2 * GAP + 160;
  const containerH = 2 * CARD_H + GAP + 160;
  const centerX = containerW/2 - (CARD_W/2);
  const Y_SHIFT = 24; // bajar un poco ambas filas (ajuste fino)
  const topY = containerH/2 - CARD_H - GAP/2 + Y_SHIFT;
  const bottomY = containerH/2 + GAP/2 + Y_SHIFT;

  if (isFirst) {
    const x = centerX - (CARD_W/2 + GAP/2) + idx * (CARD_W + GAP);
    return { x, y: topY };
  }

  const j = idx - 2;
  const x = centerX - (CARD_W + GAP) + j * (CARD_W + GAP);
  return { x, y: bottomY };
}

/* ---------- Carta (sin textos) + partículas y ZOOM ---------- */
function Card({
  w, h, img, beatOn, beatSeed, bg, revealSeed, onZoom, rarity, showIntroGlow = true, staticMode = false
}:{
  w:number; h:number; img:string; beatOn:boolean; beatSeed:string; bg:string; revealSeed: string;
  onZoom: (src:string)=>void; rarity?: string; showIntroGlow?: boolean; staticMode?: boolean;
}) {
  console.log(`[Card Component] Renderizando carta con img src: '${img}'`);
  const [fallbackPng, setFallbackPng] = useState(false);
  const SAFE_PAD = 8;
  const displaySrc = useMemo(() => {
    if (!img) return img;
    if (fallbackPng) return img.replace(/\.webp$/i, '.png');
    return img;
  }, [img, fallbackPng]);

  if (staticMode) {
    return (
      <div
        style={{
          width: w, height: h, position: "relative",
          transform: "translateZ(0)", backfaceVisibility: "hidden",
          borderRadius: 12, overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
          backgroundImage: bg,
          border: "1px solid rgba(255,255,255,0.1)",
          cursor: img ? "zoom-in" : "default",
        }}
        onClick={() => img && onZoom(img)}
      >
        {img && (
          <img
            src={displaySrc}
            alt="player"
            referrerPolicy="no-referrer"
            style={{
              position:"absolute",
              left: SAFE_PAD, right: SAFE_PAD, top: SAFE_PAD, bottom: SAFE_PAD,
              width: `calc(100% - ${SAFE_PAD*2}px)`,
              height: `calc(100% - ${SAFE_PAD*2}px)`,
              objectFit:"contain",
              opacity: 0.98,
              display: "block",
            }}
            onError={(e)=>{ 
              console.warn('Error cargando imagen:', displaySrc);
              if (!fallbackPng && /\.webp$/i.test(displaySrc)) {
                setFallbackPng(true);
              } else {
                (e.currentTarget as HTMLImageElement).style.display="none"; 
              }
            }}
          />
        )}
      </div>
    );
  }

  return (
    <motion.div
      initial={{ y: 36, opacity: 0, scale: 0.94 }}
      animate={{
        y: 0,
        opacity: 1,
        scale: [1.0, 1.06, 1.0],
      }}
      exit={{ opacity: 0 }}
      transition={{
        duration: 0.9,
        ease: "easeOut",
        times: [0, 0.55, 1],
      }}
      style={{
        width: w, height: h, position: "relative",
        transform: "translateZ(0)", backfaceVisibility: "hidden",
        borderRadius: 12, overflow: "hidden",
        boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
        backgroundImage: bg,
        border: "1px solid rgba(255,255,255,0.1)",
        cursor: img ? "zoom-in" : "default",
      }}
      onClick={() => img && onZoom(img)}
    >
      {/* Brillo diagonal metálico (más intenso) */}
      <div
        aria-hidden
        style={{
          position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1,
          background: `linear-gradient(30deg, rgba(255,255,255,0.00) 0%, rgba(255,255,255,0.14) 40%, ${rarity === 'gold' ? 'rgba(255,240,200,0.32)' : rarity === 'silver' ? 'rgba(240,244,255,0.30)' : rarity === 'bronze' ? 'rgba(255,220,200,0.28)' : 'rgba(255,255,255,0.28)'} 50%, rgba(255,255,255,0.14) 60%, rgba(255,255,255,0.00) 100%)`,
          mixBlendMode: 'screen',
        }}
      />
      {/* Resplandor especular en diagonal que recorre la carta lentamente */}
      <motion.div
        aria-hidden
        initial={{ x: '-120%', opacity: 0.0 }}
        animate={{ x: '140%', opacity: [0.0, 0.65, 0.0] }}
        transition={{ duration: 3.2, repeat: Infinity, repeatDelay: 1.1, ease: 'easeInOut' }}
        style={{
          position: 'absolute', top: '-22%', bottom: '-22%', width: '38%',
          background: `linear-gradient(30deg, rgba(255,255,255,0.0), ${rarity === 'gold' ? 'rgba(255,240,200,0.86)' : rarity === 'silver' ? 'rgba(245,248,255,0.86)' : rarity === 'bronze' ? 'rgba(255,225,205,0.84)' : 'rgba(255,255,255,0.84)'}, rgba(255,255,255,0.0))`,
          filter: 'blur(7px)', transform: 'skewX(-12deg)',
          zIndex: 2, pointerEvents: 'none',
          boxShadow: '0 0 18px rgba(255,255,255,0.28)'
        }}
      />
      {/* Sin anillo adicional */}
      {/* 1) fondo borroso de relleno */}
      {img && (
        <img
          src={displaySrc}
          alt="bg-fill"
          referrerPolicy="no-referrer"
          style={{
            position:"absolute", inset:0, width:"100%", height:"100%",
            objectFit:"cover",
            filter:"blur(12px) brightness(0.9) saturate(1.05)",
            transform:"scale(1.08)",
            opacity:0.40,
            pointerEvents:"none",
          }}
          onError={(e)=>{ 
            if (!fallbackPng && /\.webp$/i.test(displaySrc)) {
              setFallbackPng(true);
            } else {
              (e.currentTarget as HTMLImageElement).style.display="none";
            }
          }}
        />
      )}

      {/* 2) imagen principal SIN recorte */}
      {img && (
        <img
          src={displaySrc}
          alt="player"
          referrerPolicy="no-referrer"
          loading="eager"
          decoding="async"
          style={{
            position:"absolute",
            left: SAFE_PAD, right: SAFE_PAD, top: SAFE_PAD, bottom: SAFE_PAD,
            width: `calc(100% - ${SAFE_PAD*2}px)`,
            height: `calc(100% - ${SAFE_PAD*2}px)`,
            objectFit:"contain",
            opacity: 0.98,
            display: "block",
          }}
          onLoad={(e) => {
            (e.currentTarget as HTMLImageElement).style.opacity = "0.98";
          }}
          onError={(e)=>{ 
            // Evitar ocultar por completo; dejamos estático aunque no cargue
            console.warn('Error cargando imagen:', displaySrc);
            if (!fallbackPng && /\.webp$/i.test(displaySrc)) {
              setFallbackPng(true);
            }
          }}
        />
      )}

      {/* destello intenso al entrar */}
      {showIntroGlow && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 1, 0.8, 0], scale: [0, 3, 1.5, 0] }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          style={{ position:"absolute", inset:0, background:"rgba(255,255,255,0.7)", pointerEvents:"none" }}
        />
      )}
      
      {/* destello dorado adicional */}
      {showIntroGlow && (
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: [0, 0.8, 0], scale: [0, 2.5, 0] }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          style={{ position:"absolute", inset:0, background:"rgba(255,215,0,0.4)", pointerEvents:"none", borderRadius: 12 }}
        />
      )}

      {/* partículas de burst al reveal */}
      <BurstParticles w={w} h={h} seed={revealSeed} />

      {/* partículas en cada beat */}
      {beatOn && <BeatParticles w={w} h={h} seed={beatSeed} />}

      {/* brillo intenso al beat */}
      <motion.div
        key={`glow-${beatSeed}`}
        animate={beatOn
          ? { 
              boxShadow: [
                "0 0 20px rgba(255,255,255,0.4), 0 0 40px rgba(255,215,0,0.3)",
                "0 0 50px rgba(255,255,255,0.8), 0 0 80px rgba(255,215,0,0.6)",
                "0 0 20px rgba(255,255,255,0.4), 0 0 40px rgba(255,215,0,0.3)"
              ],
              filter: ["brightness(1)", "brightness(1.3)", "brightness(1)"]
            }
          : { 
              boxShadow: [
                "0 0 15px rgba(255,255,255,0.2), 0 0 25px rgba(255,215,0,0.15)",
                "0 0 25px rgba(255,255,255,0.35), 0 0 40px rgba(255,215,0,0.25)",
                "0 0 15px rgba(255,255,255,0.2), 0 0 25px rgba(255,215,0,0.15)"
              ]
            }}
        transition={{ duration: beatOn ? 0.16 : 1, repeat: Infinity }}
        style={{ position:"absolute", inset:0, borderRadius:12, pointerEvents:"none" }}
      />
    </motion.div>
  );
}

/* ---------- Partículas ---------- */

// Explosión en el reveal (1 vez al montar)
function BurstParticles({ w, h, seed }:{ w:number; h:number; seed:string }) {
  const parts = useMemo(() => {
    const rand = makeRand(seed);
    const count = 20 + Math.floor(rand()*10); // 20–29 partículas (más del doble)
    const arr = [];
    for (let i = 0; i < count; i++) {
      const ang = rand() * Math.PI * 2;
      const dist = (w * 0.5) * (0.3 + rand()); // Mayor distancia
      const x1 = Math.cos(ang) * dist;
      const y1 = Math.sin(ang) * dist;
      const d = 0.8 + rand()*0.6; // 0.8–1.4s (más duración)
      const size = 4 + Math.floor(rand()*6); // 4–9px (más grandes)
      arr.push({ x1, y1, d, size, id: `bp-${i}` });
    }
    return arr;
  }, [w, seed]);

  const cx = w/2, cy = h/2;

  return (
    <>
      {parts.map(p => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, scale: 0, x: cx, y: cy }}
          animate={{ opacity: 0, scale: 1, x: cx + p.x1, y: cy + p.y1 }}
          transition={{ duration: p.d, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: p.size, height: p.size,
            borderRadius: "9999px",
            background: "rgba(255,215,0,1)",
            pointerEvents: "none",
            zIndex: 12,
            boxShadow: "0 0 15px rgba(255,215,0,1), 0 0 25px rgba(255,255,255,0.8)",
            filter: "brightness(1.2)",
          }}
        />
      ))}
    </>
  );
}

// Chispas breves por beat
function BeatParticles({ w, h, seed }:{ w:number; h:number; seed:string }) {
  const parts = useMemo(() => {
    const rand = makeRand(`beat-${seed}`);
    const count = 8; // Más partículas por beat
    const arr = [];
    for (let i = 0; i < count; i++) {
      const x0 = (w*0.2) + rand()*w*0.6;
      const y0 = (h*0.2) + rand()*h*0.6;
      const x1 = x0 + (rand()-0.5)*w*0.5;
      const y1 = y0 + (rand()-0.5)*h*0.5;
      const d = 0.5 + rand()*0.4; // 0.5–0.9s (más duración)
      const size = 3 + Math.floor(rand()*5); // 3–7px (más grandes)
      arr.push({ x0, y0, x1, y1, d, size, id:`sp-${i}` });
    }
    return arr;
  }, [w, h, seed]);

  return (
    <>
      {parts.map(p => (
        <motion.div
          key={p.id}
          initial={{ opacity: 1, scale: 0, x: p.x0, y: p.y0 }}
          animate={{ opacity: 0, scale: 1, x: p.x1, y: p.y1 }}
          transition={{ duration: p.d, ease: "easeOut" }}
          style={{
            position: "absolute",
            width: p.size, height: p.size,
            borderRadius: "9999px",
            background: "rgba(255,255,255,1)",
            pointerEvents: "none",
            zIndex: 12,
            boxShadow: "0 0 12px rgba(255,255,255,1), 0 0 20px rgba(255,215,0,0.8)",
            filter: "brightness(1.5)",
          }}
        />
      ))}
    </>
  );
}

export default PackOpeningAnimation;

/* ---------- FrameSequence: cambia entre base/_02/_03 según step ---------- */
function FrameSequence({ baseSrc, step }:{ baseSrc:string; step:number }) {
  // Derivar sufijos según base (bronze/silver/gold)
  const derive = (s:string, suffix:string) => {
    // Inserta _02/_03 antes de la extensión
    const idx = s.lastIndexOf('.');
    if (idx === -1) return s + suffix;
    return s.slice(0, idx) + suffix + s.slice(idx);
  };
  const src = step === 0 ? baseSrc : step === 1 ? derive(baseSrc, '_02') : derive(baseSrc, '_03');
  return (
    <Image src={src} alt="pack-frame" fill style={{ objectFit: 'contain' }} unoptimized />
  );
}

function FrameSequenceCrossFade({ baseSrc, step }:{ baseSrc:string; step:number }) {
  const derive = (s:string, suffix:string) => {
    const idx = s.lastIndexOf('.');
    if (idx === -1) return s + suffix;
    return s.slice(0, idx) + suffix + s.slice(idx);
  };
  const src0 = baseSrc;
  const src1 = derive(baseSrc, '_02');
  const src2 = derive(baseSrc, '_03');

  return (
    <>
      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: step === 0 ? 1 : 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Image src={src0} alt="frame-0" fill style={{ objectFit: 'contain' }} unoptimized priority />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: step === 1 ? 1 : 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Image src={src1} alt="frame-1" fill style={{ objectFit: 'contain' }} unoptimized priority />
      </motion.div>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: step === 2 ? 1 : 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
        style={{ position: 'absolute', inset: 0 }}
      >
        <Image src={src2} alt="frame-2" fill style={{ objectFit: 'contain' }} unoptimized priority />
      </motion.div>
    </>
  );
}