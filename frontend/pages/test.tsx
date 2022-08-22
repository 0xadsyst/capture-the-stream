// ** MUI Imports
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'

// ** React
import React, { useEffect, useState, useContext } from 'react'

// ** Web3
import { externalContractsAddressMap } from 'src/configs/externalContracts.config'
import { CaptureTheStream__factory } from 'generated/factories/CaptureTheStream__factory'
import { ethers, BigNumber } from 'ethers'
import UpdateOracleModal from 'src/components/UpdateOraclePriceModal'
import useProtocolBalance from 'src/hooks/useProtocolBalance'
import useDepositAssetBalance from 'src/hooks/useDepositAssetBalance'
import usePrice from 'src/hooks/usePrice'
import MintDAI from 'src/components/MintDAI'
import { SUPPORTED_CHAINS } from 'src/constants/chains'

import { useContractRead, useNetwork, useProvider, useSigner, useAccount, useContractReads } from 'wagmi'

const Test = () => {
  const [roundCount, setRoundCount] = useState<number | null>()
  const [depositAsset, setDepositAddress] = useState<string | null>()
  const { data: signer } = useSigner()
  const provider = useProvider()
  const { chain } = useNetwork()
  const { address } = useAccount()
  const [myAddress, setMyAddress] = useState('')
  const [myChain, setMyChain] = useState<number>()
  const [upkeepRequired, setUpkeepRequired] = useState<string>()

  const protocolBalance = useProtocolBalance()
  const depositAssetBalance = useDepositAssetBalance()
  const ethContractAddress = SUPPORTED_CHAINS.includes(myChain ?? 0)
    ? externalContractsAddressMap[myChain ?? 0]['AggregatorV3InterfaceETH']
    : ''
  const btcContractAddress = SUPPORTED_CHAINS.includes(myChain ?? 0)
    ? externalContractsAddressMap[myChain ?? 0]['AggregatorV3InterfaceBTC']
    : ''
  const maticContractAddress = SUPPORTED_CHAINS.includes(myChain ?? 0)
    ? externalContractsAddressMap[myChain ?? 0]['AggregatorV3InterfaceMATIC']
    : ''
  const captureTheStreamContractAddress = SUPPORTED_CHAINS.includes(myChain ?? 0)
    ? externalContractsAddressMap[myChain ?? 0]['CaptureTheStream']
    : ''
  const daiContractAddress = SUPPORTED_CHAINS.includes(myChain ?? 0)
    ? externalContractsAddressMap[myChain ?? 0]['MockDAI']
    : ''

  const ethPrice = usePrice(ethContractAddress)
  const btcPrice = usePrice(btcContractAddress)
  const maticPrice = usePrice(maticContractAddress)

  useEffect(() => {
    address ? setMyAddress(address) : null
    chain ? setMyChain(chain.id) : null
  }, [address, chain])

  const handleSetDepositAssetClick = () =>
    setNewDepositAddress(signer, myChain ?? 31337, captureTheStreamContractAddress, daiContractAddress)
  const handlePerformUpkeepClick = () => performUpkeep(signer, myChain ?? 31337, captureTheStreamContractAddress)

  const depositAssetCall = useContractRead({
    addressOrName: captureTheStreamContractAddress,
    contractInterface: CaptureTheStream__factory.abi,
    functionName: 'depositAsset',
    watch: true
  })

  useEffect(() => {
    if (depositAssetCall.isFetched && depositAssetCall.data && signer) {
      const depositAssetData = depositAssetCall.data.toString() ?? null
      setDepositAddress(depositAssetData.toString())
    }
  }, [depositAssetCall.data, depositAssetCall.isFetched, signer])

  const upkeepCall = useContractRead({
    addressOrName: captureTheStreamContractAddress,
    contractInterface: CaptureTheStream__factory.abi,
    functionName: 'checkUpkeep',
    args: ethers.utils.randomBytes(1),
    watch: true
  })

  useEffect(() => {
    if (upkeepCall.isFetched && upkeepCall.data && signer) {
      const upkeepRequiredData = upkeepCall.data ?? ''
      setUpkeepRequired(upkeepRequiredData.toString())
    }
  }, [upkeepCall.data, upkeepCall.isFetched, signer])

  const roundCountCall = useContractRead({
    addressOrName: captureTheStreamContractAddress,
    contractInterface: CaptureTheStream__factory.abi,
    functionName: 'roundCount',
    watch: true
  })

  useEffect(() => {
    if (roundCountCall.isFetched && roundCountCall.data && signer) {
      const roundCountData = roundCountCall.data ?? null
      setRoundCount(parseInt(roundCountData.toString()))
    }
  }, [roundCountCall.data, roundCountCall.isFetched, signer])

  return (
    <div>
      <p key={1}>Contract address: {captureTheStreamContractAddress}</p>
      <p key={2}>My address: {myAddress}</p>
      <p key={3}>Protocol Balance: {ethers.utils.formatUnits(protocolBalance, 18)}</p>
      <p key={4}>Deposit Asset Balance: {ethers.utils.formatUnits(depositAssetBalance, 18)}</p>
      <p key={5}>Deposit Asset: {depositAsset}</p>
      <p key={6}>Upkeep Required: {upkeepRequired}</p>
      <p key={7}>Round Count: {roundCount}</p>
      <p key={8}>Current Network: {myChain}</p>
      <p key={9}>ETH Price: {ethPrice}</p>
      <p key={10}>BTC Price: {btcPrice}</p>
      <p key={11}>MATIC Price: {maticPrice}</p>
      <Grid container spacing={12}>
        <Grid item>
          <MintDAI signer={signer} chain={myChain ?? 31337} />
          <Button variant='contained' onClick={handleSetDepositAssetClick}>
            Set Deposit Asset
          </Button>
          <Button variant='contained' onClick={handlePerformUpkeepClick}>
            Perform Upkeep
          </Button>
          <UpdateOracleModal />
        </Grid>
      </Grid>
    </div>
  )
}

export default Test

async function setNewDepositAddress(
  signer: any,
  chain: number,
  captureTheStreamContractAddress: string,
  daiContractAddress: string
) {
  if (signer) {
    const contractAddress = captureTheStreamContractAddress
    const address = daiContractAddress
    const captureTheStreamContract = CaptureTheStream__factory.connect(contractAddress, signer)

    return captureTheStreamContract.setDepositAsset(address)
  } else {
    return Promise.resolve(false)
  }
}

async function performUpkeep(signer: any, chain: number, captureTheStreamContractAddress: string) {
  if (signer) {
    const address = captureTheStreamContractAddress
    const captureTheStreamContract = CaptureTheStream__factory.connect(address, signer)
    const upkeepRequired = await captureTheStreamContract.checkUpkeep(ethers.utils.randomBytes(1))

    return captureTheStreamContract.performUpkeep(upkeepRequired[1])
  } else {
    return Promise.resolve(false)
  }
}
