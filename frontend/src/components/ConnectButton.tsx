import React, {useEffect, useState} from 'react'
import { useConnectWallet, useWallets } from '@web3-onboard/react'
import Button from '@mui/material/Button'
import {initializeOnboard} from 'src/utils/initializeOnboard'

const ConnectButton = () => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()
  const [web3Onboard, setWeb3Onboard] = useState()

  const connectedWallets = useWallets()


    const w3Onboard = initializeOnboard
    
    //setWeb3Onboard(initializeOnboard)



  const handleClick = () => {
    if (wallet) {
      disconnect(wallet)
      window.localStorage.removeItem('connectedWallets')
    } else {
      connect()
    }
  }

  useEffect(() => {
    if (!connectedWallets.length) return

    const connectedWalletsLabelArray = connectedWallets.map(
      ({ label }) => label
    )
    window.localStorage.setItem(
      'connectedWallets',
      JSON.stringify(connectedWalletsLabelArray)
    )
  }, [connectedWallets, wallet])

  useEffect(() => {
    const previouslyConnectedWallets = JSON.parse(
      window.localStorage.getItem('connectedWallets') ?? ''
    )

    if (previouslyConnectedWallets?.length) {
      async function setWalletFromLocalStorage() {
        await connect({ autoSelect: previouslyConnectedWallets[0] })
      }
      setWalletFromLocalStorage()
    }
  }, [w3Onboard, connect])

  if (!wallet) {

    return (
      <div>
        <Button variant='contained' disabled={connecting} onClick={handleClick}>
          {connecting ? 'connecting' : wallet ? 'disconnect' : 'Connect'}
        </Button>
      </div>
    )
  } else {
    return <div></div>
  }
}

export default ConnectButton
