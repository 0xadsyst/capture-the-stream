import React, { useState, useEffect, useContext } from 'react'
import { ethers } from 'ethers'
import { externalContractsAddressMap } from 'src/configs/externalContracts.config'
import { CaptureTheStream__factory } from '../../generated/factories/CaptureTheStream__factory'
import { useQuery } from 'react-query'
import { ProviderContext } from 'src/context/providerContext'

function useProtocolBalance() {
  const [balance, setBalance] = useState('')
  const providerContext = useContext(ProviderContext)

  const { isLoading, isError, data, error } = useQuery(['balance'], () => fetchBalance(providerContext.provider), {
    refetchInterval: 5000,
    enabled: providerContext.provider != undefined
  })

  useEffect(() => {
    let bal = ''
    if (data && providerContext.provider) {
      bal = parseFloat(ethers.utils.formatUnits(data, 18)).toPrecision(2)
    } else {
      bal = ''
    }
    setBalance(bal)
  }, [data, providerContext.provider])

  return balance
}

async function fetchBalance(provider: ethers.providers.Web3Provider | undefined) {
  if (provider) {
    const address = externalContractsAddressMap[provider.network.chainId]['CaptureTheStream']
    const captureTheStream = CaptureTheStream__factory.connect(address, provider)
    let myAddress = await provider.getSigner().getAddress()
    return captureTheStream.deposits(myAddress)
  } else {
    return undefined
  }
}

export default useProtocolBalance
