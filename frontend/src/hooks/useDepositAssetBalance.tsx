import React, { useState, useEffect, useContext } from 'react'
import { BigNumber, ethers } from 'ethers'
import { externalContractsAddressMap } from 'src/configs/externalContracts.config'
import { MockDAI__factory } from '../../generated/factories/MockDAI__factory'
import { useQuery } from 'react-query'
import { ProviderContext, ProviderType } from 'src/context/providerContext'
import { SUPPORTED_CHAINS } from 'src/constants/chains'

function useDepositAssetBalance() {
  const [balance, setBalance] = useState<BigNumber>(BigNumber.from(0))
  const providerContext = useContext(ProviderContext)

  const { isLoading, isError, data, error } = useQuery(['deposit_asset_balance'], () => fetchBalance(providerContext), {
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
    const address = externalContractsAddressMap[providerContext.chainId ?? 31337]['MockDAI']
    const mockDAI = MockDAI__factory.connect(address, providerContext.provider)
    const myAddress = await providerContext.provider.getSigner().getAddress()

    return await mockDAI.balanceOf(myAddress)
  } else {
    return undefined
  }
}

export default useDepositAssetBalance
