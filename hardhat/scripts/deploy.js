import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  const [deployer] = await ethers.getSigners();
  if (!deployer) {
    throw new Error(
      "No signer disponible. Asegúrate de definir BASE_SEPOLIA_PRIVATE_KEY en base_batches/hardhat/.env",
    );
  }
  console.log("Deploying with account:", deployer.address);

  const defaults = {
    BRONZE_ETH: "0.0005",
    SILVER_ETH: "0.001",
    GOLD_ETH: "0.002",
    LOCK_SECONDS: "86400",
  };

  const parsePrice = (tier) => {
    const weiEnv = process.env[`PACK_PRICE_${tier}_WEI`];
    if (weiEnv) {
      return BigInt(weiEnv);
    }
    const ethEnv = process.env[`PACK_PRICE_${tier}_ETH`] ?? defaults[`${tier}_ETH`];
    return ethers.parseEther(ethEnv);
  };

  const bronzePriceWei = parsePrice("BRONZE");
  const silverPriceWei = parsePrice("SILVER");
  const goldPriceWei = parsePrice("GOLD");
  const metadataBaseUri = process.env.METADATA_BASE_URI ?? "";
  const lockSeconds = BigInt(process.env.TIME_LOCK_SECONDS ?? defaults.LOCK_SECONDS);

  if (bronzePriceWei <= 0n || silverPriceWei <= 0n || goldPriceWei <= 0n) {
    throw new Error("Pack prices must be greater than zero");
  }

  if (lockSeconds < 0n) {
    throw new Error("TIME_LOCK_SECONDS must be zero or positive");
  }

  console.log("Constructor params:", {
    bronzePriceWei: bronzePriceWei.toString(),
    silverPriceWei: silverPriceWei.toString(),
    goldPriceWei: goldPriceWei.toString(),
    metadataBaseUri,
    lockSeconds: lockSeconds.toString(),
  });

  const Sports = await ethers.getContractFactory("Sports");
  const contract = await Sports.deploy(
    bronzePriceWei,
    silverPriceWei,
    goldPriceWei,
    metadataBaseUri,
    lockSeconds,
  );
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("Sports deployed to:", address);

  const balance = await ethers.provider.getBalance(address);
  console.log("Contract initial balance:", balance.toString());
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
