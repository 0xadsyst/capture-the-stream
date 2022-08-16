import { useQuery } from 'react-query'
import { AggregatorV3Interface__factory } from '../../generated/factories/AggregatorV3Interface__factory'
import { ethers } from 'ethers'
import { ProviderContext } from 'src/context/providerContext'

import { useEffect, useState, useContext } from 'react'

function usePrice(oracle: string | null) {
  const [price, setPrice] = useState<number | undefined>()
  const providerContext = useContext(ProviderContext)

  const { data } = useQuery([oracle + 'price'], () => fetchPrice(providerContext.provider, oracle), {
    refetchInterval: 5000,
    enabled: !!providerContext.provider
  })

  useEffect(() => {
    let price
    if (data?.length) {
      price = data[1].toNumber() / 1e8
    }
    setPrice(price)
  }, [data])

  return price
}

function fetchPrice(provider: ethers.providers.Web3Provider | undefined, oracle: string | null) {
  if (provider && oracle != null) {
    const address = oracle
    const aggregator = AggregatorV3Interface__factory.connect(address, provider)

    return aggregator.latestRoundData()
  } else {
    return null
  }
}

export default usePrice
