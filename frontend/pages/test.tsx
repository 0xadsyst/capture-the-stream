// ** MUI Imports
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'

// ** React
import React, { useEffect, useState, useContext } from 'react'

// ** Web3
import { externalContractsAddressMap } from '../src/configs/externalContracts.config'
import { CaptureTheStream__factory } from '../generated/factories/CaptureTheStream__factory'
import { MockDAI__factory } from '../generated/factories/MockDAI__factory'
import { AggregatorV3Interface__factory } from '../generated/factories/AggregatorV3Interface__factory'
import { ethers, BigNumber } from 'ethers'
import UpdateOracleModal from '../src/components/UpdateOraclePriceModal'
import UpdateWinnerModal from '../src/components/UpdateWinnerModal'

import { useContractRead, useNetwork, useProvider, useSigner, useAccount, useContractReads } from 'wagmi'

const Test = () => {
  const [ethPrice, setEthPrice] = useState(0)
  const [btcPrice, setBtcPrice] = useState(0)
  const [maticPrice, setMaticPrice] = useState(0)
  const [protocolBalance, setProtocolBalance] = useState(0)
  const [depositAssetBalance, setDepositAssetBalance] = useState(0)
  const [roundCount, setRoundCount] = useState<number | null>()
  const { data: signer} = useSigner()
  const provider  = useProvider()
  const { chain } = useNetwork()
  const { address } = useAccount()
  const [myAddress, setMyAddress] = useState('')
  const [myChain, setMyChain] = useState<number>()
  const [upkeepRequired, setUpkeepRequired] = useState<string>()

  useEffect(() =>{
    address ? setMyAddress(address) : null
    chain ? setMyChain(chain.id) : null
  },[address, chain])

  const handleMintDAIClick = () => mintDAI(signer, myChain ?? 31337)
  const handleSetDepositAssetClick = () => setDepositAddress(signer, myChain ?? 31337)
  const handlePerformUpkeepClick = () => performUpkeep(signer, myChain ?? 31337)

  const protocolBalanceCall = useContractRead({
    addressOrName: externalContractsAddressMap[myChain ?? 31337]['CaptureTheStream'],
    contractInterface: CaptureTheStream__factory.abi,
    functionName: 'deposits',
    args: myAddress,
    watch: true
  })

  useEffect(() => {
    if (protocolBalanceCall.isFetched && protocolBalanceCall.data && signer && BigNumber.isBigNumber(protocolBalanceCall.data)) {
        const bal: BigNumber = protocolBalanceCall.data ?? BigNumber.from(0)
        setProtocolBalance(parseFloat(ethers.utils.formatUnits(bal, 18)))
      }
  }, [protocolBalanceCall.data, protocolBalanceCall.isFetched, signer])

  const upkeepCall = useContractRead({
    addressOrName: externalContractsAddressMap[myChain ?? 31337]['CaptureTheStream'],
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
    addressOrName: externalContractsAddressMap[myChain ?? 31337]['CaptureTheStream'],
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

  const depositAssetBalanceCall = useContractRead({
    addressOrName: externalContractsAddressMap[myChain ?? 31337]['MockDAI'],
    contractInterface: MockDAI__factory.abi,
    functionName: 'balanceOf',
    args: myAddress,
    watch: true
  })

  useEffect(() => {
    if (depositAssetBalanceCall.isFetched && depositAssetBalanceCall.data && signer && BigNumber.isBigNumber(depositAssetBalanceCall.data)) {
      const bal: BigNumber = depositAssetBalanceCall.data ?? BigNumber.from(0)
      setDepositAssetBalance(parseFloat(ethers.utils.formatUnits(bal, 18)))
    }
  }, [depositAssetBalanceCall.data, depositAssetBalanceCall.isFetched, signer])


  const EthPriceCall = useContractRead({
    addressOrName: externalContractsAddressMap[myChain ?? 31337]['AggregatorV3InterfaceETH'],
    contractInterface: AggregatorV3Interface__factory.abi,
    functionName: 'latestRoundData',
    watch: true
  })

  useEffect(() => {
    if (EthPriceCall.isFetched && EthPriceCall.data) {
      setEthPrice(EthPriceCall.data[1].toNumber() / 1e8 ?? 0)
    }
  }, [EthPriceCall.data, EthPriceCall.isFetched])

  const BtcPriceCall = useContractRead({
    addressOrName: externalContractsAddressMap[myChain ?? 31337]['AggregatorV3InterfaceBTC'],
    contractInterface: AggregatorV3Interface__factory.abi,
    functionName: 'latestRoundData',
    watch: true
  })

  useEffect(() => {
    if (BtcPriceCall.isFetched && BtcPriceCall.data) {
      setBtcPrice(BtcPriceCall.data[1].toNumber() / 1e8 ?? 0)
    }
  }, [BtcPriceCall.data, BtcPriceCall.isFetched])

  const MaticPriceCall = useContractRead({
    addressOrName: externalContractsAddressMap[myChain ?? 31337]['AggregatorV3InterfaceMATIC'],
    contractInterface: AggregatorV3Interface__factory.abi,
    functionName: 'latestRoundData',
    watch: true
  })

  useEffect(() => {
    if (MaticPriceCall.isFetched && MaticPriceCall.data) {
      setMaticPrice(MaticPriceCall.data[1].toNumber() / 1e8 ?? 0)
    }
  }, [MaticPriceCall.data, MaticPriceCall.isFetched])

  return (
    <div>
      <p key={1}>Contract address: {externalContractsAddressMap[myChain ?? 31337]['CaptureTheStream']}</p>
      <p key={2}>My address: {myAddress}</p>
      <p key={3}>Protocol Balance: {protocolBalance}</p>
      <p key={"3a"}>Deposit Asset Balance: {depositAssetBalance}</p>
      <p key={4}>Deposit Asset: {externalContractsAddressMap[myChain ?? 31337]['MockDAI']}</p>
      <p key={5}>Upkeep Required: {upkeepRequired}</p>
      <p key={6}>Round Count: {roundCount}</p>
      <p key={7}>Current Network: {myChain}</p>
      <p key={8}>ETH Price: {ethPrice}</p>
      <p key={9}>BTC Price: {btcPrice}</p>
      <p key={10}>MATIC Price: {maticPrice}</p>
      <Grid container spacing={12}>
        <Grid item>
          <Button variant='contained' onClick={handleMintDAIClick}>
            Mint DAI
          </Button>
          <Button variant='contained' onClick={handleSetDepositAssetClick}>
            Set Deposit Asset
          </Button>
          <Button variant='contained' onClick={handlePerformUpkeepClick}>
            Perform Upkeep
          </Button>
          <UpdateOracleModal />
          <UpdateWinnerModal />
        </Grid>
      </Grid>
    </div>
  )
}

export default Test

async function mintDAI(signer: any, chain: number) {
  if (signer) {
    const address = externalContractsAddressMap[chain]['MockDAI']
    const myAddress = signer._address
    const daiContract = MockDAI__factory.connect(address, signer)
    const amount = ethers.utils.parseUnits('1000', 18)

    return daiContract.mint(myAddress, amount)
  } else {
    return Promise.resolve(false)
  }
}

async function setDepositAddress(signer: any, chain: number) {
  if (signer) {
    const contractAddress = externalContractsAddressMap[chain]['CaptureTheStream']
    const address = externalContractsAddressMap[chain]['MockDAI']
    const captureTheStreamContract = CaptureTheStream__factory.connect(contractAddress, signer)

    return captureTheStreamContract.setDepositAsset(address)
  } else {
    return Promise.resolve(false)
  }
}

async function performUpkeep(signer: any, chain: number) {
  if (signer) {
    const address = externalContractsAddressMap[chain]['CaptureTheStream']
    const captureTheStreamContract = CaptureTheStream__factory.connect(address, signer)
    const upkeepRequired = await captureTheStreamContract.checkUpkeep(ethers.utils.randomBytes(1))

    return captureTheStreamContract.performUpkeep(upkeepRequired[1])
  } else {
    return Promise.resolve(false)
  }
}
