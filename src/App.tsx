import React, { useEffect, useState } from "react";
import { useWeb3 } from "./context/Web3Context";
import { PlusCircle, Wallet, Clock, Target, AlertCircle } from "lucide-react";

interface Campaign {
  id: number;
  owner: string;
  title: string;
  description: string;
  target: string;
  deadline: number;
  amountCollected: string;
  image: string;
  claimed: boolean;
}

function App() {
  const {
    account,
    connectWallet,
    createCampaign,
    getCampaigns,
    donateToCampaign,
    claimFunds,
  } = useWeb3();
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    target: "",
    deadline: "",
    image: "",
  });

  const getTimeLeft = (deadline: number) => {
    const now = Date.now();
    const timeLeft = deadline * 1000 - now;

    if (timeLeft <= 0) return "Ended";

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor(
      (timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
    );
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m`;
  };

  const handleClaimFunds = async (campaign: Campaign) => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      await claimFunds(campaign.id);
      alert("Funds claimed successfully!");
      await loadCampaigns();
    } catch (err: any) {
      console.error("Failed to claim funds:", err);
      alert(err.message || "Failed to claim funds. Please try again.");
    }
  };

  const loadCampaigns = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getCampaigns();
      setCampaigns(data);
    } catch (err) {
      setError(
        "Failed to load campaigns. Please make sure your wallet is connected."
      );
      setCampaigns([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (account) {
      loadCampaigns();
    }
  }, [account]);

  const handleCreateCampaign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    try {
      const deadline = Math.floor(new Date(formData.deadline).getTime() / 1000);
      await createCampaign(
        formData.title,
        formData.description,
        formData.target,
        deadline,
        formData.image
      );
      setShowForm(false);
      setFormData({
        title: "",
        description: "",
        target: "",
        deadline: "",
        image: "",
      });
      await loadCampaigns();
    } catch (err) {
      console.error("Failed to create campaign:", err);
      alert("Failed to create campaign. Please try again.");
    }
  };

  const handleDonate = async (campaign: Campaign) => {
    if (!account) {
      alert("Please connect your wallet first");
      return;
    }

    if (campaign.claimed) {
      alert("This campaign has ended and funds have been claimed.");
      return;
    }

    if (campaign.deadline * 1000 < Date.now()) {
      alert("This campaign has ended.");
      return;
    }

    const amount = prompt("Enter amount to donate (ETH):");
    if (!amount) return;

    const remainingAmount =
      Number(campaign.target) - Number(campaign.amountCollected);
    if (remainingAmount <= 0) {
      alert("This campaign has reached its target amount.");
      return;
    }

    const donationAmount = parseFloat(amount);
    if (isNaN(donationAmount) || donationAmount <= 0) {
      alert("Please enter a valid donation amount greater than 0 ETH");
      return;
    }
    if (donationAmount > remainingAmount) {
      alert(
        `Maximum donation amount for this campaign is ${remainingAmount} ETH`
      );
      return;
    }

    try {
      await donateToCampaign(campaign.id, amount);
      alert("Thank you for your donation!");
      await loadCampaigns();
    } catch (err) {
      console.error("Donation failed:", err);
      alert("Failed to process donation. Please try again.");
    }
  };

  const isCampaignActive = (campaign: Campaign) => {
    const isNotClaimed = !campaign.claimed;
    const hasNotExpired = campaign.deadline * 1000 > Date.now();
    const hasNotReachedTarget =
      Number(campaign.amountCollected) < Number(campaign.target);
    return isNotClaimed && hasNotExpired && hasNotReachedTarget;
  };

  const getCampaignStatus = (campaign: Campaign) => {
    if (campaign.claimed) return "Campaign Completed";
    if (campaign.deadline * 1000 < Date.now()) return "Deadline Passed";
    if (Number(campaign.amountCollected) >= Number(campaign.target))
      return "Target Reached";
    return "Donate";
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">
            Web3 Crowdfunding
          </h1>
          <div className="flex gap-4">
            {account && (
              <button
                onClick={() => setShowForm(true)}
                className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                <PlusCircle className="w-5 h-5" />
                Create Campaign
              </button>
            )}
            <button
              onClick={connectWallet}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Wallet className="w-5 h-5" />
              {account
                ? `${account.slice(0, 6)}...${account.slice(-4)}`
                : "Connect Wallet"}
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {showForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4">Create New Campaign</h2>
            <form onSubmit={handleCreateCampaign} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Title
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  rows={3}
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Target Amount (ETH)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.target}
                  onChange={(e) =>
                    setFormData({ ...formData, target: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Deadline
                </label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) =>
                    setFormData({ ...formData, deadline: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Image URL
                </label>
                <input
                  type="url"
                  value={formData.image}
                  onChange={(e) =>
                    setFormData({ ...formData, image: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Create Campaign
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {!account && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">
              Please connect your wallet to view campaigns
            </p>
          </div>
        )}

        {account && loading && (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading campaigns...</p>
          </div>
        )}

        {account && error && (
          <div className="text-center py-12 bg-red-50 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        {account && !loading && !error && campaigns.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600">
              No campaigns found. Create one to get started!
            </p>
          </div>
        )}

        {account && !loading && !error && campaigns.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((campaign) => (
              <div
                key={campaign.id}
                className="bg-white rounded-lg shadow-md overflow-hidden"
              >
                <img
                  src={
                    campaign.image ||
                    "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
                  }
                  alt={campaign.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {campaign.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {campaign.description}
                  </p>

                  <div className="flex items-center gap-2 text-sm mb-3">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="font-medium">
                      Time left: {getTimeLeft(campaign.deadline)}
                    </span>
                  </div>

                  <div className="flex justify-between items-center mb-3">
                    <div>
                      <p className="text-sm text-gray-500">Target</p>
                      <div className="flex items-center gap-1">
                        <Target className="w-4 h-4 text-gray-600" />
                        <p className="font-semibold">{campaign.target} ETH</p>
                      </div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Raised</p>
                      <p className="font-semibold text-right">
                        {campaign.amountCollected} ETH
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full"
                        style={{
                          width: `${Math.min(
                            (Number(campaign.amountCollected) /
                              Number(campaign.target)) *
                              100,
                            100
                          )}%`,
                        }}
                      ></div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {account?.toLowerCase() === campaign.owner.toLowerCase() &&
                      !campaign.claimed &&
                      (campaign.deadline * 1000 < Date.now() ||
                        Number(campaign.amountCollected) >=
                          Number(campaign.target)) && (
                        <button
                          onClick={() => handleClaimFunds(campaign)}
                          className="w-full py-2 px-4 rounded-lg bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center justify-center gap-2"
                        >
                          <AlertCircle className="w-4 h-4" />
                          Claim Funds Now
                        </button>
                      )}

                    <button
                      className={`w-full py-2 px-4 rounded-lg transition-colors ${
                        !isCampaignActive(campaign)
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-blue-600 hover:bg-blue-700 text-white"
                      }`}
                      onClick={() => handleDonate(campaign)}
                      disabled={!isCampaignActive(campaign)}
                    >
                      {getCampaignStatus(campaign)}
                    </button>

                    {campaign.claimed && (
                      <div className="text-center py-2 text-green-600 font-medium">
                        ✓ Funds Claimed
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
