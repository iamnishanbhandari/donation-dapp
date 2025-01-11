import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";

// Replace with your deployed contract address and ABI
const CONTRACT_ADDRESS = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; // Example local hardhat address
const CONTRACT_ABI = [
  "function createCampaign(string memory _title, string memory _description, uint256 _target, uint256 _deadline, string memory _image) public returns (uint256)",
  "function donateToCampaign(uint256 _id) public payable",
  "function getCampaign(uint256 _id) public view returns (address owner, string memory title, string memory description, uint256 target, uint256 deadline, uint256 amountCollected, string memory image, bool claimed)",
  "function numberOfCampaigns() public view returns (uint256)",
  "function claimFunds(uint256 _id) public",
];

interface Web3ContextType {
  account: string | null;
  contract: ethers.Contract | null;
  connectWallet: () => Promise<void>;
  createCampaign: (
    title: string,
    description: string,
    target: string,
    deadline: number,
    image: string
  ) => Promise<void>;
  getCampaigns: () => Promise<any[]>;
  donateToCampaign: (id: number, amount: string) => Promise<void>;
  claimFunds: (id: number) => Promise<void>;
}

const Web3Context = createContext<Web3ContextType | null>(null);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", handleAccountsChanged);
      window.ethereum.on("chainChanged", () => window.location.reload());
    }
    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener(
          "accountsChanged",
          handleAccountsChanged
        );
      }
    };
  }, []);

  const handleAccountsChanged = (accounts: string[]) => {
    if (accounts.length === 0) {
      setAccount(null);
      setContract(null);
    } else if (accounts[0] !== account) {
      setAccount(accounts[0]);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to use this application");
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      const signer = await provider.getSigner();

      const crowdFundingContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        CONTRACT_ABI,
        signer
      );

      setAccount(accounts[0]);
      setContract(crowdFundingContract);
    } catch (error) {
      console.error("Failed to connect wallet:", error);
      alert("Failed to connect wallet. Please try again.");
    }
  };

  const createCampaign = async (
    title: string,
    description: string,
    target: string,
    deadline: number,
    image: string
  ) => {
    try {
      if (!contract) throw new Error("Contract not initialized");

      const parsedAmount = ethers.parseEther(target);
      const tx = await contract.createCampaign(
        title,
        description,
        parsedAmount,
        deadline,
        image
      );
      await tx.wait();
    } catch (error) {
      console.error("Failed to create campaign:", error);
      throw error;
    }
  };

  const getCampaigns = async () => {
    try {
      if (!contract) throw new Error("Contract not initialized");

      const numberOfCampaigns = await contract.numberOfCampaigns();
      const campaigns = [];

      for (let i = 0; i < Number(numberOfCampaigns); i++) {
        const campaign = await contract.getCampaign(i);
        campaigns.push({
          id: i,
          owner: campaign[0],
          title: campaign[1],
          description: campaign[2],
          target: ethers.formatEther(campaign[3]),
          deadline: Number(campaign[4]),
          amountCollected: ethers.formatEther(campaign[5]),
          image: campaign[6],
          claimed: campaign[7],
        });
      }

      return campaigns;
    } catch (error) {
      console.error("Failed to fetch campaigns:", error);
      throw error;
    }
  };

  const donateToCampaign = async (id: number, amount: string) => {
    try {
      if (!contract) throw new Error("Contract not initialized");

      const parsedAmount = ethers.parseEther(amount);
      const tx = await contract.donateToCampaign(id, { value: parsedAmount });
      await tx.wait();
    } catch (error) {
      console.error("Failed to donate:", error);
      throw error;
    }
  };

  const claimFunds = async (id: number) => {
    try {
      if (!contract) throw new Error("Contract not initialized");

      const tx = await contract.claimFunds(id);
      await tx.wait();
    } catch (error) {
      console.error("Failed to claim funds:", error);
      throw error;
    }
  };

  const isCampaignActive = (campaign: Campaign) => {
    return !campaign.claimed && campaign.deadline * 1000 > Date.now();
  };

  return (
    <Web3Context.Provider
      value={{
        account,
        contract,
        connectWallet,
        createCampaign,
        getCampaigns,
        donateToCampaign,
        claimFunds,
      }}
    >
      {children}
    </Web3Context.Provider>
  );
}

export function useWeb3() {
  const context = useContext(Web3Context);
  if (!context) {
    throw new Error("useWeb3 must be used within a Web3Provider");
  }
  return context;
}
