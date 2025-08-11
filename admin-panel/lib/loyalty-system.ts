// Loyalty System Implementation
// Core logic for points, rewards, tiers, referrals, gamification, campaigns, cashback

export type LoyaltyTier = 'Bronze' | 'Silver' | 'Gold' | 'Platinum';

export interface LoyaltyProfile {
  customerId: string;
  points: number;
  tier: LoyaltyTier;
  referrals: number;
  cashbackBalance: number;
  birthday: string;
  anniversary: string;
  rewards: string[];
}

export interface LoyaltyAction {
  type: 'purchase' | 'referral' | 'birthday' | 'anniversary' | 'campaign' | 'gamification';
  amount?: number;
  referrerId?: string;
}

export class LoyaltySystem {
  private profiles: Map<string, LoyaltyProfile> = new Map();

  getProfile(customerId: string): LoyaltyProfile | undefined {
    return this.profiles.get(customerId);
  }

  createProfile(profile: LoyaltyProfile) {
    this.profiles.set(profile.customerId, profile);
  }

  addPoints(customerId: string, points: number) {
    const profile = this.profiles.get(customerId);
    if (profile) {
      profile.points += points;
      this.updateTier(profile);
    }
  }

  addReferral(customerId: string) {
    const profile = this.profiles.get(customerId);
    if (profile) {
      profile.referrals += 1;
      this.addPoints(customerId, 50); // Example: 50 points per referral
    }
  }

  addCashback(customerId: string, amount: number) {
    const profile = this.profiles.get(customerId);
    if (profile) {
      profile.cashbackBalance += amount;
    }
  }

  addReward(customerId: string, reward: string) {
    const profile = this.profiles.get(customerId);
    if (profile) {
      profile.rewards.push(reward);
    }
  }

  updateTier(profile: LoyaltyProfile) {
    if (profile.points >= 5000) profile.tier = 'Platinum';
    else if (profile.points >= 2000) profile.tier = 'Gold';
    else if (profile.points >= 1000) profile.tier = 'Silver';
    else profile.tier = 'Bronze';
  }

  handleAction(customerId: string, action: LoyaltyAction) {
    switch (action.type) {
      case 'purchase':
        this.addPoints(customerId, action.amount || 0);
        this.addCashback(customerId, (action.amount || 0) * 0.05); // 5% cashback
        break;
      case 'referral':
        this.addReferral(customerId);
        break;
      case 'birthday':
        this.addReward(customerId, 'Birthday Gift');
        break;
      case 'anniversary':
        this.addReward(customerId, 'Anniversary Gift');
        break;
      case 'campaign':
        this.addReward(customerId, 'Campaign Reward');
        break;
      case 'gamification':
        this.addPoints(customerId, 10); // Example: 10 points for gamification
        break;
    }
  }
}

// Example usage:
// const loyalty = new LoyaltySystem();
// loyalty.createProfile({customerId: '1', points: 0, tier: 'Bronze', referrals: 0, cashbackBalance: 0, birthday: '', anniversary: '', rewards: []});
// loyalty.handleAction('1', {type: 'purchase', amount: 200});
