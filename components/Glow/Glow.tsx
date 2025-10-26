"use client";

import { Box, styled } from "@mui/material";
import { ReactNode } from "react";

const GlowStyled = styled(Box)<{ blur: number }>`
  background: rgb(213, 49, 97);
  background: linear-gradient(
    5deg,
    rgba(213, 49, 97, 1) 0%,
    rgba(144, 37, 112, 1) 22%,
    rgba(109, 31, 119, 1) 39%,
    rgba(65, 23, 128, 1) 56%,
    rgba(51, 54, 156, 1) 71%,
    rgba(33, 92, 191, 1) 85%,
    rgba(5, 153, 247, 1) 100%
  );
  position: absolute;
  ${({ blur }) => `filter: blur(${blur}px);`}
  margin-top: 50px;
  z-index: -1;
  animation: glow 3.33s ease-in-out infinite;
  height: 100%;
  width: 100%;

  @keyframes glow {
    0%,
    100% {
      opacity: 0.5;
    }
    50% {
      opacity: 1;
    }
  }
`;

export function Glow({
  children,
  blur = 50,
  borderRadius,
}: {
  children: ReactNode;
  blur?: number;
  borderRadius?: string;
}) {
  return (
    <Box position="relative">
      <GlowStyled blur={blur} sx={{ borderRadius }} />
      {children}
    </Box>
  );
}
