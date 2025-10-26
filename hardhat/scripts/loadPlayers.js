import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { parse } from "csv-parse/sync";
import { network } from "hardhat";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CATEGORY_MAP = {
  Bronze: 0,
  Silver: 1,
  Gold: 2,
};

function parseStock(value) {
  if (!value) return 0;
  const normalized = value.replace(/\./g, "").replace(/,/g, "");
  const parsed = Number(normalized);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(`Invalid stock value: ${value}`);
  }
  return parsed;
}

function sanitizeString(value) {
  return value ? value.trim() : "";
}

function loadCsvRecords(csvPath) {
  const content = fs.readFileSync(csvPath, "utf8");
  return parse(content, {
    columns: true,
    skip_empty_lines: true,
    delimiter: ",",
    trim: true,
  });
}

function buildPlayerInput(record) {
  const rarity = sanitizeString(record["Rarity"]);
  const categoryIndex = CATEGORY_MAP[rarity];
  if (categoryIndex === undefined) {
    throw new Error(`Unsupported rarity: ${rarity}`);
  }

  const metadataUri =
    sanitizeString(record["IPFS  NFT Portada"]) ||
    sanitizeString(record["IPFS NFT Portada"]) ||
    sanitizeString(record["IPFS CARD"]) ||
    "";

  return {
    providerId: Number(record["Token_provider_id"]) || 0,
    category: categoryIndex,
    totalTokens: parseStock(record["Stock"]),
    metadataUri,
    name: sanitizeString(record["Name"]),
    discipline: sanitizeString(record["Sport"]),
    country: sanitizeString(record["Country"]),
  };
}

async function main() {
  const { ethers } = await network.connect();

  const csvPath =
    process.env.PLAYERS_CSV_PATH ||
    path.resolve(__dirname, "../../../sports/data/players.csv");
  const contractAddress = process.env.BASE_CONTRACT_ADDRESS;
  if (!contractAddress) {
    throw new Error("BASE_CONTRACT_ADDRESS env var is required");
  }

  const records = loadCsvRecords(csvPath);
  console.log(`Loaded ${records.length} CSV rows from ${csvPath}`);

  const playerInputs = records.map(buildPlayerInput);

  const chunkSize = Number(process.env.PLAYERS_BATCH_SIZE || "20");
  if (!Number.isFinite(chunkSize) || chunkSize <= 0) {
    throw new Error("Invalid PLAYERS_BATCH_SIZE value");
  }

  const [signer] = await ethers.getSigners();
  console.log(`Using signer ${signer.address} to load players`);
  const contract = await ethers.getContractAt("Sports", contractAddress, signer);

  const feeMultiplier = BigInt(process.env.GAS_BUMP_PERCENT || "120");
  if (feeMultiplier < 100n) {
    throw new Error("GAS_BUMP_PERCENT must be >= 100 to avoid lowering fees");
  }
  const minPriority = ethers.parseUnits(process.env.MIN_PRIORITY_FEE_GWEI || "1.5", "gwei");
  let processed = 0;
  for (let i = 0; i < playerInputs.length; i += chunkSize) {
    const batch = playerInputs.slice(i, i + chunkSize);
    console.log(`Sending batch ${Math.floor(i / chunkSize) + 1} (${batch.length} players)`);
    const feeData = await ethers.provider.getFeeData();
    const basePriority = feeData.maxPriorityFeePerGas ?? minPriority;
    const baseFee =
      feeData.maxFeePerGas ??
      (feeData.gasPrice ? feeData.gasPrice + basePriority : basePriority * 2n);
    const maxPriorityFeePerGas = (basePriority * feeMultiplier) / 100n;
    const maxFeePerGas = (baseFee * feeMultiplier) / 100n;
    const tx = await contract.createPlayersBatch(batch, {
      maxPriorityFeePerGas,
      maxFeePerGas,
    });
    console.log(`  tx hash: ${tx.hash}`);
    await tx.wait(2);
    processed += batch.length;
  }

  console.log(`✅ Completed player load. Total players created: ${processed}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
