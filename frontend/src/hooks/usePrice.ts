import { useQuery } from 'react-query'
import { AggregatorV3Interface__factory } from 'generated/factories/AggregatorV3Interface__factory'
import { ethers } from 'ethers'

import { useContractRead } from 'wagmi'

import { useEffect, useState } from 'react'

function usePrice(oracle: string | null) {
  const [price, setPrice] = useState(0)

  const priceCall = useContractRead({
    addressOrName: oracle ?? '',
    contractInterface: AggregatorV3Interface__factory.abi,
    functionName: 'latestRoundData',
    watch: true
  })

  useEffect(() => {
    if (priceCall.isFetched && priceCall.data) {
      console.log()
      setPrice(priceCall.data[1].toNumber() / 1e8 ?? 0)
    }
  }, [priceCall.data, priceCall.isFetched])

  
  return price
}

export default usePrice
