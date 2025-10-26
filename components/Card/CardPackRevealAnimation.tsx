import { Box } from "@mui/material";
import { motion } from "framer-motion";
import { Card } from "./Card";
import type { Card as ICard } from "types/card";
import React, { useEffect, useState } from "react";
import { useIsMobile } from "../../lib/hooks/useIsMobile";

interface CardPackRevealAnimationProps {
  cards: ICard[];
  revealedIndex: number;
  showRowLayout: boolean;
  onRevealEnd?: () => void;
}

export const CardPackRevealAnimation: React.FC<
  CardPackRevealAnimationProps
> = ({ cards, revealedIndex, showRowLayout, onRevealEnd }) => {
  const [frontCardIdx, setFrontCardIdx] = React.useState<number | null>(null);
  const [mobileRevealDone, setMobileRevealDone] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (revealedIndex === cards.length - 1 && onRevealEnd) {
      onRevealEnd();
    }
    // Reset front card when reveal restarts
    if (revealedIndex !== cards.length - 1) setFrontCardIdx(null);
  }, [revealedIndex, cards.length, onRevealEnd]);

  useEffect(() => {
    if (isMobile && revealedIndex === cards.length - 1) {
      const t = setTimeout(() => setMobileRevealDone(true), 600);
      return () => clearTimeout(t);
    } else if (isMobile) {
      setMobileRevealDone(false);
    }
  }, [isMobile, revealedIndex, cards.length]);

  // Helper for mobile stacked layout
  const renderMobileStack = () => {
    const revealFinished = mobileRevealDone;

    if (!revealFinished) {
      // Only show the active card
      const card = cards[revealedIndex];
      if (!card) return null;
      return (
        <div
          style={{
            width: "100vw",
            height: 260,
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            position: "relative",
            paddingTop: 32,
          }}
        >
          <motion.div
            key={card.id}
            style={{
              width: "90vw",
              height: 260,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            initial={{ opacity: 0, scale: 0.8, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -40 }}
            transition={{ duration: 0.6, type: "spring" }}
          >
            <Card {...card} expandable />
          </motion.div>
        </div>
      );
    }

    // After reveal: stacked deck with click-to-front
    // The front card is the one with the highest zIndex and no vertical offset
    const stackOffset = 40; // px between cards
    const cardHeight = 220;
    const cardWidth = "90vw";
    const visibleCards = cards.map((card, i) => ({ card, idx: i }));
    // If a card is brought to front, move it to the end of the array
    let orderedCards = visibleCards;
    if (
      frontCardIdx !== null &&
      frontCardIdx >= 0 &&
      frontCardIdx < cards.length
    ) {
      const front = visibleCards[frontCardIdx];
      if (!front) return null;
      orderedCards = visibleCards
        .filter((_, i) => i !== frontCardIdx)
        .concat(front);
    }
    return (
      <div
        style={{
          width: "100vw",
          height: cardHeight + stackOffset * (cards.length - 1) + 32,
          minHeight: 320,
          display: "flex",
          alignItems: "flex-start",
          justifyContent: "center",
          position: "relative",
          paddingTop: 32,
        }}
      >
        {orderedCards.map(({ card, idx }, i) => {
          // The last card in orderedCards is the front card
          const isFront = i === orderedCards.length - 1;
          const y = i * stackOffset;
          return (
            <motion.div
              key={card.id}
              layout
              style={{
                position: "absolute",
                top: 0,
                transform: "translate(-50%, 0)",
                width: cardWidth,
                height: cardHeight,
                zIndex: i,
                cursor: isFront ? "default" : "pointer",
                boxShadow: isFront
                  ? "0 8px 24px rgba(0,0,0,0.18)"
                  : "0 2px 8px rgba(0,0,0,0.10)",
                transition: "box-shadow 0.2s",
              }}
              animate={{
                y,
                scale: isFront ? 1 : 0.92,
                opacity: 1,
              }}
              initial={{
                y: 0,
                scale: 0.8,
                opacity: 0,
              }}
              transition={{
                type: "spring",
                stiffness: 300,
                damping: 30,
                delay: i * 0.12,
              }}
              onClick={() => {
                if (!isFront) setFrontCardIdx(idx);
              }}
            >
              <Card {...card} expandable sx={{ margin: "auto" }} />
            </motion.div>
          );
        })}
      </div>
    );
  };

  return (
    <>
      {/* Mobile stacked animation */}
      {isMobile && (
        <Box
          sx={{ display: { xs: "block", sm: "none" }, position: "relative" }}
        >
          {renderMobileStack()}
        </Box>
      )}
      {/* Desktop/tablet original animation */}
      {!isMobile && (
        <Box
          sx={{
            position: "relative",
            width: showRowLayout ? `${cards.length * 220}px` : "100%",
            maxWidth: "100vw",
            height: 420,
            mt: 8,
            overflowX: "auto",
            whiteSpace: "nowrap",
            display: showRowLayout ? "block" : "flex",
            alignItems: showRowLayout ? undefined : "center",
            justifyContent: showRowLayout ? undefined : "center",
          }}
        >
          {cards.map((card, i) => {
            // Layout logic
            let scale = 0;
            let left = undefined;
            let top = undefined;
            let zIndex = i;
            let cardWidth = 300;
            let cardHeight = 400;
            if (showRowLayout) {
              left = i * 220;
              top = (420 - 240) / 2;
              scale = 1;
              zIndex = 1;
              cardWidth = 200;
              cardHeight = 240;
            } else {
              if (i < revealedIndex) scale = 0.8;
              else if (i === revealedIndex) scale = 1.2;
              else if (i === revealedIndex + 1) scale = 0;
              else scale = 0;
              // Center the stack horizontally
              const stackWidth = (cards.length - 1) * 60 + cardWidth;
              left = `calc(50% - ${stackWidth / 2}px + ${i * 60}px)`;
              top = (420 - cardHeight) / 2;
            }
            return (
              <Box
                key={card.id}
                component={motion.div}
                sx={{
                  position: "absolute",
                  left,
                  top,
                  zIndex,
                  width: cardWidth,
                  height: cardHeight,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
                animate={{
                  scale,
                  opacity: i <= revealedIndex ? 1 : 0,
                  left,
                  top,
                  width: cardWidth,
                  height: cardHeight,
                }}
                initial={{
                  scale: 0,
                  opacity: 0,
                  left,
                  top,
                  width: cardWidth,
                  height: cardHeight,
                }}
                transition={{
                  duration: 0.8,
                  type: "spring",
                }}
              >
                <Card {...card} expandable />
              </Box>
            );
          })}
        </Box>
      )}
    </>
  );
};
