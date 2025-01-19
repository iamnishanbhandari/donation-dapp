import { Campaign } from "../types";

export interface CampaignGroup {
  id: string;
  name: string;
  campaigns: Campaign[];
  averageTarget: number;
  averageDeadline: number;
}

export class CampaignGrouping {
  private static SIMILARITY_THRESHOLD = 0.7; // 70% similarity threshold
  private static groups: CampaignGroup[] = [];

  static initializeGroups(campaigns: Campaign[]): void {
    this.groups = [];
    campaigns.forEach(campaign => {
      this.addCampaignToGroup(campaign);
    });
    this.consolidateGroups();
  }

  static addCampaignToGroup(newCampaign: Campaign): void {
    let maxSimilarity = 0;
    let bestGroupMatch: CampaignGroup | null = null;

    // Check similarity with existing groups
    for (const group of this.groups) {
      const groupSimilarity = this.calculateGroupSimilarity(newCampaign, group);
      if (groupSimilarity > maxSimilarity) {
        maxSimilarity = groupSimilarity;
        bestGroupMatch = group;
      }
    }

    // If similarity threshold is met, add to existing group
    if (maxSimilarity >= this.SIMILARITY_THRESHOLD && bestGroupMatch) {
      bestGroupMatch.campaigns.push(newCampaign);
      this.updateGroupMetrics(bestGroupMatch);
    } else {
      // Create new group
      const newGroup: CampaignGroup = {
        id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: this.generateGroupName(newCampaign),
        campaigns: [newCampaign],
        averageTarget: parseFloat(newCampaign.target),
        averageDeadline: newCampaign.deadline
      };
      this.groups.push(newGroup);
    }
  }

  private static calculateGroupSimilarity(campaign: Campaign, group: CampaignGroup): number {
    const targetSimilarity = this.calculateTargetSimilarity(
      parseFloat(campaign.target),
      group.averageTarget
    );
    
    const deadlineSimilarity = this.calculateDeadlineSimilarity(
      campaign.deadline,
      group.averageDeadline
    );

    const categorySimilarity = this.calculateCategorySimilarity(
      campaign,
      group.campaigns[0]
    );

    // Weighted similarity calculation
    return (
      targetSimilarity * 0.4 +
      deadlineSimilarity * 0.3 +
      categorySimilarity * 0.3
    );
  }

  private static calculateTargetSimilarity(target1: number, target2: number): number {
    const maxTarget = Math.max(target1, target2);
    const difference = Math.abs(target1 - target2);
    return 1 - (difference / maxTarget);
  }

  private static calculateDeadlineSimilarity(deadline1: number, deadline2: number): number {
    const maxTimeframe = 30 * 24 * 60 * 60; 
    const difference = Math.abs(deadline1 - deadline2);
    return 1 - Math.min(difference / maxTimeframe, 1);
  }

  private static calculateCategorySimilarity(campaign1: Campaign, campaign2: Campaign): number {     // For now, we'll use title and description matching
    const words1 = (campaign1.title + " " + campaign1.description).toLowerCase().split(/\s+/);
    const words2 = (campaign2.title + " " + campaign2.description).toLowerCase().split(/\s+/);
    
    const commonWords = words1.filter(word => words2.includes(word));
    return commonWords.length / Math.max(words1.length, words2.length);
  }

  private static updateGroupMetrics(group: CampaignGroup): void {
    group.averageTarget = group.campaigns.reduce(
      (sum, campaign) => sum + parseFloat(campaign.target),
      0
    ) / group.campaigns.length;

    group.averageDeadline = group.campaigns.reduce(
      (sum, campaign) => sum + campaign.deadline,
      0
    ) / group.campaigns.length;
  }

  private static generateGroupName(campaign: Campaign): string {
    return `${campaign.title.split(' ')[0]} Group`;
  }

  private static consolidateGroups(): void {
    let merged: boolean;
    do {
      merged = false;
      for (let i = 0; i < this.groups.length; i++) {
        for (let j = i + 1; j < this.groups.length; j++) {
          const similarity = this.calculateGroupToGroupSimilarity(
            this.groups[i],
            this.groups[j]
          );
          
          if (similarity >= this.SIMILARITY_THRESHOLD) {
            this.groups[i].campaigns.push(...this.groups[j].campaigns);             // Merge groups

            this.updateGroupMetrics(this.groups[i]);
            this.groups.splice(j, 1);
            merged = true;
            break;
          }
        }
        if (merged) break;
      }
    } while (merged);
  }

  private static calculateGroupToGroupSimilarity(group1: CampaignGroup, group2: CampaignGroup): number {
    const targetSimilarity = this.calculateTargetSimilarity(
      group1.averageTarget,
      group2.averageTarget
    );
    
    const deadlineSimilarity = this.calculateDeadlineSimilarity(
      group1.averageDeadline,
      group2.averageDeadline
    );

    return (targetSimilarity + deadlineSimilarity) / 2;
  }

  static getGroups(): CampaignGroup[] {
    return this.groups;
  }

  static getGroupForCampaign(campaignId: number): CampaignGroup | null {
    return this.groups.find(group => 
      group.campaigns.some(campaign => campaign.id === campaignId)
    ) || null;
  }

  static getSimilarCampaigns(campaignId: number, limit: number = 3): Campaign[] {
    const group = this.getGroupForCampaign(campaignId);
    if (!group) return [];

    return group.campaigns
      .filter(campaign => campaign.id !== campaignId)
      .slice(0, limit);
  }
}
