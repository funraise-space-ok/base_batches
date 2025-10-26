"use client";

import { Stack, styled } from "@mui/material";
import { Card } from "../Card";
import { useEffect, useState } from "react";
import useSound from "use-sound";
import type { CardType, Card as ICard } from "types/card";

const AnimatedOnHover = styled("div")<{ revealEnded: boolean }>`
  /* position: relative; */
  /* z-index: 1; */
  ${({ revealEnded }) =>
    revealEnded
      ? `
    transform: perspective(400px) rotateY(0deg);
    transition: all 0.5s ease-out;

    &:hover {
      transform: perspective(400px) rotateY(10deg) scale(1.7) translateX(-50px);
      z-index: 999;
    }
  `
      : ""}
`;

const AnimatedBackground = styled("div")`
  position: absolute;
  width: 80%;
  height: 80%;
  background-color: #fff;
  filter: blur(200px);
  animation: blink 5s ease-in-out infinite;

  @keyframes blink {
    0%,
    100% {
      opacity: 0;
    }
    50% {
      opacity: 100;
    }
  }
`;

const AnimateOnMount = styled("div")<{ revealed: boolean; type: CardType }>`
  ${({ revealed }) => (revealed ? "animation: reveal 3s ease-in-out;" : "")}
  ${({ revealed }) =>
    revealed
      ? "transform: rotateY(0deg) scale(1);"
      : "transform: rotateY(90deg) scale(1);"}

  @keyframes reveal {
    0% {
      transform: rotateY(90deg) scale(1);
    }
    50% {
      transform: rotateY(0deg) scale(2);
      /* ${({ type }) =>
        type === "gold"
          ? "box-shadow: 0 40px 60px rgba(255, 255, 255, 1);"
          : ""} */
    }
    90% {
      /* ${({ type }) =>
        type === "gold"
          ? "box-shadow: 0 40px 60px rgba(255, 255, 255, 0);"
          : ""} */
    }
    100% {
      transform: scale(1);
    }
  }
`;

const cards: ICard[] = [
  {
    type: "bronze",
    country: "argentina",
    name: "José Fernández",
    image: "jose_fernandez.png",
    source: "slicetoken.io",
    sport: "tennis",
  },
  {
    type: "bronze",
    country: "argentina",
    name: "Fabrizio Mazzocchetti",
    source: "slicetoken.io",
    sport: "tennis",
    image: "fabrizio_mazzocchetti.png",
  },
  {
    type: "bronze",
    country: "argentina",
    name: "Jaime López Rivarola",
    source: "slicetoken.io",
    sport: "golf",
    image: "jaime_lopez_rivarola.png",
  },
  {
    type: "silver",
    country: "peru",
    name: "Juan Pablo Varillas",
    source: "slicetoken.io",
    sport: "tennis",
    image: "juan_pablo_varillas.png",
  },
  {
    type: "gold",
    country: "argentina",
    name: "Tomás Martín Etcheverry",
    source: "slicetoken.io",
    sport: "tennis",
    image: "tomas_martin_etcheverry.png",
  },
] as const;

export function CardList() {
  const [revealed, setReleavealed] = useState<boolean[]>([]);
  const [revealEnded, setRevealEnded] = useState(false);
  const [playHoverEffect] = useSound("/audio/hover-card.mp3");
  const [playGoldEffect] = useSound("/audio/gold-card.mp3");
  const [playSilverEffect] = useSound("/audio/silver-card.mp3");
  const [playBronzeEffect] = useSound("/audio/bronze-card.mp3");

  useEffect(() => {
    const goldIndex = cards.findIndex((c) => c.type === "gold");
    const silverIndex = cards.findIndex((c) => c.type === "silver");
    const currentIndex = revealed.length - 1;

    switch (currentIndex) {
      case goldIndex:
        {
          playGoldEffect();
        }
        break;
      case silverIndex:
        {
          playSilverEffect();
        }
        break;
      default: {
        playBronzeEffect();
      }
    }

    if (revealed.length === cards.length) {
      setRevealEnded(true);
      return;
    }

    setTimeout(() => {
      setReleavealed([...revealed, true]);
    }, 3000);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revealed]);

  console.log(revealed);

  return (
    <Stack
      className="card-list"
      direction="row"
      gap={2}
      justifyContent="center"
      sx={{ transform: "scale(1.5)" }}
    >
      <AnimatedBackground />
      {cards.map((card, index) => (
        <AnimateOnMount
          key={card.name}
          revealed={!!revealed[index]}
          type={card.type}
        >
          <AnimatedOnHover
            className="card-list-item"
            revealEnded={revealEnded}
            onMouseEnter={() => playHoverEffect()}
          >
            <Card {...card} />
          </AnimatedOnHover>
        </AnimateOnMount>
      ))}
      {/* <AnimateOnMount revealed={revealed[1]} type="bronze">
        <AnimatedOnHover className="card-list-item" revealEnded={revealEnded} onMouseEnter={() => playHoverEffect()}><Card type="bronze" /></AnimatedOnHover>
      </AnimateOnMount>
      <AnimateOnMount revealed={revealed[2]} type="bronze">
        <AnimatedOnHover className="card-list-item" revealEnded={revealEnded} onMouseEnter={() => playHoverEffect()}><Card type="bronze" /></AnimatedOnHover>
      </AnimateOnMount>
      <AnimateOnMount revealed={revealed[3]} type="bronze">
        <AnimatedOnHover className="card-list-item" revealEnded={revealEnded} onMouseEnter={() => playHoverEffect()}><Card type="bronze" /></AnimatedOnHover>
      </AnimateOnMount>
      <AnimateOnMount revealed={revealed[4]} type="gold">
        <AnimatedOnHover className="card-list-item" revealEnded={revealEnded} onMouseEnter={() => playHoverEffect()}><Card type="gold" /></AnimatedOnHover>
      </AnimateOnMount> */}
    </Stack>
  );
}
