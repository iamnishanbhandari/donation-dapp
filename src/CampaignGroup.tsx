import React from "react";
import { Campaign } from "./types";
import { CampaignGroup, CampaignGrouping } from "./algorithms/CampaignGroups";

interface CampaignGroupsProps {
  campaigns: Campaign[];
  onCampaignClick: (campaign: Campaign) => void;
}

export const CampaignGroups: React.FC<CampaignGroupsProps> = ({
  campaigns,
  onCampaignClick,
}) => {
  React.useEffect(() => {
    CampaignGrouping.initializeGroups(campaigns);
  }, [campaigns]);

  const groups = CampaignGrouping.getGroups();

  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={group.id} className="glass-card p-6 rounded-2xl">
          <h3 className="text-xl font-semibold text-white mb-4">
            {group.name} ({group.campaigns.length} campaigns)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {group.campaigns.map((campaign) => (
              <div
                key={campaign.id}
                onClick={() => onCampaignClick(campaign)}
                className="glass-card p-4 rounded-xl cursor-pointer hover:scale-[1.02] transition-transform duration-200"
              >
                <img
                  src={campaign.image}
                  alt={campaign.title}
                  className="w-full h-32 object-cover rounded-lg mb-3"
                />
                <h4 className="font-medium text-white mb-2">
                  {campaign.title}
                </h4>
                <div className="text-sm text-gray-300">
                  Target: {campaign.target} ETH
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
