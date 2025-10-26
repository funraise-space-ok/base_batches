/* eslint-disable react/no-unknown-property */
"use client";

import { Box, Button, Container, styled } from "@mui/material";
import { Canvas, extend, useLoader } from "@react-three/fiber";
import { Mesh, BoxGeometry, MeshStandardMaterial } from "three";
import { FBXLoader } from "three/examples/jsm/Addons.js";
import {
  CameraControls,
  Center,
  AccumulativeShadows,
  RandomizedLight,
  Environment,
  Float,
} from "@react-three/drei";
import { memo, useRef, useState } from "react";

extend({ Mesh, BoxGeometry, MeshStandardMaterial });

interface Props {
  onOpen: () => void;
}

const Shadows = memo(function Shadows() {
  return (
    <AccumulativeShadows
      temporal
      frames={100}
      color="#9d4b4b"
      colorBlend={0.5}
      alphaTest={0.9}
      scale={20}
    >
      <RandomizedLight amount={8} radius={4} position={[5, 5, -10]} />
    </AccumulativeShadows>
  );
});

export function D3SealedPack({ onOpen }: Props) {
  const packRef = useRef(null);
  const fbx = useLoader(FBXLoader, "/gold_pack_v2.fbx");
  const cameraControlsRef = useRef(null);

  // const { camera } = useThree()

  return (
    <Container>
      <Box sx={{ height: 500, position: "relative" }}>
        <Button
          variant="contained"
          color="secondary"
          onClick={onOpen}
          sx={{ position: "absolute", bottom: 100, zIndex: 100 }}
        >
          Open Pack
        </Button>
        <Canvas
          shadows
          camera={{ position: [400, 200, 400], fov: 30, zoom: 1.5 }}
        >
          <Environment
            preset="city"
            background={false} // can be true, false or "only" (which only sets the background) (default: false)
            backgroundBlurriness={0} // optional blur factor between 0 and 1 (default: 0, only works with three 0.146 and up)
            backgroundIntensity={1} // optional intensity factor (default: 1, only works with three 0.163 and up)
            backgroundRotation={[0, Math.PI / 2, 0]} // optional rotation (default: 0, only works with three 0.163 and up)
            environmentIntensity={1} // optional intensity factor (default: 1, only works with three 0.163 and up)
            environmentRotation={[0, Math.PI / 2, 0]} // optional rotation (default: 0, only works with three 0.163 and up)
          />
          <ambientLight intensity={1.5 * Math.PI} />

          <Center top>
            <Float
              speed={1} // Animation speed, defaults to 1
              rotationIntensity={0.5} // XYZ rotation intensity, defaults to 1
              floatIntensity={0.5} // Up/down float intensity, works like a multiplier with floatingRange,defaults to 1
              floatingRange={[0, 0.1]} // Range of y-axis values the object will float within, defaults to [-0.1,0.1]
            >
              <primitive
                object={fbx}
                position={[0, -70, -200]}
                scale={0.6}
                rotation={[0, -1.1, 0]}
                ref={packRef}
              />
            </Float>
          </Center>
          {/* <PerspectiveCamera makeDefault>
            <primitive object={fbx} position={[0, -70, -200]} scale={.6} rotation={[0, -1.1, 0]} ref={packRef}/>
          </PerspectiveCamera> */}
          {/* <ambientLight intensity={1} castShadow /> */}
          <Shadows />
          <CameraControls ref={cameraControlsRef} />
          {/* <directionalLight color="white" position={[50, 0, 500]} intensity={1} castShadow /> */}
        </Canvas>
      </Box>
    </Container>
  );
}

const Pack = styled("div")`
  width: 118px;
  height: 198px;
  background-image: url("/gold_pack.png");
  background-size: contain;
  transform: scale(1.5);
  margin: auto;
  animation: beat 5s ease-in-out infinite;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.3);

  @keyframes beat {
    0%,
    100% {
      transform: scale(1.5);
    }
    50% {
      transform: scale(1.8);
    }
  }
`;

const SealedPackContainer = styled("div")`
  margin-top: 100px;
  transition: all 1500ms ease-in-out;
  text-align: center;
`;

export function SealedPack({ onOpen }: Props) {
  const [isPackOpen, setIsPackOpen] = useState(false);

  const handleOpen = () => {
    onOpen();
    setIsPackOpen(true);
  };

  return (
    <Box sx={{ position: "relative" }}>
      <SealedPackContainer
        sx={{
          opacity: isPackOpen ? 0 : 1,
          height: isPackOpen ? 0 : "auto",
          zoom: 1.5,
        }}
      >
        <Pack />
        <Button
          variant="contained"
          color="secondary"
          onClick={handleOpen}
          sx={{ mt: 4 }}
        >
          Open Pack
        </Button>
      </SealedPackContainer>
    </Box>
  );
}
