import { CampaignCard } from "./CampaignCard";
import { Campaign } from "./types";
import { CampaignAlgorithms } from "./algorithms/CampaignAlgorithm";

interface CampaignGridProps {
  campaigns: Campaign[];
  selectedCampaign: Campaign | null;
  onDonate: (campaign: Campaign) => void;
  onClaim: (campaign: Campaign) => void;
  account: string | null;
  isCampaignActive: (campaign: Campaign) => boolean;
  getCampaignStatus: (campaign: Campaign) => string;
  getTimeLeft: (deadline: number) => string;
}

export function CampaignGrid({
  campaigns,
  selectedCampaign,
  onDonate,
  onClaim,
  account,
  isCampaignActive,
  getCampaignStatus,
  getTimeLeft,
}: CampaignGridProps) {
  // Group campaigns using the new grouping algorithm
  const groupedCampaigns = CampaignAlgorithms.groupSimilarCampaigns(campaigns);

  // Find campaigns that aren't in any group
  const groupedCampaignIds = new Set(
    groupedCampaigns.flat().map((campaign) => campaign.id)
  );
  const otherCampaigns = campaigns.filter(
    (campaign) => !groupedCampaignIds.has(campaign.id)
  );

  return (
    <div className="space-y-12">
      {groupedCampaigns.map((group, index) => (
        <div key={index}>
          <h2 className="text-xl font-semibold mb-6 text-white mt-6">
            Campaign Group {index + 1}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {group.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                allCampaigns={campaigns}
                onDonate={onDonate}
                onClaim={onClaim}
                account={account}
                isCampaignActive={isCampaignActive}
                getCampaignStatus={getCampaignStatus}
                getTimeLeft={getTimeLeft}
              />
            ))}
          </div>
        </div>
      ))}

      {otherCampaigns.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-6 text-white mt-6">
            Other Campaigns
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {otherCampaigns.map((campaign) => (
              <CampaignCard
                key={campaign.id}
                campaign={campaign}
                allCampaigns={campaigns}
                onDonate={onDonate}
                onClaim={onClaim}
                account={account}
                isCampaignActive={isCampaignActive}
                getCampaignStatus={getCampaignStatus}
                getTimeLeft={getTimeLeft}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
