import React, { useContext, useState } from 'react'
import { useEffect } from 'react'
import { useWallets } from '@web3-onboard/react'
import { ethers } from 'ethers'
import { ProviderContext, ProviderType } from 'src/context/providerContext'

export function useProvider() {
  const [provider, setProvider] = useState<ethers.providers.Web3Provider | undefined>()
  const providerContext = useContext(ProviderContext)
  const connectedWallets = useWallets()

  useEffect(() => {
    console.log('Updating wallets: ', connectedWallets)
    if (connectedWallets.length > 0) {
      setProvider(new ethers.providers.Web3Provider(connectedWallets[0].provider))
    } else {
      setProvider(undefined)
    }
    console.log("New provider:", provider)
    providerContext.setProvider(provider)

  }, [connectedWallets])

  return provider
}


export default useProvider
