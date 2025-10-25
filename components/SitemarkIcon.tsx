"use client";

import * as React from "react";
import { useColorScheme } from "@mui/material";
import Image from "next/image";

export default function SitemarkIcon() {
  const { mode, systemMode } = useColorScheme();
  const logoUrl =
    mode === "dark" || systemMode === "dark" ? "/logo.svg" : "/logo-alt.svg";

  return <Image src={logoUrl} alt="funraise sports" width={140} height={32} />;
}
