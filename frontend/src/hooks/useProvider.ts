import React, { useContext, useState, useEffect } from 'react'
import { useWallets } from '@web3-onboard/react'
import { ethers } from 'ethers'
import { ProviderContext } from 'src/context/providerContext'

export function useProvider() {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | undefined>()
  const [chainId, setChainId] = useState<number | undefined>()
  const providerContext = useContext(ProviderContext)
  const connectedWallets = useWallets()

  useEffect(() => {
    console.log('Updating wallets: ', connectedWallets)
    if (connectedWallets.length > 0) {
      console.log("connectedWallets", connectedWallets)
      setProvider(new ethers.providers.Web3Provider(connectedWallets[0].provider))
      setChainId(parseInt(connectedWallets[0].chains[0].id))
    } else {
      setProvider(undefined)
      setChainId(undefined)
    }
  }, [connectedWallets])

  useEffect(() => {
    if (provider) {
      providerContext.setProvider(provider)
    } else {
      providerContext.setProvider(undefined)
    }
  }, [provider])

  useEffect(() => {
    if (chainId) {
      providerContext.setChainId(chainId)
    } else {
      providerContext.setChainId(undefined)
    }
  }, [chainId])

  return {provider, chainId}
}


export default useProvider
