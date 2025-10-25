"use client";

import {
  Dialog,
  DialogContent,
  Grid2,
  Stack,
  styled,
  SxProps,
} from "@mui/material";
import { ReactNode, useState, useMemo } from "react";
import Image from "next/image";
import { getLocalPlayerImageByName } from "../../lib/utils";
import { type Card } from "types/card";

interface Props extends Card {
  sx?: SxProps;
  expandable?: true;
  details?: ReactNode;
  onClick?: () => void;
}

const CardShine = styled("div")<Pick<Props, "type">>`
  width: 1000px;
  height: 100px;
  margin-left: -100px;
  transform: rotate(30deg);
  ${({ type }) => {
    switch (type) {
      case "gold":
        return `background: -webkit-linear-gradient(top, transparent, rgba(212,175,55,0.4),transparent);`;
      case "silver":
        return `background: -webkit-linear-gradient(top, transparent, rgba(201,206,208,0.4),transparent);`;
      default:
        return "";
      // case 'bronze':
      // default: return `background: -webkit-linear-gradient(top, transparent, rgba(200,200,200,0.4),transparent);`;
    }
  }}
  position: absolute;
  animation: shine 5s ease-in-out infinite;

  @keyframes shine {
    0%,
    100% {
      margin-top: -100px;
    }
    50% {
      margin-top: 800px;
    }
  }
`;

const CardStyled = styled("div")<Pick<Props, "type">>`
  position: relative;
  border-radius: 16px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);
  width: 200px;
  height: 320px;
  transition: all 0.5s ease-out;
  overflow: hidden;
  user-select: none;

  ${({ type }) =>
    type === "gold" &&
    `
    background: url('/gold_bg.webp');
    background-size: cover;
    // background: radial-gradient(ellipse farthest-corner at right bottom, #FEDB37 0%, #FDB931 8%, #9f7928 30%, #8A6E2F 40%, transparent 80%),
    //             radial-gradient(ellipse farthest-corner at left top, #FFFFFF 0%, #FFFFAC 8%, #D1B464 25%, #5d4a1f 62.5%, #5d4a1f 100%);
  `}

  ${({ type }) =>
    type === "silver" &&
    `
    background: radial-gradient(ellipse farthest-corner at right bottom, #C0C0C0 0%, #A9A9A9 8%, #808080 30%, #696969 40%, transparent 80%),
                radial-gradient(ellipse farthest-corner at left top, #FFFFFF 0%, #F2F2F2 8%, #D3D3D3 25%, #696969 62.5%, #696969 100%);
  `}

  ${({ type }) =>
    type === "bronze" &&
    `
    background: radial-gradient(ellipse farthest-corner at right bottom, #422100 0%, #422100 8%, #8B4513 30%, #7A3B0C 40%, transparent 80%),
                radial-gradient(ellipse farthest-corner at left top, #FFFFFF 0%, #422100 8%, #422100 25%, #8B4513 62.5%, #8B4513 100%);
  `} // .shine {
  //   display: none;
  // }

  // &:hover {
  //   .shine {
  //     display: block;
  //   }
  // }
`;

const CardImage = styled("div")`
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  width: 100%;
  height: 100%;
  background-position-y: 0px;
  position: absolute;
  overflow: hidden;
  &.card-frame {
    z-index: 2;
  }
`;

const CardName = styled("div")`
  cursor: default;
  user-select: none;
  font-size: 16px;
  font-weight: 600;
  color: #000000;
  text-align: center;
  font-family: "Josefin Sans", serif;
  width: 100%;
  position: absolute;
  padding-bottom: 5px;
  padding-left: 2px;
  padding-right: 2px;
  left: 0;
  bottom: 30px;
  text-shadow:
    0 2px 6px #fff,
    0 0px 2px #0008;
  z-index: 3;

  small {
    display: block;
    font-weight: 300;
    color: #888;
  }
`;

const CardFlag = styled("div")<{ url: string }>`
  position: absolute;
  bottom: 23%;
  left: 20px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  width: 30px;
  height: 30px;
  ${({ url }) => `background-image: url('${url}');`}
  border-radius: 100%;
  overflow: hidden;
`;

const CardStar = styled("div")<{ url: string }>`
  position: absolute;
  bottom: 23%;
  right: 20px;
  background-repeat: no-repeat;
  background-size: cover;
  width: 30px;
  height: 30px;
  ${({ url }) => `background-image: url('${url}');`}
`;

const CardFoil = styled("div")`
  pointer-events: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
  opacity: 0.32;
  mix-blend-mode: overlay;
  background:
    url('data:image/svg+xml;utf8,<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><polygon points="8,0 16,8 8,16 0,8" fill="%23333" fill-opacity="0.25"/></svg>')
      repeat,
    linear-gradient(
      120deg,
      #fff0 0%,
      #fff 10%,
      #ffe06688 18%,
      #f783ac55 32%,
      #5f5fc455 50%,
      #63e6be55 70%,
      #ffe06688 85%,
      #fff0 100%
    );
  background-size:
    16px 16px,
    300% 300%;
  background-blend-mode: overlay, screen;
  animation: foil-shimmer 10s ease-in-out infinite;
  position: absolute;
  overflow: hidden;

  @keyframes foil-shimmer {
    0% {
      background-position:
        0% 0%,
        0% 0%;
    }
    50% {
      background-position:
        20% 20%,
        20% 20%;
    }
    100% {
      background-position:
        0% 0%,
        0% 0%;
    }
  }
`;

// Sparkle shapes for each card type
const goldSparkleShapes = [
  // 6-point gold star
  <svg key="gold-star-1" viewBox="0 0 20 20" fill="none">
    <path
      d="M10 2 L12 8 L18 8 L13 12 L15 18 L10 14 L5 18 L7 12 L2 8 L8 8 Z"
      fill="#fffbe6"
      stroke="#ffd700"
      strokeWidth="2"
    />
  </svg>,
  // 4-point gold star
  <svg key="gold-star-2" viewBox="0 0 20 20" fill="none">
    <path
      d="M10 2 L13 10 L18 10 L13 13 L10 18 L7 13 L2 10 L7 10 Z"
      fill="#fffbe6"
      stroke="#ffb300"
      strokeWidth="2"
    />
  </svg>,
  // Gold diamond
  <svg key="gold-star-3" viewBox="0 0 20 20" fill="none">
    <polygon
      points="10,3 17,10 10,17 3,10"
      fill="#fffbe6"
      stroke="#ffd700"
      strokeWidth="2"
    />
  </svg>,
];

const silverSparkleShapes = [
  // Silver cross
  <svg key="silver-cross" viewBox="0 0 20 20" fill="none">
    <g stroke="#bfc9ca" strokeWidth="2">
      <line x1="10" y1="4" x2="10" y2="16" />
      <line x1="4" y1="10" x2="16" y2="10" />
    </g>
  </svg>,
  // Blue dot
  <svg key="silver-dot" viewBox="0 0 20 20" fill="none">
    <circle
      cx="10"
      cy="10"
      r="3"
      fill="#e3f2fd"
      stroke="#90caf9"
      strokeWidth="2"
    />
  </svg>,
  // Silver diamond
  <svg key="silver-diamond" viewBox="0 0 20 20" fill="none">
    <polygon
      points="10,4 16,10 10,16 4,10"
      fill="#f8fafd"
      stroke="#bfc9ca"
      strokeWidth="2"
    />
  </svg>,
];

const bronzeSparkleShapes = [
  // Copper dot
  <svg key="bronze-dot" viewBox="0 0 20 20" fill="none">
    <circle
      cx="10"
      cy="10"
      r="3"
      fill="#e07a3f"
      stroke="#a0522d"
      strokeWidth="2"
    />
  </svg>,
  // Bronze diamond
  <svg key="bronze-diamond" viewBox="0 0 20 20" fill="none">
    <polygon
      points="10,4 16,10 10,16 4,10"
      fill="#f4b183"
      stroke="#a0522d"
      strokeWidth="2"
    />
  </svg>,
  // Teardrop shape
  <svg key="bronze-teardrop" viewBox="0 0 20 20" fill="none">
    <path
      d="M10 4 Q13 10 10 16 Q7 10 10 4 Z"
      fill="#e07a3f"
      stroke="#a0522d"
      strokeWidth="2"
    />
  </svg>,
  // Hex shape
  <svg key="bronze-hex" viewBox="0 0 20 20" fill="none">
    <polygon
      points="10,4 16,7 16,13 10,16 4,13 4,7"
      fill="#f4b183"
      stroke="#a0522d"
      strokeWidth="2"
    />
  </svg>,
];

const CardWithImageFallback = ({ image, children, hiRes = false }: { image: string, children: ReactNode, hiRes?: boolean }) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [preferPng, setPreferPng] = useState(false);

  const imageUrl = useMemo(() => {
    if (imageError && retryCount >= 2) {
      return getLocalPlayerImageByName('');
    }
    const pngUrl = getLocalPlayerImageByName(image);
    if (preferPng) return pngUrl;
    // Intentar WebP primero, luego caer a PNG si falla
    return pngUrl.replace(/\.png$/i, '.webp');
  }, [image, imageError, retryCount, preferPng]);

  const handleImageError = () => {
    // Si falló WebP, probar PNG una vez
    if (!preferPng) {
      setPreferPng(true);
      return;
    }
    if (retryCount < 2) {
      setTimeout(() => {
        setRetryCount(prev => prev + 1);
      }, 1000 * (retryCount + 1));
    } else {
      setImageError(true);
    }
  };

  return (
    <>
      <CardImage 
        sx={{ 
          position: 'relative',
          backgroundColor: imageError ? '#8B4513' : 'transparent',
          opacity: imageLoaded || imageError ? 1 : 0.7,
          overflow: 'hidden'
        }}
      >
        {!imageError && (
          <Image
            key={`${imageUrl}-${retryCount}`}
            src={imageUrl}
            alt=""
            fill
            sizes={hiRes ? "(max-width: 1200px) 600px, 720px" : "200px"}
            style={{ objectFit: hiRes ? 'contain' : 'cover' }}
            onLoad={() => setImageLoaded(true)}
            onError={handleImageError}
            priority={hiRes}
            unoptimized={false}
          />)
        }
        {children}
      </CardImage>
    </>
  );
};

function Sparkle({
  shapeIdx,
  size,
  left,
  top,
  delay,
  shapes,
}: {
  shapeIdx: number;
  size: number;
  left: number;
  top: number;
  delay: number;
  shapes: React.ReactNode[];
}) {
  return (
    <div
      style={{
        position: "absolute",
        left: `${left}%`,
        top: `${top}%`,
        width: size,
        height: size,
        opacity: 0.8,
        animation: `sparkle-twinkle 3.5s ease-in-out infinite`,
        animationDelay: `${delay}s`,
        pointerEvents: "none",
        zIndex: 3,
      }}
    >
      {shapes[shapeIdx]}
    </div>
  );
}

const CardSparkles = styled("div")`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;

  @keyframes sparkle-twinkle {
    0%,
    100% {
      opacity: 0.7;
      filter: brightness(1);
    }
    20% {
      opacity: 1;
      filter: brightness(1.5);
    }
    50% {
      opacity: 0.5;
      filter: brightness(0.7);
    }
    80% {
      opacity: 1;
      filter: brightness(1.5);
    }
  }
`;

export function Card({
  type,
  sx,
  country,
  name,
  image,
  expandable,
  details,
}: Props) {
  const [isExpanded, setIsExpanded] = useState(false);
  const sparklePattern: {
    left: number;
    top: number;
    size: number;
    shapeIdx: number;
    delay: number;
  }[] = [];
  const rings = 0; // sparkles desactivados
  const sparklesPerRing = 0;
  const minRadius = 28; // percent from center
  const maxRadius = 44; // percent from center
  const centerX = 50;
  const centerY = 28;
  let sparkleShapes = goldSparkleShapes;
  if (type === "silver") sparkleShapes = silverSparkleShapes;
  else if (type === "bronze") sparkleShapes = bronzeSparkleShapes;
  for (let r = 0; r < rings; r++) {
    const radius = minRadius + ((maxRadius - minRadius) * r) / (rings - 1);
    for (let i = 0; i < sparklesPerRing; i++) {
      const angle =
        (2 * Math.PI * i) / sparklesPerRing +
        (r % 2 ? Math.PI / sparklesPerRing : 0); // staggered
      const left = centerX + radius * Math.cos(angle);
      const top = centerY + radius * Math.sin(angle);
      const size = 3 + ((i + r) % 5); // 3-7px
      const shapeIdx = (i + r) % sparkleShapes.length;
      const delay = (i * 0.13 + r * 0.7) % 3.5;
      sparklePattern.push({ left, top, size, shapeIdx, delay });
    }
  }
  const cardContents = (
    <CardWithImageFallback image={image}>
      {/* Frame desactivado para evitar doble imagen/overlay */}
      {/* Datos visuales extra removidos para vista compacta al click */}
      <CardShine className="shine" type={type} />
      <CardFoil />
    </CardWithImageFallback>
  );

  return (
    <>
      {expandable && (
        <Dialog
          open={isExpanded}
          maxWidth="lg"
          onClose={() => setIsExpanded(false)}
          PaperProps={{
            sx: {
              backgroundColor: "transparent",
              boxShadow: "none",
              background: "none",
              border: "none !important",
            },
          }}
        >
          <DialogContent sx={{ backgroundColor: "transparent", padding: 0, border: "none" }}>
            <CardStyled type={type} sx={{ width: 420, height: 672 }}>
              {/* Solo imagen dentro del modal */}
              <CardWithImageFallback image={image} hiRes>
                <CardFoil />
              </CardWithImageFallback>
            </CardStyled>
          </DialogContent>
        </Dialog>
      )}
      <CardStyled
        type={type}
        sx={{ ...sx, cursor: expandable ? "pointer" : "default" }}
        onClick={() => {
          try {
            // Log del nombre del jugador al abrir la vista ampliada
            console.log(`[CARD] Player name: ${name}`);
          } catch {}
          setIsExpanded(true);
        }}
      >
        {cardContents}
      </CardStyled>
    </>
  );
}
