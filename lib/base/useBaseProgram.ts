"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { baseBatchesAbi } from "./abi/baseBatches";
import { BASE_CONTRACT_ADDRESS } from "./config";
import { formatEther, parseAbiItem } from "viem";

export type PackTierId = "A" | "B" | "C";

const PACK_TO_TIER: Record<PackTierId, number> = {
  A: 0,
  B: 1,
  C: 2,
};

const TIER_LABELS: Record<number, string> = {
  0: "Bronze",
  1: "Silver",
  2: "Gold",
};

export interface BaseTeam {
  teamId: number;
  owner: `0x${string}`;
  tier: PackTierId;
  staked: boolean;
  createdAt: number;
  updatedAt: number;
}

interface BuyPackResult {
  hash: `0x${string}`;
  teamId?: number;
  team?: BaseTeam;
}

interface PackPriceMap {
  raw: bigint;
  formatted: string;
}

function formatPackPrice(value: bigint): PackPriceMap {
  return {
    raw: value,
    formatted: value === 0n ? "0" : `${formatEther(value)} ETH`,
  };
}

function mapTeam(raw: readonly [bigint, `0x${string}`, number, boolean, bigint, bigint]): BaseTeam {
  const [teamId, owner, tier, staked, createdAt, updatedAt] = raw;
  const tierIdx = Number(tier) as 0 | 1 | 2;
  const tierKey = tierIdx === 0 ? "A" : tierIdx === 1 ? "B" : "C";
  return {
    teamId: Number(teamId),
    owner,
    tier: tierKey,
    staked,
    createdAt: Number(createdAt),
    updatedAt: Number(updatedAt),
  };
}

export function useBaseProgram() {
  const { address, isConnected } = useAccount();
  const publicClient = usePublicClient();
  const { data: walletClient } = useWalletClient();

  const [packPrices, setPackPrices] = useState<Record<PackTierId, PackPriceMap>>({
    A: formatPackPrice(0n),
    B: formatPackPrice(0n),
    C: formatPackPrice(0n),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const contractAddress = useMemo(() => {
    if (!BASE_CONTRACT_ADDRESS || BASE_CONTRACT_ADDRESS === "0x0000000000000000000000000000000000000000") {
      return undefined;
    }
    return BASE_CONTRACT_ADDRESS;
  }, []);

  const refreshPackPrices = useCallback(async () => {
    if (!publicClient || !contractAddress) return;
    try {
      const [bronze, silver, gold] = (await publicClient.readContract({
        abi: baseBatchesAbi,
        address: contractAddress,
        functionName: "getPackPrices",
      })) as readonly [bigint, bigint, bigint];
      setPackPrices({
        A: formatPackPrice(bronze),
        B: formatPackPrice(silver),
        C: formatPackPrice(gold),
      });
    } catch (err) {
      console.error("Error loading pack prices", err);
    }
  }, [contractAddress, publicClient]);

  useEffect(() => {
    refreshPackPrices();
  }, [refreshPackPrices]);

  const getUserTeams = useCallback(async (): Promise<BaseTeam[]> => {
    if (!publicClient || !contractAddress || !address) {
      return [];
    }

    try {
      const teams = (await publicClient.readContract({
        abi: baseBatchesAbi,
        address: contractAddress,
        functionName: "getUserTeams",
        args: [address],
      })) as readonly [bigint, `0x${string}`, number, boolean, bigint, bigint][];

      return (Array.isArray(teams) ? teams : []).map(mapTeam);
    } catch (err) {
      console.error("Error fetching user teams", err);
      throw err;
    }
  }, [address, contractAddress, publicClient]);

  const getTeamById = useCallback(
    async (teamId: number): Promise<BaseTeam | null> => {
      if (!publicClient || !contractAddress) return null;
      try {
        const team = (await publicClient.readContract({
          abi: baseBatchesAbi,
          address: contractAddress,
          functionName: "getTeam",
          args: [BigInt(teamId)],
        })) as readonly [bigint, `0x${string}`, number, boolean, bigint, bigint];
        return mapTeam(team);
      } catch (err) {
        console.error("Error fetching team", err);
        return null;
      }
    },
    [contractAddress, publicClient],
  );

  const setTeamStake = useCallback(
    async (teamId: number, staked: boolean) => {
      if (!walletClient || !publicClient || !contractAddress) {
        throw new Error("Wallet not ready");
      }

      try {
        setLoading(true);
        const hash = await walletClient.writeContract({
          abi: baseBatchesAbi,
          address: contractAddress,
          functionName: "setTeamStake",
          args: [BigInt(teamId), staked],
        });

        await publicClient.waitForTransactionReceipt({ hash });
        setError(null);
      } catch (err: any) {
        console.error("Error updating stake status", err);
        setError(err?.shortMessage ?? err?.message ?? "Failed to set stake status");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [contractAddress, publicClient, walletClient],
  );

  const buyPack = useCallback(
    async (tier: PackTierId): Promise<BuyPackResult> => {
      if (!walletClient || !publicClient || !contractAddress) {
        throw new Error("Wallet not ready");
      }

      const selectedTier = PACK_TO_TIER[tier];
      const price = packPrices[tier]?.raw ?? 0n;

      try {
        setLoading(true);
        const hash = await walletClient.writeContract({
          abi: baseBatchesAbi,
          address: contractAddress,
          functionName: "buyPack",
          args: [selectedTier],
          value: price,
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        let teamId: number | undefined;
        for (const log of receipt.logs) {
          try {
            const parsed = publicClient.decodeEventLog({
              abi: [parseAbiItem("event PackPurchased(address indexed buyer, uint256 indexed teamId, uint8 tier, uint256 valuePaid)")],
              data: log.data,
              topics: log.topics,
            });
            if (parsed && parsed.eventName === "PackPurchased") {
              teamId = Number(parsed.args.teamId);
              break;
            }
          } catch {
            // ignore unrelated events
          }
        }

        const team = teamId ? await getTeamById(teamId) : undefined;
        setError(null);
        return { hash, teamId, team };
      } catch (err: any) {
        console.error("Error buying pack", err);
        setError(err?.shortMessage ?? err?.message ?? "Failed to buy pack");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [contractAddress, getTeamById, packPrices, publicClient, walletClient],
  );

  return {
    contractAddress,
    loading,
    error,
    packPrices,
    buyPack,
    getUserTeams,
    setTeamStake,
    refreshPackPrices,
    isConnected,
    address,
    getTeamById,
    labels: TIER_LABELS,
  };
}
