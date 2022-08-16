import { createContext } from "react";
import { ethers } from 'ethers'

export interface ProviderType {
  provider: ethers.providers.Web3Provider | undefined
  setProvider: (provider: ethers.providers.Web3Provider | undefined) => void
  chainId: number | undefined
  setChainId: (chainId: number | undefined) => void
}

export const ProviderContext = createContext<ProviderType>({
  provider: undefined,
  setProvider: () => null,
  chainId: undefined,
  setChainId: () => null
});

