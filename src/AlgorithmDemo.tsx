import React, { useEffect, useState } from "react";
import { Campaign } from "./types";
import { CampaignAlgorithms } from "./algorithms/CampaignAlgorithm";

interface AlgorithmDemoProps {
  selectedCampaign: Campaign;
  allCampaigns: Campaign[];
}

interface ScoredCampaign extends Campaign {
  similarityScore?: number;
  scores?: {
    target: number;
    deadline: number;
    progress: number;
  };
}

export function AlgorithmDemo({
  selectedCampaign,
  allCampaigns,
}: AlgorithmDemoProps) {
  const [showDemo, setShowDemo] = useState(false);
  const [scoredCampaigns, setScoredCampaigns] = useState<ScoredCampaign[]>([]);

  useEffect(() => {
    if (selectedCampaign && allCampaigns.length > 0) {
      const similar = CampaignAlgorithms.findSimilarCampaigns(
        allCampaigns,
        selectedCampaign
      );
      setScoredCampaigns(similar);
    }
  }, [selectedCampaign, allCampaigns]);

  if (!showDemo) {
    return (
      <div className="mt-8">
        <button
          onClick={() => setShowDemo(true)}
          className="text-sm text-purple-400 hover:text-purple-300 transition-colors"
        >
          Show Algorithm Details
        </button>
      </div>
    );
  }

  return (
    <div className="mt-8 glass-card p-6 rounded-2xl">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
          Similarity Algorithm Analysis
        </h2>
        <button
          onClick={() => setShowDemo(false)}
          className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
        >
          Hide Details
        </button>
      </div>

      <div className="space-y-6">
        <div className="p-4 bg-gray-800/50 rounded-xl">
          <h3 className="text-white font-medium mb-2">Selected Campaign</h3>
          <div className="grid grid-cols-3 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Target:</span>
              <span className="ml-2 text-white">
                {selectedCampaign.target} ETH
              </span>
            </div>
            <div>
              <span className="text-gray-400">Deadline:</span>
              <span className="ml-2 text-white">
                {new Date(
                  selectedCampaign.deadline * 1000
                ).toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-gray-400">Progress:</span>
              <span className="ml-2 text-white">
                {(
                  (Number(selectedCampaign.amountCollected) /
                    Number(selectedCampaign.target)) *
                  100
                ).toFixed(1)}
                %
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h3 className="text-white font-medium">Similar Campaigns (Ranked)</h3>
          {scoredCampaigns.map((campaign) => (
            <div key={campaign.id} className="p-4 bg-gray-800/50 rounded-xl">
              <div className="flex justify-between items-center mb-2">
                <span className="text-white font-medium">{campaign.title}</span>
                <span className="text-sm text-purple-400">
                  Similarity:{" "}
                  {((campaign.similarityScore || 0) * 100).toFixed(1)}%
                </span>
              </div>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-gray-400">Target:</span>
                  <span className="ml-2 text-white">{campaign.target} ETH</span>
                </div>
                <div>
                  <span className="text-gray-400">Deadline:</span>
                  <span className="ml-2 text-white">
                    {new Date(campaign.deadline * 1000).toLocaleDateString()}
                  </span>
                </div>
                <div>
                  <span className="text-gray-400">Progress:</span>
                  <span className="ml-2 text-white">
                    {(
                      (Number(campaign.amountCollected) /
                        Number(campaign.target)) *
                      100
                    ).toFixed(1)}
                    %
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-sm text-gray-400">
          <h4 className="font-medium text-gray-300 mb-2">
            How the Algorithm Works:
          </h4>
          <ol className="list-decimal list-inside space-y-2">
            <li>
              Calculates target amount similarity (closer targets = higher
              score)
            </li>
            <li>
              Compares campaign deadlines (closer deadlines = higher score)
            </li>
            <li>
              Analyzes funding progress (similar progress percentages = higher
              score)
            </li>
            <li>Combines these factors into a final similarity score</li>
            <li>Ranks campaigns by their similarity scores</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
