// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'

// ** React
import React, { useEffect, useState, useContext } from 'react'

// ** Web3
import { externalContractsAddressMap } from 'src/configs/externalContracts.config'
import { CaptureTheStream__factory } from '../../generated/factories/CaptureTheStream__factory'
import { MockDAI__factory } from '../../generated/factories/MockDAI__factory'
import { ethers } from 'ethers'
import UpdateOracleModal from 'src/components/UpdateOraclePriceModal'

import { RoundsCtx } from 'src/context/roundsContext'
import { ProviderContext } from 'src/context/providerContext'
import { init } from '@web3-onboard/react'
import { useQuery } from 'react-query'

const Test = () => {
  const [testData, setTestData] = useState([<p>TEST DATA LOADING</p>])
  const roundsContext = useContext(RoundsCtx)
  const providerContext = useContext(ProviderContext)

  const handleMintDAIClick = () => mintDAI(providerContext.provider)
  const handleDAIBalanceClick = () => daiBalance(providerContext.provider).then(v => console.log('DAI balance:', v))
  const handleSetDepositAssetClick = () => setDepositAddress(providerContext.provider)
  // const handleInitiateRoundClick = () => initiateRound(providerContext.provider)
  const handleEndRoundClick = () => endRound(providerContext.provider)
  const handlePerformUpkeepClick = () => performUpkeep(providerContext.provider)

  const { isLoading, isError, data, error } = useQuery(['testData'], () => fetchData(providerContext.provider), {
    refetchInterval: 5000,
    enabled: providerContext.provider != undefined
  })

  useEffect(() => {
    if (data) {
      setTestData(data)
    }
  }, [data, providerContext.provider])

  return (
    <>
      {testData}
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
          <UpdateOracleModal/>
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
    // const daiBalance = await (await captureTheStream.daiBalance()).toString()
    const roundCount = await (await captureTheStream.roundCount()).toString()

    return [
      <p>Contract address: {address.toString()}</p>,
      <p>myAddress: {myAddress}</p>,
      <p>deposits: {deposits}</p>,
      <p>depositAsset: {depositAsset}</p>,
      <p>upkeep: {upkeepRequired}</p>,
      // <p>DAI Balance: {daiBalance}</p>
      <p>roundCount: {roundCount}</p>,
    ]
  } else {
    return [<p>LOADING</p>]
  }
}
