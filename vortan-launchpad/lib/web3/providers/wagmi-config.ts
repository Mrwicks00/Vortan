import { createConfig, http } from "wagmi";
import { somniaTestnet } from "../config/chains";

// Configure wagmi with Somnia Testnet
export const config = createConfig({
  chains: [somniaTestnet],
  transports: {
    [somniaTestnet.id]: http(),
  },
});
