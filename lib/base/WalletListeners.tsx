"use client";

import { useRouter } from "next/navigation";
import { useOnWalletConnected } from "./hooks";

export function ConnectedWalletListener() {
  const router = useRouter();

  useOnWalletConnected(() => {
    router.push("/dashboard");
  });

  return null;
}
