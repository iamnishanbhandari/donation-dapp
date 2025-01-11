import React, { createContext, useContext, useEffect, useState } from "react";
import { ethers } from "ethers";
import { useToast } from "@/hooks/use-toast";
import CrowdFundingABI from "../contracts/CrowdFunding.json";
import { CONTRACT_ADDRESS } from "@/contracts/contract-address";

declare global {
  interface Window {
    ethereum: any;
  }
}

export interface Web3ContextType {
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

export const Web3Context = createContext<Web3ContextType | null>(null);

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null);
  const [contract, setContract] = useState<ethers.Contract | null>(null);
  const { toast } = useToast();

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
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask browser extension",
        variant: "destructive",
      });
      return;
    }

    try {
      const provider = new ethers.BrowserProvider(window.ethereum);
      const accounts = await provider.send("eth_requestAccounts", []);
      const signer = await provider.getSigner();
      const contractAddress = CONTRACT_ADDRESS; // Replace after deployment
      const crowdFundingContract = new ethers.Contract(
        contractAddress,
        CrowdFundingABI.abi,
        signer
      );

      setAccount(accounts[0]);
      setContract(crowdFundingContract);

      toast({
        title: "Wallet Connected",
        description: "Successfully connected to MetaMask",
      });
    } catch (error) {
      toast({
        title: "Connection Failed",
        description: "Failed to connect to MetaMask",
        variant: "destructive",
      });
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

      toast({
        title: "Campaign Created",
        description: "Your campaign has been created successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create campaign",
        variant: "destructive",
      });
    }
  };

  const getCampaigns = async () => {
    try {
      if (!contract) throw new Error("Contract not initialized");
      try {
        const numberOfCampaigns = await contract.numberOfCampaigns();
      } catch (err) {
        console.error("This is the error", { cause: err });
      }
      const numberOfCampaigns = 1;
      const campaigns = [];

      for (let i = 0; i < numberOfCampaigns; i++) {
        const campaign = await contract.getCampaign(i);
        campaigns.push({
          id: i,
          owner: campaign.owner,
          title: campaign.title,
          description: campaign.description,
          target: ethers.formatEther(campaign.target),
          deadline: campaign.deadline.toNumber(),
          amountCollected: ethers.formatEther(campaign.amountCollected),
          image: campaign.image,
          claimed: campaign.claimed,
        });
      }

      return campaigns;
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "Failed to fetch campaigns",
        variant: "destructive",
      });
      return [];
    }
  };

  const donateToCampaign = async (id: number, amount: string) => {
    try {
      if (!contract) throw new Error("Contract not initialized");

      const parsedAmount = ethers.parseEther(amount);
      const tx = await contract.donateToCampaign(id, { value: parsedAmount });
      await tx.wait();

      toast({
        title: "Success",
        description: "Donation successful!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to make donation",
        variant: "destructive",
      });
    }
  };

  const claimFunds = async (id: number) => {
    try {
      if (!contract) throw new Error("Contract not initialized");

      const tx = await contract.claimFunds(id);
      await tx.wait();

      toast({
        title: "Success",
        description: "Funds claimed successfully!",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to claim funds",
        variant: "destructive",
      });
    }
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
