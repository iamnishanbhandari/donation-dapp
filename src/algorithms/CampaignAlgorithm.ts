import { Campaign } from "../types";

export interface SimilarityScore {
  score: number;
  details: {
    target: number;
    deadline: number;
    progress: number;
  };
}

export interface CampaignWithSimilarity extends Campaign {
  similarityScores?: {
    [key: number]: SimilarityScore;  // Campaign ID -> Similarity Score
  };
  topSimilar?: number[];  // Array of campaign IDs, sorted by similarity
}

export class CampaignAlgorithms {
  static findSimilarCampaigns(campaigns: Campaign[], targetCampaign: Campaign, limit = 3): CampaignWithSimilarity[] {
    if (!Array.isArray(campaigns) || campaigns.length === 0) {
      return [];
    }

    // Calculate similarity scores for the target campaign
    const campaignWithScores = this.calculateSimilarityScores(targetCampaign, campaigns);
    
    // Get the top similar campaigns
    const topSimilar = campaignWithScores.topSimilar || [];
    
    return topSimilar
      .slice(0, limit)
      .map(id => {
        const campaign = campaigns.find(c => c.id === id);
        if (!campaign) return null;
        return {
          ...campaign,
          similarityScore: campaignWithScores.similarityScores?.[id]?.score || 0,
          similarityDetails: campaignWithScores.similarityScores?.[id]?.details
        };
      })
      .filter((c): c is CampaignWithSimilarity => c !== null);
  }

  static calculateSimilarityScores(campaign: Campaign, allCampaigns: Campaign[]): CampaignWithSimilarity {
    const similarityScores: { [key: number]: SimilarityScore } = {};

    // Calculate similarity with all other campaigns
    allCampaigns.forEach(otherCampaign => {
      if (campaign.id === otherCampaign.id) return;

      const details = {
        target: this.calculateTargetSimilarity(campaign, otherCampaign),
        deadline: this.calculateDeadlineSimilarity(campaign, otherCampaign),
        progress: this.calculateProgressSimilarity(campaign, otherCampaign)
      };

      const score = (details.target + details.deadline + details.progress) / 3;

      similarityScores[otherCampaign.id] = {
        score,
        details
      };
    });

    // Sort campaigns by similarity score
    const topSimilar = Object.entries(similarityScores)
      .sort(([, a], [, b]) => b.score - a.score)
      .map(([id]) => parseInt(id));

    return {
      ...campaign,
      similarityScores,
      topSimilar
    };
  }

  private static calculateTargetSimilarity(campaign1: Campaign, campaign2: Campaign): number {
    const target1 = parseFloat(campaign1.target);
    const target2 = parseFloat(campaign2.target);
    const maxTarget = Math.max(target1, target2);
    const difference = Math.abs(target1 - target2);
    return 1 - (difference / maxTarget);
  }

  private static calculateDeadlineSimilarity(campaign1: Campaign, campaign2: Campaign): number {
    const maxTimeframe = 30 * 24 * 60 * 60; // 30 days in seconds
    const difference = Math.abs(campaign1.deadline - campaign2.deadline);
    return 1 - Math.min(difference / maxTimeframe, 1);
  }

  private static calculateProgressSimilarity(campaign1: Campaign, campaign2: Campaign): number {
    const progress1 = parseFloat(campaign1.amountCollected) / parseFloat(campaign1.target);
    const progress2 = parseFloat(campaign2.amountCollected) / parseFloat(campaign2.target);
    return 1 - Math.abs(progress1 - progress2);
  }

  static explainSimilarity(campaign1: Campaign, campaign2: Campaign): string {
    const details = {
      target: this.calculateTargetSimilarity(campaign1, campaign2),
      deadline: this.calculateDeadlineSimilarity(campaign1, campaign2),
      progress: this.calculateProgressSimilarity(campaign1, campaign2)
    };

    return `
      These campaigns are similar because:
      ${details.target > 0.8 ? '- They have very similar target amounts\n' : ''}
      ${details.deadline > 0.8 ? '- Their deadlines are close to each other\n' : ''}
      ${details.progress > 0.8 ? '- They have similar progress rates\n' : ''}
      
      Similarity Breakdown:
      - Target Amount Match: ${(details.target * 100).toFixed(1)}%
      - Deadline Match: ${(details.deadline * 100).toFixed(1)}%
      - Progress Match: ${(details.progress * 100).toFixed(1)}%
    `;
  }
}
