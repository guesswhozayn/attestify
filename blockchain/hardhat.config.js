const path = require("path");
require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();
require("dotenv").config({ path: path.resolve(__dirname, "../server/.env") });

const deployerKey = process.env.PRIVATE_KEY || process.env.ADMIN_PRIVATE_KEY;

module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      evmVersion: "cancun",
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  },

  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL || "",
      accounts: deployerKey ? [deployerKey] : [],
      chainId: 11155111
    },

    localhost: {
      url: "http://127.0.0.1:8545"
    }
  },

  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY || ""
  },

  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./cache",
    artifacts: "./artifacts"
  }
};
