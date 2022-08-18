import React, { useState, useEffect, useContext } from 'react'
import { ethers, BigNumber } from 'ethers'
import { externalContractsAddressMap } from 'src/configs/externalContracts.config'
import { CaptureTheStream__factory } from '../../generated/factories/CaptureTheStream__factory'
import { useQuery } from 'react-query'
import { ProviderContext, ProviderType } from 'src/context/providerContext'
import { SUPPORTED_CHAINS } from 'src/constants/chains'

function useProtocolBalance() {
  const [balance, setBalance] = useState<BigNumber>(BigNumber.from(0))
  const providerContext = useContext(ProviderContext)

  const { isLoading, isError, data, error } = useQuery(['balance'], () => fetchBalance(providerContext), {
    refetchInterval: 5000,
    enabled: providerContext.provider != undefined && SUPPORTED_CHAINS.includes(providerContext.chainId ?? 0)
  })

  useEffect(() => {
    let bal = BigNumber.from(0)
    if (data && providerContext.provider) {
      bal = data
    }
    setBalance(bal)
  }, [data, providerContext.provider])

  return balance
}

async function fetchBalance(providerContext: ProviderType) {
  if (providerContext.provider && providerContext.chainId) {
    const address = externalContractsAddressMap[providerContext.chainId]['CaptureTheStream']
    const captureTheStream = CaptureTheStream__factory.connect(address, providerContext.provider)
    const myAddress = await providerContext.provider.getSigner().getAddress()

    return captureTheStream.deposits(myAddress)
  } else {
    return undefined
  }
}

export default useProtocolBalance
