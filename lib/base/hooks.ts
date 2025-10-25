"use client";

import { useEffect } from "react";
import { useAccount } from "wagmi";

export function useOnWalletConnected(fn: () => void) {
  const { isConnected } = useAccount();

  useEffect(() => {
    if (isConnected) {
      fn();
    }
  }, [fn, isConnected]);
}
