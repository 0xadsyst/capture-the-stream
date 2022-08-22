import React, { useState, useEffect, useContext } from 'react'
import { BigNumber } from 'ethers'
import { externalContractsAddressMap } from 'src/configs/externalContracts.config'
import { MockDAI__factory } from 'generated/factories/MockDAI__factory'
import { useNetwork, useSigner, useAccount, useContractRead } from 'wagmi'
import {SUPPORTED_CHAINS} from 'src/constants/chains'

function useDepositAssetBalance() {
  const [balance, setBalance] = useState<BigNumber>(BigNumber.from(0))
  const { data: signer } = useSigner()
  const { chain } = useNetwork()
  const { address } = useAccount()
  const [myAddress, setMyAddress] = useState('')
  const [myChain, setMyChain] = useState<number>()

  useEffect(() => {
    address ? setMyAddress(address) : null
    chain ? setMyChain(chain.id) : null
  }, [address, chain])

  const contractAddress = SUPPORTED_CHAINS.includes(myChain ?? 0) ? externalContractsAddressMap[myChain ?? 0]['MockDAI'] : ''

  const balanceCall = useContractRead({
    addressOrName: contractAddress,
    contractInterface: MockDAI__factory.abi,
    functionName: 'balanceOf',
    args: myAddress,
    watch: true
  })

  useEffect(() => {
    if (balanceCall.isFetched && balanceCall.data && signer && BigNumber.isBigNumber(balanceCall.data)) {
      const bal = balanceCall.data ?? BigNumber.from(0)
      setBalance(bal)
    }
  }, [balanceCall.data, balanceCall.isFetched, signer])

  return balance
}

export default useDepositAssetBalance
