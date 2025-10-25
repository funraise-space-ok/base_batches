"use client";

import { http, createConfig } from "wagmi";
import { injected } from "wagmi/connectors";
import { base, baseSepolia } from "wagmi/chains";

const network =
  process.env.NEXT_PUBLIC_BASE_NETWORK?.toLowerCase() === "mainnet"
    ? base
    : baseSepolia;

const rpcUrl =
  process.env.NEXT_PUBLIC_BASE_RPC_URL ||
  network.rpcUrls.public.http[0] ||
  network.rpcUrls.default.http[0];

export const wagmiConfig = createConfig({
  chains: [network],
  connectors: [
    injected({
      shimDisconnect: true,
    }),
  ],
  transports: {
    [network.id]: http(rpcUrl),
  },
  ssr: true,
});

export const baseChain = network;

export const BASE_CONTRACT_ADDRESS =
  (process.env.NEXT_PUBLIC_BASE_CONTRACT_ADDRESS as `0x${string}` | undefined) ??
  "0x0000000000000000000000000000000000000000";
