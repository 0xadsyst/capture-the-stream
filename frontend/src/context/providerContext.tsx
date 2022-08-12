import { createContext } from "react";
import { ethers } from 'ethers'

export interface ProviderType {
  provider: ethers.providers.Web3Provider | undefined
  setProvider: () => void
}

export const ProviderContext = createContext<ProviderType>({
  provider: undefined,
  setProvider: () => null
});

