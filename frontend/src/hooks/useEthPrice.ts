import { useQuery } from 'react-query'
import { AggregatorV3Interface__factory } from '../../generated/factories/AggregatorV3Interface__factory'
import { ethers } from 'ethers'
import { externalContractsAddressMap } from 'src/configs/externalContracts.config'
import { ProviderContext } from 'src/context/providerContext'

import { useEffect, useState, useContext } from 'react'

function useEthPrice() {
  const [ethPrice, setEthPrice] = useState<number | undefined>()
  const providerContext = useContext(ProviderContext)

  const { isLoading, isError, data, error } = useQuery(['eth_price'], () => fetchEthPrice(providerContext.provider), {
    refetchInterval: 5000,
    enabled: !!providerContext.provider
  })

  useEffect(() => {
    let price
    if (data?.length) {
      price = data[1].toNumber() / 1e8
    }
    setEthPrice(price)
  }, [data])

  return ethPrice
}

function fetchEthPrice(provider: ethers.providers.Web3Provider | undefined) {
  if (provider) {
    const address = externalContractsAddressMap[provider.network.chainId]['AggregatorV3InterfaceETH']
    const aggregator = AggregatorV3Interface__factory.connect(address, provider)
    return aggregator.latestRoundData()
  } else {
    return undefined
  }
}

export default useEthPrice
