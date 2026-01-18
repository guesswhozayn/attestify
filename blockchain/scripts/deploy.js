const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying Attestify contract...\n");
  
  // Get deployer account
  const [deployer] = await hre.ethers.getSigners();
  console.log("📝 Deploying with account:", deployer.address);
  
  // Check balance
  const balance = await hre.ethers.provider.getBalance(deployer.address);
  console.log("💰 Account balance:", hre.ethers.formatEther(balance), "ETH\n");
  
  // Deploy contract
  const Attestify = await hre.ethers.getContractFactory("Attestify");
  const attestify = await Attestify.deploy();
  
  await attestify.waitForDeployment();
  
  const address = await attestify.getAddress();
  console.log("✅ Attestify deployed to:", address);
  console.log("🔗 View on Etherscan:", `https://sepolia.etherscan.io/address/${address}\n`);
  
  // Wait for block confirmations
  console.log("⏳ Waiting for 6 block confirmations...");
  await attestify.deploymentTransaction().wait(6);
  console.log("✅ Confirmed!\n");
  
  // Verify contract on Etherscan
  if (process.env.ETHERSCAN_API_KEY) {
    console.log("🔍 Verifying contract on Etherscan...");
    try {
      await hre.run("verify:verify", {
        address: address,
        constructorArguments: [],
      });
      console.log("✅ Contract verified on Etherscan!");
    } catch (error) {
      if (error.message.includes("already verified")) {
        console.log("ℹ️  Contract already verified");
      } else {
        console.error("❌ Verification failed:", error.message);
      }
    }
  }
  
  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    address: address,
    deployer: deployer.address,
    network: hre.network.name,
    timestamp: new Date().toISOString(),
    transactionHash: attestify.deploymentTransaction().hash
  };
  
  fs.writeFileSync(
    'deployment-info.json',
    JSON.stringify(deploymentInfo, null, 2)
  );
  
  console.log("\n📄 Deployment info saved to deployment-info.json");
  console.log("\n🎉 Deployment complete!");
  console.log("\n📋 Next steps:");
  console.log("1. Copy the contract address to your .env files");
  console.log("2. Copy the ABI from artifacts/contracts/Attestify.sol/Attestify.json");
  console.log("3. Update backend/src/config/contractABI.json with the ABI");
  console.log("4. Update frontend .env with VITE_CONTRACT_ADDRESS");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
