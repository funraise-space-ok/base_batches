import { config as dotenvConfig } from "dotenv";
import hardhatEthers from "@nomicfoundation/hardhat-ethers";

dotenvConfig();

const privateKey = process.env.BASE_SEPOLIA_PRIVATE_KEY;

export default {
  plugins: [hardhatEthers],
  solidity: {
    version: "0.8.20",
    settings: {
      optimizer: { enabled: true, runs: 200 },
    },
  },
  networks: {
    baseSepolia: {
      type: "http",
      url: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
      accounts: privateKey ? [privateKey] : [],
      chainId: 84532,
    },
  },
  paths: {
    sources: "contracts",
    artifacts: "artifacts",
    cache: "cache",
  },
};
