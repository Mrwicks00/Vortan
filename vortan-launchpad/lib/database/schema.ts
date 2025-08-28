import { z } from "zod";

// Project metadata schema for database storage
export const ProjectMetadataSchema = z.object({
  id: z.string().uuid(),
  saleAddress: z.string().min(42).max(42), // Contract address
  projectOwner: z.string().min(42).max(42),

  // Basic Info
  name: z.string().min(1).max(100),
  symbol: z.string().min(1).max(10),
  shortDescription: z.string().min(1).max(200),
  longDescription: z.string().min(1).max(2000),

  // Social Links
  website: z.string().url().optional(),
  twitter: z.string().url().optional(),
  discord: z.string().url().optional(),
  medium: z.string().url().optional(),

  // Media Assets
  bannerUrl: z.string().url().optional(),
  logoUrl: z.string().url().optional(),

  // Status & Timestamps
  status: z.enum(["draft", "pending", "live", "ended", "cancelled"]),
  createdAt: z.date(),
  updatedAt: z.date(),

  // On-chain data reference (for verification)
  onChainData: z.object({
    tokenAddress: z.string().min(42).max(42),
    baseToken: z.enum(["USDC", "SOMI"]),
    price: z.string(),
    hardCap: z.string(),
    softCap: z.string(),
    perWalletCap: z.string(),
    tierCapT1: z.string(),
    tierCapT2: z.string(),
    tierCapT3: z.string(),
    startTime: z.number(),
    endTime: z.number(),
    tgeTime: z.number(),
    vestDuration: z.number(),
    tgePercentage: z.number(),
    tokenFee: z.number(),
    feeRecipient: z.string().min(42).max(42),
  }),
});

// User staking data (for caching)
export const UserStakingSchema = z.object({
  id: z.string().uuid(),
  userAddress: z.string().min(42).max(42),

  // VORT Staking
  vortStaking: z.object({
    totalStaked: z.string(),
    totalPoints: z.string(),
    pendingRewards: z.string(),
    positions: z.array(
      z.object({
        amount: z.string(),
        lockEnd: z.number(),
        multBps: z.number(),
      })
    ),
  }),

  // SOMI Staking
  somiStaking: z.object({
    totalStaked: z.string(),
    totalPoints: z.string(),
    pendingRewards: z.string(),
    positions: z.array(
      z.object({
        amount: z.string(),
        lockEnd: z.number(),
        multBps: z.number(),
      })
    ),
  }),

  // Combined tier data
  tierData: z.object({
    combinedPoints: z.string(),
    tier: z.number().min(1).max(3),
    somiWeightBps: z.number(),
  }),

  updatedAt: z.date(),
});

// Sale participation data
export const SaleParticipationSchema = z.object({
  id: z.string().uuid(),
  saleAddress: z.string().min(42).max(42),
  userAddress: z.string().min(42).max(42),

  // Participation details
  amount: z.string(),
  tokensBought: z.string(),
  tier: z.number().min(1).max(3),
  timestamp: z.date(),

  // Claim status
  claimed: z.boolean().default(false),
  claimedAt: z.date().optional(),
});

// Analytics data (for caching)
export const SaleAnalyticsSchema = z.object({
  id: z.string().uuid(),
  saleAddress: z.string().min(42).max(42),

  // Social metrics
  socialMetrics: z.object({
    twitterMentions: z.number(),
    discordMembers: z.number(),
    mediumReads: z.number(),
    sentimentScore: z.number(),
  }),

  // On-chain metrics
  onChainMetrics: z.object({
    totalBuyers: z.number(),
    totalRaised: z.string(),
    averageInvestment: z.string(),
    topInvestors: z.array(z.string()),
  }),

  updatedAt: z.date(),
});

// Type exports
export type ProjectMetadata = z.infer<typeof ProjectMetadataSchema>;
export type UserStaking = z.infer<typeof UserStakingSchema>;
export type SaleParticipation = z.infer<typeof SaleParticipationSchema>;
export type SaleAnalytics = z.infer<typeof SaleAnalyticsSchema>;
