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

  const BaseBatches = await ethers.getContractFactory("BaseBatches");
  const contract = await BaseBatches.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("BaseBatches deployed to:", address);

  const balance = await ethers.provider.getBalance(address);
  console.log("Contract initial balance:", balance.toString());
}

main().catch((error) => {
  console.error("Deployment failed:", error);
  process.exitCode = 1;
});
