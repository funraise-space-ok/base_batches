#!/usr/bin/env node

/**
 * Simple helper to read core state from the deployed Sports contract.
 * Usage: node scripts/read-sports-state.cjs <contractAddress>
 */

const path = require("path");
const { readFileSync } = require("fs");
const { createPublicClient, http } = require("viem");
const { baseSepolia, base } = require("viem/chains");

function loadAbi() {
  const artifactPath = path.resolve(
    __dirname,
    "../hardhat/artifacts/contracts/Sports.sol/Sports.json",
  );
  const artifact = JSON.parse(readFileSync(artifactPath, "utf8"));
  return artifact.abi;
}

async function main() {
  const [addressArg, networkArg] = process.argv.slice(2);
  if (!addressArg) {
    throw new Error("Usage: node scripts/read-sports-state.cjs <contractAddress> [network]");
  }

  const chain =
    (networkArg?.toLowerCase() === "mainnet" ? base : baseSepolia);
  const rpcUrl =
    process.env.NEXT_PUBLIC_BASE_RPC_URL ||
    process.env.BASE_SEPOLIA_RPC_URL ||
    chain.rpcUrls?.public?.http?.[0] ||
    chain.rpcUrls?.default?.http?.[0];

  const client = createPublicClient({
    chain,
    transport: http(rpcUrl),
  });

  const abi = loadAbi();
  const address = addressArg;

  const [prices, isOpen, nextTeamId, owner] = await Promise.all([
    client.readContract({ abi, address, functionName: "getPackPrices" }),
    client.readContract({ abi, address, functionName: "isReportOpen" }),
    client.readContract({ abi, address, functionName: "nextTeamId" }),
    client.readContract({ abi, address, functionName: "owner" }),
  ]);

  console.log(`Contract: ${address}`);
  console.log(`Network: ${chain.name}`);
  console.log(`Owner: ${owner}`);
  console.log(
    "Pack prices (wei):",
    `Bronze=${prices[0].toString()}`,
    `Silver=${prices[1].toString()}`,
    `Gold=${prices[2].toString()}`,
  );
  console.log("Report open:", isOpen);
  console.log("Next team id:", nextTeamId.toString());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
