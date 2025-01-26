import { Campaign } from "../types";

export interface SimilarityScore {
  score: number;
  details: {
    target: number;
    deadline: number;
    category: number;
  };
}

export interface CampaignWithSimilarity extends Campaign {
  similarityScores?: {
    [key: number]: SimilarityScore;  // Campaign ID -> Similarity Score
  };
  topSimilar?: number[];  // Array of campaign IDs, sorted by similarity
  groupId?: number; // Added to track which group the campaign belongs to
}

export class CampaignAlgorithms {
  private static SIMILARITY_THRESHOLD = 0.7;

  static findSimilarCampaigns(campaigns: Campaign[], targetCampaign: Campaign, limit = 3): CampaignWithSimilarity[] {
    if (!Array.isArray(campaigns) || campaigns.length === 0) {
      return [];
    }

    const campaignWithScores = this.calculateSimilarityScores(targetCampaign, campaigns);
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

    allCampaigns.forEach(otherCampaign => {
      if (campaign.id === otherCampaign.id) return;

      const details = {
        target: this.calculateTargetSimilarity(campaign, otherCampaign),
        deadline: this.calculateDeadlineSimilarity(campaign, otherCampaign),
        category: this.calculateCategorySimilarity(campaign, otherCampaign)
      };

      const score = (
        details.target * 0.4 +
        details.deadline * 0.3 +
        details.category * 0.3
      );

      similarityScores[otherCampaign.id] = {
        score,
        details
      };
    });

    const topSimilar = Object.entries(similarityScores)
      .sort(([, a], [, b]) => b.score - a.score)
      .map(([id]) => parseInt(id));

    return {
      ...campaign,
      similarityScores,
      topSimilar
    };
  }

  static groupSimilarCampaigns(campaigns: Campaign[]): Campaign[][] {
    if (!Array.isArray(campaigns) || campaigns.length === 0) {
      return [];
    }

    const campaignsWithSimilarity: CampaignWithSimilarity[] = campaigns.map(c => ({
      ...c,
      similarityScores: {},
      groupId: undefined
    }));

    // Calculate similarity scores between all campaigns
    for (let i = 0; i < campaignsWithSimilarity.length; i++) {
      for (let j = i + 1; j < campaignsWithSimilarity.length; j++) {
        const score = this.calculateOverallSimilarity(
          campaignsWithSimilarity[i],
          campaignsWithSimilarity[j]
        );

        campaignsWithSimilarity[i].similarityScores![campaignsWithSimilarity[j].id] = {
          score,
          details: {
            target: this.calculateTargetSimilarity(campaignsWithSimilarity[i], campaignsWithSimilarity[j]),
            deadline: this.calculateDeadlineSimilarity(campaignsWithSimilarity[i], campaignsWithSimilarity[j]),
            category: this.calculateCategorySimilarity(campaignsWithSimilarity[i], campaignsWithSimilarity[j])
          }
        };

        campaignsWithSimilarity[j].similarityScores![campaignsWithSimilarity[i].id] = {
          score,
          details: {
            target: this.calculateTargetSimilarity(campaignsWithSimilarity[i], campaignsWithSimilarity[j]),
            deadline: this.calculateDeadlineSimilarity(campaignsWithSimilarity[i], campaignsWithSimilarity[j]),
            category: this.calculateCategorySimilarity(campaignsWithSimilarity[i], campaignsWithSimilarity[j])
          }
        };
      }
    }

    // Create groups using a clustering approach
    let currentGroupId = 1;
    const groups: Campaign[][] = [];

    for (const campaign of campaignsWithSimilarity) {
      if (campaign.groupId) continue; // Skip if already in a group

      const currentGroup: Campaign[] = [campaign];
      campaign.groupId = currentGroupId;

      // Find all similar campaigns for the current group
      for (const otherCampaign of campaignsWithSimilarity) {
        if (otherCampaign.groupId || otherCampaign.id === campaign.id) continue;

        // Check if the campaign is similar to ALL campaigns in the current group
        const isSimilarToAll = currentGroup.every(groupCampaign => {
          const similarity = groupCampaign.similarityScores![otherCampaign.id]?.score || 0;
          return similarity >= this.SIMILARITY_THRESHOLD;
        });

        if (isSimilarToAll) {
          currentGroup.push(otherCampaign);
          otherCampaign.groupId = currentGroupId;
        }
      }

      if (currentGroup.length > 1) { // Only add groups with more than one campaign
        groups.push(currentGroup);
        currentGroupId++;
      }
    }

    return groups;
  }

  private static calculateOverallSimilarity(campaign1: Campaign, campaign2: Campaign): number {
    const details = {
      target: this.calculateTargetSimilarity(campaign1, campaign2),
      deadline: this.calculateDeadlineSimilarity(campaign1, campaign2),
      category: this.calculateCategorySimilarity(campaign1, campaign2)
    };

    return (
      details.target * 0.4 +
      details.deadline * 0.3 +
      details.category * 0.3
    );
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

  private static calculateCategorySimilarity(campaign1: Campaign, campaign2: Campaign): number {
    const words1 = (campaign1.title + " " + campaign1.description).toLowerCase().split(/\s+/);
    const words2 = (campaign2.title + " " + campaign2.description).toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  static explainSimilarity(campaign1: Campaign, campaign2: Campaign): string {
    const details = {
      target: this.calculateTargetSimilarity(campaign1, campaign2),
      deadline: this.calculateDeadlineSimilarity(campaign1, campaign2),
      category: this.calculateCategorySimilarity(campaign1, campaign2)
    };

   
  }
}
