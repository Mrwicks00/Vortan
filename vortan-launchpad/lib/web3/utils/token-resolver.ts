import { CONTRACT_ADDRESSES } from "../config/addresses";

export type BaseTokenType = "USDC" | "SOMI";

export const BASE_TOKEN_ADDRESSES = {
  USDC: CONTRACT_ADDRESSES.USDC_TOKEN,
  SOMI: CONTRACT_ADDRESSES.SOMI_TOKEN,
} as const;

export const BASE_TOKEN_DECIMALS = {
  USDC: 6, // USDC typically has 6 decimals
  SOMI: 18, // SOMI has 18 decimals
} as const;

// Resolve base token string to contract address
export function resolveBaseTokenAddress(baseToken: BaseTokenType): string {
  return BASE_TOKEN_ADDRESSES[baseToken];
}

// Get base token decimals
export function getBaseTokenDecimals(baseToken: BaseTokenType): number {
  return BASE_TOKEN_DECIMALS[baseToken];
}

// Convert price to contract format (numerator/denominator)
export function convertPriceToFraction(
  price: string,
  baseToken: BaseTokenType
): { num: bigint; den: bigint } {
  const tokensPerBase = parseFloat(price);

  // If user enters "50", it means 1 base token = 50 sale tokens
  // Contract expects: priceNum / priceDen = tokensPerBase
  // So: priceNum = tokensPerBase, priceDen = 1

  // Use simple integers for better precision
  const numerator = BigInt(Math.floor(tokensPerBase * 1000000)); // Use 1M as base for precision
  const denominator = BigInt(1000000);

  return { num: numerator, den: denominator };
}

// Convert amount to wei (for caps and limits)
export function convertToWei(amount: string, baseToken: BaseTokenType): bigint {
  const decimals = getBaseTokenDecimals(baseToken);
  const amountNum = parseFloat(amount);
  return BigInt(Math.floor(amountNum * 10 ** decimals));
}

// Convert timestamp to seconds
export function convertToTimestamp(dateString: string): number {
  return Math.floor(new Date(dateString).getTime() / 1000);
}

// Convert percentage to basis points
export function convertToBasisPoints(percentage: string): number {
  return Math.floor(parseFloat(percentage) * 100);
}
