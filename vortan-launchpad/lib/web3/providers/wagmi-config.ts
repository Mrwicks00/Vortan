import { getDefaultConfig } from "@rainbow-me/rainbowkit";
import { somniaTestnet } from "../config/chains";

// Configure chains for RainbowKit - Only Somnia Testnet
export const config = getDefaultConfig({
  appName: "Vortan Launchpad",
  projectId:
    process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "YOUR_PROJECT_ID",
  chains: [somniaTestnet],
});
