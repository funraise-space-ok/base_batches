"use client";

import * as React from "react";
import Image from "next/image";
import { Box, ButtonBase } from "@mui/material";
import { useIsMobile } from "../lib/hooks/useIsMobile";

export default function FunraiseLogo() {
  const isMobile = useIsMobile();

  return (
    <Box textAlign={isMobile ? "center" : "left"}>
      <ButtonBase href="https://funraise.space">
        <Image
          src="/funraise.svg"
          alt="funraise sports"
          width={150}
          height={32}
        />
      </ButtonBase>
    </Box>
  );
}
