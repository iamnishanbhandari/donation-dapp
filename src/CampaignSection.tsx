import React from "react";
import { Campaign } from "./types";
import { Clock } from "lucide-react";

interface CampaignSectionsProps {
  campaigns: Campaign[];
  onCampaignClick: (campaign: Campaign) => void;
  handleDonate: (campaign: Campaign) => void;
  handleClaimFunds: (campaign: Campaign) => void;
  account: string | null;
  getTimeLeft: (deadline: number) => string;
  isCampaignActive: (campaign: Campaign) => boolean;
  getCampaignStatus: (campaign: Campaign) => string;
}

export function CampaignSections({
  campaigns,
  onCampaignClick,
  handleDonate,
  handleClaimFunds,
  account,
  getTimeLeft,
  isCampaignActive,
  getCampaignStatus,
}: CampaignSectionsProps) {
  // Group campaigns by similarity in target amount
  const groupedCampaigns = campaigns.reduce((groups, campaign) => {
    const target = Number(campaign.target);
    let range = "0-1";
    if (target > 1 && target <= 5) range = "1-5";
    else if (target > 5 && target <= 10) range = "5-10";
    else if (target > 10) range = "10+";

    if (!groups[range]) groups[range] = [];
    groups[range].push(campaign);
    return groups;
  }, {} as Record<string, Campaign[]>);

  const renderCampaign = (campaign: Campaign) => (
    <div
      key={campaign.id}
      className="glass-card rounded-2xl overflow-hidden transition-transform hover:scale-[1.02] duration-200 cursor-pointer"
      onClick={() => onCampaignClick(campaign)}
    >
      <h1>THis is CampaignSections</h1>

      <img
        src={
          campaign.image ||
          "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3"
        }
        alt={campaign.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-6 space-y-4">
        <h3 className="text-lg font-semibold text-white mb-2">
          {campaign.title}
        </h3>
        <p className="text-gray-300 text-sm line-clamp-2">
          {campaign.description}
        </p>

        <div className="flex items-center gap-2 text-sm text-gray-300">
          <Clock className="w-4 h-4 text-purple-400" />
          <span>{getTimeLeft(campaign.deadline)}</span>
        </div>

        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Target</span>
            <span className="text-white font-medium">
              {campaign.target} ETH
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-400">Raised</span>
            <span className="text-white font-medium">
              {campaign.amountCollected} ETH
            </span>
          </div>
          <div className="w-full bg-gray-700/50 rounded-full h-2 mt-2">
            <div
              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-300"
              style={{
                width: `${Math.min(
                  (Number(campaign.amountCollected) / Number(campaign.target)) *
                    100,
                  100
                )}%`,
              }}
            />
          </div>
        </div>

        <div className="pt-4 space-y-3">
          {account?.toLowerCase() === campaign.owner.toLowerCase() &&
            !campaign.claimed &&
            (campaign.deadline * 1000 < Date.now() ||
              Number(campaign.amountCollected) >= Number(campaign.target)) && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleClaimFunds(campaign);
                }}
                className="w-full py-2 px-4 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:opacity-90 transition-all duration-200 shadow-lg shadow-green-500/20"
              >
                <span className="font-medium">Claim Funds</span>
              </button>
            )}

          <button
            className={`w-full py-2 px-4 rounded-xl transition-all duration-200 ${
              !isCampaignActive(campaign)
                ? "bg-gray-700/50 text-gray-400 cursor-not-allowed"
                : "bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:opacity-90 shadow-lg shadow-purple-500/20"
            }`}
            onClick={(e) => {
              e.stopPropagation();
              handleDonate(campaign);
            }}
            disabled={!isCampaignActive(campaign)}
          >
            <span className="font-medium">{getCampaignStatus(campaign)}</span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-12">
      <h1>this is campaing section</h1>
      {Object.entries(groupedCampaigns).map(([range, rangeCampaigns]) => (
        <section key={range}>
          <h2 className="text-2xl font-bold text-white mb-6">
            Campaigns {range} ETH
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rangeCampaigns.map((campaign) => renderCampaign(campaign))}
          </div>
        </section>
      ))}
    </div>
  );
}
