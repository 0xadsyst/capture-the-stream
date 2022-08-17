// ** MUI Imports
import Grid from '@mui/material/Grid'
import Button from '@mui/material/Button'

// ** React
import React, { useEffect, useState, useContext } from 'react'

// ** Web3
import { externalContractsAddressMap } from 'src/configs/externalContracts.config'
import { CaptureTheStream__factory } from '../../generated/factories/CaptureTheStream__factory'
import { MockDAI__factory } from '../../generated/factories/MockDAI__factory'
import { ethers } from 'ethers'
import UpdateOracleModal from 'src/components/UpdateOraclePriceModal'
import UpdateWinnerModal from '../components/UpdateWinnerModal'

import { RoundsContext } from 'src/context/roundsContext'
import { ProviderContext } from 'src/context/providerContext'
import { useQuery } from 'react-query'
import usePrice from 'src/hooks/usePrice'

const Test = () => {
  const [testData, setTestData] = useState([<p key={1}>TEST DATA LOADING</p>])
  const [oracles, setOracles] = useState<{ ETH: string | null; BTC: string | null; MATIC: string | null }>({
    ETH: null,
    BTC: null,
    MATIC: null
  })
  const roundsContext = useContext(RoundsContext)
  const providerContext = useContext(ProviderContext)

  const handleMintDAIClick = () => mintDAI(providerContext.provider)
  const handleDAIBalanceClick = () => daiBalance(providerContext.provider).then(v => console.log('DAI balance:', v))
  const handleSetDepositAssetClick = () => setDepositAddress(providerContext.provider)

  const handleEndRoundClick = () => endRound(providerContext.provider)
  const handlePerformUpkeepClick = () => performUpkeep(providerContext.provider)

  const ethPrice = usePrice(oracles.ETH)
  const btcPrice = usePrice(oracles.BTC)
  const maticPrice = usePrice(oracles.MATIC)

  const { isLoading, isError, data, error } = useQuery(['testData'], () => fetchData(providerContext.provider), {
    refetchInterval: 5000,
    enabled: providerContext.provider != undefined
  })

  useEffect(() => {
    if (data) {
      setTestData(data)
    }
  }, [data])

  useEffect(() => {
    if (providerContext.chainId) {
      setOracles({
        ETH: externalContractsAddressMap[providerContext.chainId]['AggregatorV3InterfaceETH'],
        BTC: externalContractsAddressMap[providerContext.chainId]['AggregatorV3InterfaceBTC'],
        MATIC: externalContractsAddressMap[providerContext.chainId]['AggregatorV3InterfaceMATIC']
      })
    }
  }, [providerContext.chainId])

  return (
    <>
      {testData}
      <p key={7}>current network: {providerContext.chainId}</p>
      <p key={8}>ethPrice: {ethPrice}</p>
      <p key={9}>btcPrice: {btcPrice}</p>
      <p key={10}>maticPrice: {maticPrice}</p>
      <Grid container spacing={12}>
        <Grid item>
          <Button variant='contained' onClick={handleMintDAIClick}>
            Mint DAI
          </Button>
          <Button variant='contained' onClick={handleDAIBalanceClick}>
            Get DAI Balance
          </Button>
          <Button variant='contained' onClick={handleSetDepositAssetClick}>
            Set Deposit Asset
          </Button>
          {/* <Button variant='contained' onClick={handleInitiateRoundClick}>
            Initiate Round
          </Button> */}
          <Button variant='contained' onClick={handleEndRoundClick}>
            End Round
          </Button>
          <Button variant='contained' onClick={handlePerformUpkeepClick}>
            Perform Upkeep
          </Button>
          <UpdateOracleModal />
          <UpdateWinnerModal />
        </Grid>
      </Grid>
    </>
  )
}

export default Test

async function mintDAI(provider: ethers.providers.Web3Provider | undefined) {
  console.log('provider:', provider)
  if (provider) {
    const address = externalContractsAddressMap[provider.network.chainId]['MockDAI']
    const myAddress = await provider.getSigner().getAddress()
    const daiContract = MockDAI__factory.connect(address, provider.getSigner())
    const a = ethers.utils.parseUnits('1000', 18)

    return daiContract.mint(myAddress, a)
  } else {
    return Promise.resolve(false)
  }
}

async function daiBalance(provider: ethers.providers.Web3Provider | undefined) {
  console.log('provider:', provider)
  if (provider) {
    const address = externalContractsAddressMap[provider.network.chainId]['MockDAI']
    const myAddress = await provider.getSigner().getAddress()
    const daiContract = MockDAI__factory.connect(address, provider.getSigner())
    const a = ethers.utils.parseUnits('1000', 18)

    return daiContract.balanceOf(myAddress)
  } else {
    return Promise.resolve(false)
  }
}

async function setDepositAddress(provider: ethers.providers.Web3Provider | undefined) {
  console.log('provider:', provider)
  if (provider) {
    const contractAddress = externalContractsAddressMap[provider.network.chainId]['CaptureTheStream']
    const address = externalContractsAddressMap[provider.network.chainId]['MockDAI']
    const captureTheStreamContract = CaptureTheStream__factory.connect(contractAddress, provider.getSigner())

    return captureTheStreamContract.setDepositAsset(address)
  } else {
    return Promise.resolve(false)
  }
}

async function endRound(provider: ethers.providers.Web3Provider | undefined) {
  console.log('provider:', provider)
  if (provider) {
    const address = externalContractsAddressMap[provider.network.chainId]['CaptureTheStream']
    const captureTheStreamContract = CaptureTheStream__factory.connect(address, provider.getSigner())

    return captureTheStreamContract.endRound(0)
  } else {
    return Promise.resolve(false)
  }
}

async function performUpkeep(provider: ethers.providers.Web3Provider | undefined) {
  console.log('provider:', provider)
  if (provider) {
    const address = externalContractsAddressMap[provider.network.chainId]['CaptureTheStream']
    const captureTheStreamContract = CaptureTheStream__factory.connect(address, provider.getSigner())
    const upkeepRequired = await captureTheStreamContract.checkUpkeep(ethers.utils.randomBytes(1))

    return captureTheStreamContract.performUpkeep(upkeepRequired[1])
  } else {
    return Promise.resolve(false)
  }
}

async function fetchData(provider: ethers.providers.Web3Provider | undefined) {
  if (provider) {
    const address = externalContractsAddressMap[provider.network.chainId]['CaptureTheStream']
    const captureTheStream = CaptureTheStream__factory.connect(address, provider)
    const myAddress = await (await provider.getSigner().getAddress()).toString()
    const deposits = await (await captureTheStream.deposits(myAddress)).toString()
    const depositAsset = await (await captureTheStream.depositAsset()).toString()
    const upkeepRequired = await (await captureTheStream.checkUpkeep(ethers.utils.randomBytes(1))).toString()
    const roundCount = await (await captureTheStream.roundCount()).toString()
    
    return [
      <p key={1}>Contract address: {address.toString()}</p>,
      <p key={2}>myAddress: {myAddress}</p>,
      <p key={3}>deposits: {deposits}</p>,
      <p key={4}>depositAsset: {depositAsset}</p>,
      <p key={5}>upkeep: {upkeepRequired}</p>,
      <p key={6}>roundCount: {roundCount}</p>
    ]
  } else {
    return [<p key={2}>LOADING</p>]
  }
}
