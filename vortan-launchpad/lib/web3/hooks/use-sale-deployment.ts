"use client";

import { useCallback, useState, useEffect } from "react";
import { useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { SALE_FACTORY_ABI } from "../abis/sale-factory";
import { CONTRACT_ADDRESSES } from "../config/addresses";
import {
  resolveBaseTokenAddress,
  convertPriceToFraction,
  convertToWei,
  convertToTimestamp,
  convertToBasisPoints,
  BaseTokenType,
} from "../utils/token-resolver";

interface SaleDeploymentParams {
  // Token info
  saleToken: string;
  baseToken: BaseTokenType;
  price: string;

  // Timing
  startTime: string;
  endTime: string;
  tgeTime: string;
  tgePercentage: string;
  vestDuration: string; // in months

  // Caps
  hardCap: string;
  softCap: string;
  perWalletCap: string;
  tierCapT1: string;
  tierCapT2: string;
  tierCapT3: string;

  // Owner
  projectOwner: string;
}

// Platform-controlled constants
const PLATFORM_FEE_BPS = 500; // 5% in basis points
const FEE_RECIPIENT = "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266";

export function useSaleDeployment() {
  const [isDeploying, setIsDeploying] = useState(false);
  const [deploymentError, setDeploymentError] = useState<string | null>(null);
  const [saleAddress, setSaleAddress] = useState<string | null>(null);

  const { writeContract, data: deployHash } = useWriteContract();

  const {
    isLoading: isDeployPending,
    isSuccess: isDeploySuccess,
    data: receipt,
  } = useWaitForTransactionReceipt({
    hash: deployHash,
  });

  // Extract sale address from transaction receipt when transaction is confirmed
  useEffect(() => {
    if (receipt && isDeploySuccess) {
      // Look for SaleCreated event in the transaction logs
      const saleCreatedEvent = receipt.logs.find((log) => {
        // Check if this log is from the SaleFactory contract
        return (
          log.address.toLowerCase() ===
          CONTRACT_ADDRESSES.SALE_FACTORY.toLowerCase()
        );
      });

      if (
        saleCreatedEvent &&
        saleCreatedEvent.topics &&
        saleCreatedEvent.topics[1]
      ) {
        // Decode the event data to get the sale address
        // The SaleCreated event has: (address sale, address saleToken, address baseToken, address projectOwner)
        // The sale address is the first topic (indexed parameter)
        const saleAddr = `0x${saleCreatedEvent.topics[1].slice(26)}`; // Remove the 0x and first 24 characters
        setSaleAddress(saleAddr);
      }
    }
  }, [receipt, isDeploySuccess]);

  const deploySale = useCallback(
    async (params: SaleDeploymentParams) => {
      try {
        setIsDeploying(true);
        setDeploymentError(null);

        // Resolve base token address
        const baseTokenAddress = resolveBaseTokenAddress(params.baseToken);

        // Convert price to fraction
        const { num: priceNum, den: priceDen } = convertPriceToFraction(
          params.price,
          params.baseToken
        );

        // Convert timestamps
        const startTime = BigInt(convertToTimestamp(params.startTime));
        const endTime = BigInt(convertToTimestamp(params.endTime));
        const tgeTime = BigInt(convertToTimestamp(params.tgeTime));
        const vestStart = tgeTime; // Vesting starts at TGE
        const vestDuration = BigInt(
          parseInt(params.vestDuration) * 30 * 24 * 60 * 60
        ); // Convert months to seconds

        // Convert percentages
        const tgeBps = convertToBasisPoints(params.tgePercentage);

        // Convert amounts to wei
        const hardCapBase = convertToWei(params.hardCap, params.baseToken);
        const softCapBase = convertToWei(params.softCap, params.baseToken);
        const perWalletCapBase = convertToWei(
          params.perWalletCap,
          params.baseToken
        );
        const tier1CapBase = convertToWei(params.tierCapT1, params.baseToken);
        const tier2CapBase = convertToWei(params.tierCapT2, params.baseToken);
        const tier3CapBase = convertToWei(params.tierCapT3, params.baseToken);

        // Call SaleFactory.createSale
        // Note: feeTokenBps and feeRecipient are handled by the SaleFactory contract
        // Platform fee is fixed at 5% (500 basis points) and goes to the platform treasury
        await writeContract({
          address: CONTRACT_ADDRESSES.SALE_FACTORY as `0x${string}`,
          abi: SALE_FACTORY_ABI,
          functionName: "createSale",
          args: [
            {
              saleToken: params.saleToken as `0x${string}`,
              baseToken: baseTokenAddress as `0x${string}`,
              priceNum: priceNum,
              priceDen: priceDen,
              start: startTime,
              end: endTime,
              tgeTime: tgeTime,
              tgeBps: tgeBps,
              vestStart: vestStart,
              vestDuration: vestDuration,
              hardCapBase: hardCapBase,
              softCapBase: softCapBase,
              perWalletCapBase: perWalletCapBase,
              tier1CapBase: tier1CapBase,
              tier2CapBase: tier2CapBase,
              tier3CapBase: tier3CapBase,
              tierOracle: CONTRACT_ADDRESSES.TIER_AGGREGATOR as `0x${string}`,
              projectOwner: params.projectOwner as `0x${string}`,
            },
          ],
        });

        // Return a placeholder - the actual transaction hash will be available in deployHash state
        // The actual sale address will be extracted from the transaction receipt
        return "pending";
      } catch (error) {
        console.error("Sale deployment error:", error);
        setDeploymentError(
          error instanceof Error ? error.message : "Failed to deploy sale"
        );
        throw error;
      } finally {
        setIsDeploying(false);
      }
    },
    [writeContract]
  );

  return {
    deploySale,
    isDeploying,
    isDeployPending,
    isDeploySuccess,
    deploymentError,
    deployHash,
    saleAddress,
  };
}
