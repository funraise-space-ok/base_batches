/**
 * Script para configurar el tiempo de bloqueo (timeLock) en el contrato Sports
 * 
 * Uso:
 * 1. Con tiempo por defecto (180 segundos):
 *    CONTRACT_ADDRESS=0x... npx hardhat run scripts/setTimeLock.js --network baseSepolia
 * 
 * 2. Con tiempo personalizado:
 *    CONTRACT_ADDRESS=0x... TIME_LOCK_SECONDS=300 npx hardhat run scripts/setTimeLock.js --network baseSepolia
 * 
 * 3. En localhost:
 *    CONTRACT_ADDRESS=0x... npx hardhat run scripts/setTimeLock.js --network localhost
 * 
 * Ejemplos de tiempos comunes:
 * - 60 segundos = 1 minuto
 * - 180 segundos = 3 minutos (default)
 * - 300 segundos = 5 minutos
 * - 600 segundos = 10 minutos
 * - 3600 segundos = 1 hora
 * - 86400 segundos = 24 horas
 */

import { network } from "hardhat";

async function main() {
  const { ethers } = await network.connect();
  
  // Get the contract address from environment or use default
  const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS;
  
  if (!CONTRACT_ADDRESS) {
    console.error("❌ Error: CONTRACT_ADDRESS environment variable not set");
    console.log("Please set it in your .env file or run with:");
    console.log("CONTRACT_ADDRESS=0x... npx hardhat run scripts/setTimeLock.js --network baseSepolia");
    process.exit(1);
  }

  console.log("🔧 Setting TimeLock on Sports contract...");
  console.log("📍 Contract address:", CONTRACT_ADDRESS);

  // Get the contract
  const Sports = await ethers.getContractFactory("Sports");
  const sports = Sports.attach(CONTRACT_ADDRESS);

  // Get current time lock
  const currentTimeLock = await sports.timeLockSeconds();
  console.log(`📊 Current timeLock: ${currentTimeLock.toString()} seconds (${Number(currentTimeLock) / 60} minutes)`);

  // New time lock in seconds (can be passed as env variable or default to 180)
  const NEW_TIME_LOCK = process.env.TIME_LOCK_SECONDS ? parseInt(process.env.TIME_LOCK_SECONDS) : 180;

  console.log(`⏱️  Setting timeLock to ${NEW_TIME_LOCK} seconds (${NEW_TIME_LOCK / 60} minutes)...`);

  // Call setTimeLock
  const tx = await sports.setTimeLock(NEW_TIME_LOCK);
  console.log("📤 Transaction sent:", tx.hash);
  
  // Wait for confirmation
  console.log("⏳ Waiting for confirmation...");
  const receipt = await tx.wait();
  console.log("✅ Transaction confirmed in block:", receipt.blockNumber);
  console.log("⛽ Gas used:", receipt.gasUsed.toString());

  // Verify the new value
  const newTimeLock = await sports.timeLockSeconds();
  console.log("✅ TimeLock updated successfully!");
  console.log(`⏱️  New timeLock: ${newTimeLock.toString()} seconds (${Number(newTimeLock) / 60} minutes)`);
  
  if (Number(newTimeLock) !== NEW_TIME_LOCK) {
    console.warn("⚠️  Warning: Value mismatch detected!");
  }
}

main().catch((error) => {
  console.error("❌ Error:", error);
  process.exitCode = 1;
});

