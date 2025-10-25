"use client";

import { PropsWithChildren } from "react";
import { WagmiProvider } from "wagmi";
import { wagmiConfig } from "./config";

export function BaseWalletProvider({ children }: PropsWithChildren) {
  return <WagmiProvider config={wagmiConfig}>{children}</WagmiProvider>;
}
