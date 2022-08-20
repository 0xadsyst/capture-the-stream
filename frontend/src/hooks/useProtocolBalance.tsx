import React, { useState, useEffect, useContext } from 'react'
import { BigNumber } from 'ethers'
import { externalContractsAddressMap } from 'src/configs/externalContracts.config'
import { CaptureTheStream__factory } from 'generated/factories/CaptureTheStream__factory'
import { useNetwork, useSigner, useAccount, useContractRead } from 'wagmi'

function useProtocolBalance() {
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

  const balanceCall = useContractRead({
    addressOrName: externalContractsAddressMap[myChain ?? 31337]['CaptureTheStream'],
    contractInterface: CaptureTheStream__factory.abi,
    functionName: 'deposits',
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

export default useProtocolBalance
