"use client";

import { Stack, styled } from "@mui/material";
import { useEffect, useState } from "react";
import useSound from "use-sound";
import { SealedPack } from "./SealedPack";
import ReactConfetti from "react-confetti";
import { CardList } from "./CardList";

const AnimatedOverlay = styled("div")`
  position: fixed;
  top: 0;
  left: 0;
  width: 0%;
  height: 0%;
  background: #fff;
  animation: disappear 5s ease-in-out;
  z-index: ${({ theme }) => theme.zIndex.appBar};
  opacity: 0;
  display: block;

  @keyframes disappear {
    0% {
      width: 100%;
      height: 100%;
      opacity: 0;
      display: block;
    }
    10% {
      width: 100%;
      height: 100%;
      opacity: 1;
      display: block;
    }
    100% {
      width: 100%;
      height: 100%;
      opacity: 0;
      display: none;
    }
  }
`;

const AnimatedCardList = styled("div")`
  animation: appear 4s ease-in-out;
  transform: scale(0.7);
  opacity: 1;

  @keyframes appear {
    0% {
      transform: scale(0);
      opacity: 0;
    }
    100% {
      transform: scale(0.7);
      opacity: 1;
    }
  }
`;

export function Pack() {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfettiShown, setIsConfettiShown] = useState(false);
  const [recycle, setRecycle] = useState(true);
  const [playOpenPack] = useSound("/audio/open-pack.mp3");
  const [playSong, { sound }] = useSound("/audio/song.mp3");

  useEffect(() => {
    setTimeout(() => {
      setIsConfettiShown(true);
    }, 3000);

    setTimeout(() => {
      setRecycle(false);
    }, 25000);
  }, [isOpen]);

  return (
    <Stack justifyContent="center">
      <SealedPack
        onOpen={() => {
          sound.fade(0, 1, 1000);
          playSong();
          playOpenPack();
          setIsOpen(true);
        }}
      />
      {isOpen && (
        <>
          <AnimatedOverlay />
          <ReactConfetti
            run={isConfettiShown}
            recycle={recycle}
            gravity={0.05}
            numberOfPieces={600}
            colors={["gold", "silver", "bronze"]}
          />
          {/* <Title variant="h2">YOUR TEAM</Title> */}
          <AnimatedCardList>
            <CardList />
          </AnimatedCardList>
        </>
      )}
    </Stack>
  );
}
