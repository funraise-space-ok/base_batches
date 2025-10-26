"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useAccount, usePublicClient, useWalletClient } from "wagmi";
import { sportsAbi } from "./abi/sports";
import { BASE_CONTRACT_ADDRESS } from "./config";
import { formatEther, parseAbiItem, decodeEventLog } from "viem";

export type PackTierId = "A" | "B" | "C";

export type TeamStateName = "Free" | "WarmingUp" | "OnField" | "ToWithdraw";
export type PlayerCategoryName = "Bronze" | "Silver" | "Gold";

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
  state?: TeamStateName;
  playerIds?: number[];
  termsAccepted?: boolean;
  pricePaidWei?: bigint;
}

export interface BasePlayer {
  id: number;
  providerId: number;
  category: PlayerCategoryName;
  totalTokens: number;
  tokensSold: number;
  metadataUri: string;
  name: string;
  discipline: string;
  country: string;
  exists: boolean;
}

interface BuyPackResult {
  hash: `0x${string}`;
  teamId?: number;
  team?: BaseTeam;
  playerIds?: number[];
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

const PACK_PURCHASED_EVENT = parseAbiItem(
  "event PackPurchased(address indexed buyer, uint256 indexed teamId, uint8 tier, uint256 valuePaid)"
);

const TOKEN_SOLD_EVENT = parseAbiItem(
  "event TokenSold(uint16 indexed playerId, uint256 indexed teamId, address indexed buyer)"
);

type RawTeamArray = readonly [bigint, `0x${string}`, number, boolean, bigint, bigint];
type RawTeamObject = {
  teamId: bigint;
  owner: `0x${string}`;
  tier: number | bigint;
  staked: boolean;
  createdAt: bigint;
  updatedAt: bigint;
};

type RawTeamDetailArray = readonly [
  bigint,
  `0x${string}`,
  number,
  number,
  bigint,
  bigint,
  boolean,
  bigint,
  readonly number[],
  boolean,
];

type RawTeamDetailObject = {
  id: bigint;
  owner: `0x${string}`;
  tier: number | bigint;
  state: number | bigint;
  createdAt: bigint;
  transitionTimestamp: bigint;
  termsAccepted: boolean;
  pricePaidWei: bigint;
  playerIds: readonly number[];
  exists: boolean;
};

type RawPlayerArray = readonly [
  number,
  number,
  number,
  number,
  number,
  string,
  string,
  string,
  string,
  boolean,
];

type RawPlayerObject = {
  id: number;
  providerId: number;
  category: number;
  totalTokens: number;
  tokensSold: number;
  metadataUri: string;
  name: string;
  discipline: string;
  country: string;
  exists: boolean;
};

function mapTeam(raw: RawTeamArray | RawTeamObject): BaseTeam {
  let teamId: bigint;
  let owner: `0x${string}`;
  let tier: number | bigint;
  let staked: boolean;
  let createdAt: bigint;
  let updatedAt: bigint;

  if (Array.isArray(raw)) {
    [teamId, owner, tier, staked, createdAt, updatedAt] = raw;
  } else {
    ({
      teamId,
      owner,
      tier,
      staked,
      createdAt,
      updatedAt,
    } = raw);
  }

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

function mapTeamDetail(raw: RawTeamDetailArray | RawTeamDetailObject): BaseTeam {
  let id: bigint;
  let owner: `0x${string}`;
  let tier: number | bigint;
  let state: number | bigint;
  let createdAt: bigint;
  let transitionTimestamp: bigint;
  let termsAccepted: boolean;
  let pricePaidWei: bigint;
  let playerIds: readonly number[];

  if (Array.isArray(raw)) {
    [id, owner, tier, state, createdAt, transitionTimestamp, termsAccepted, pricePaidWei, playerIds] = [
      raw[0],
      raw[1],
      raw[2],
      raw[3],
      raw[4],
      raw[5],
      raw[6],
      raw[7],
      raw[8],
    ];
  } else {
    ({
      id,
      owner,
      tier,
      state,
      createdAt,
      transitionTimestamp,
      termsAccepted,
      pricePaidWei,
      playerIds,
    } = raw);
  }

  const tierIdx = Number(tier) as 0 | 1 | 2;
  const tierKey = tierIdx === 0 ? "A" : tierIdx === 1 ? "B" : "C";
  const stateName: TeamStateName = ["Free", "WarmingUp", "OnField", "ToWithdraw"][Number(state)] as TeamStateName;

  return {
    teamId: Number(id),
    owner,
    tier: tierKey,
    staked: stateName !== "Free",
    createdAt: Number(createdAt),
    updatedAt: Number(transitionTimestamp),
    state: stateName,
    playerIds: Array.from(playerIds, Number),
    termsAccepted,
    pricePaidWei,
  };
}

function mapPlayer(raw: RawPlayerArray | RawPlayerObject): BasePlayer {
  let id: number;
  let providerId: number;
  let category: number;
  let totalTokens: number;
  let tokensSold: number;
  let metadataUri: string;
  let name: string;
  let discipline: string;
  let country: string;
  let exists: boolean;

  if (Array.isArray(raw)) {
    [id, providerId, category, totalTokens, tokensSold, metadataUri, name, discipline, country, exists] = raw;
  } else {
    ({
      id,
      providerId,
      category,
      totalTokens,
      tokensSold,
      metadataUri,
      name,
      discipline,
      country,
      exists,
    } = raw);
  }

  const categoryName: PlayerCategoryName = ["Bronze", "Silver", "Gold"][Number(category)] as PlayerCategoryName;

  return {
    id,
    providerId,
    category: categoryName,
    totalTokens,
    tokensSold,
    metadataUri,
    name,
    discipline,
    country,
    exists,
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
        abi: sportsAbi,
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
        abi: sportsAbi,
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
          abi: sportsAbi,
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

  const getTeamDetail = useCallback(
    async (teamId: number): Promise<BaseTeam | null> => {
      if (!publicClient || !contractAddress) return null;
      try {
        const [rawTeam] = (await publicClient.readContract({
          abi: sportsAbi,
          address: contractAddress,
          functionName: "getTeamDetail",
          args: [BigInt(teamId)],
        })) as [RawTeamDetailArray | RawTeamDetailObject, unknown];

        return mapTeamDetail(rawTeam);
      } catch (err) {
        console.error("Error fetching team detail", err);
        return null;
      }
    },
    [contractAddress, publicClient],
  );

  const getPlayersByIds = useCallback(
    async (ids: number[]): Promise<BasePlayer[]> => {
      if (!publicClient || !contractAddress || ids.length === 0) {
        return [];
      }

      try {
        const rawPlayers = (await publicClient.readContract({
          abi: sportsAbi,
          address: contractAddress,
          functionName: "getPlayersByIds",
          args: [ids.map((id) => BigInt(id))],
        })) as (RawPlayerArray | RawPlayerObject)[];

        return rawPlayers.map(mapPlayer);
      } catch (err) {
        console.error("Error fetching players", err);
        throw err;
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
          abi: sportsAbi,
          address: contractAddress,
          functionName: "setTeamStake",
          args: [BigInt(teamId), staked],
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        if (receipt.status !== "success") {
          throw new Error(`Stake transaction reverted (${receipt.transactionHash})`);
        }
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
    async (tier: PackTierId, acceptTerms: boolean): Promise<BuyPackResult> => {
      if (!walletClient || !publicClient || !contractAddress) {
        throw new Error("Wallet not ready");
      }

      const selectedTier = PACK_TO_TIER[tier];
      const price = packPrices[tier]?.raw ?? 0n;
      if (!acceptTerms) {
        throw new Error("Debes aceptar los términos para comprar el pack");
      }

      try {
        setLoading(true);
        const hash = await walletClient.writeContract({
          abi: sportsAbi,
          address: contractAddress,
          functionName: "buyPack",
          args: [selectedTier, acceptTerms],
          value: price,
        });

        const receipt = await publicClient.waitForTransactionReceipt({ hash });
        
        if (receipt.status !== "success") {
          throw new Error(`Compra revertida en la red (${receipt.transactionHash})`);
        }

        let teamId: number | undefined;
        const playerIds: number[] = [];

        for (const log of receipt.logs) {
          try {
            const parsed = decodeEventLog({
              abi: [PACK_PURCHASED_EVENT],
              data: log.data,
              topics: log.topics,
            });
            if (parsed && parsed.eventName === "PackPurchased") {
              teamId = Number(parsed.args.teamId);
            }
          } catch (err) {
            // Not a PackPurchased event
          }

          try {
            const parsedToken = decodeEventLog({
              abi: [TOKEN_SOLD_EVENT],
              data: log.data,
              topics: log.topics,
            });
            if (parsedToken && parsedToken.eventName === "TokenSold") {
              const playerId = Number(parsedToken.args.playerId);
              if (!Number.isNaN(playerId) && !playerIds.includes(playerId)) {
                playerIds.push(playerId);
              }
            }
          } catch (err) {
            // Not a TokenSold event
          }
        }

        const team = teamId ? await getTeamDetail(teamId) : undefined;
        setError(null);
        return {
          hash,
          teamId,
          team,
          playerIds,
        };
      } catch (err: any) {
        console.error("Error buying pack", err);
        setError(err?.shortMessage ?? err?.message ?? "Failed to buy pack");
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [contractAddress, getTeamDetail, packPrices, publicClient, walletClient],
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
    getTeamDetail,
    getPlayersByIds,
    labels: TIER_LABELS,
  };
}
