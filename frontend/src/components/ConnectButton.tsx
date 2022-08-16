import React from 'react'
import { useConnectWallet } from '@web3-onboard/react'
import Button from '@mui/material/Button'

const ConnectButton = () => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()

  const handleClick = () => {
    if (wallet) {
      disconnect(wallet)
    } else {
      connect()
    }
  }

    if (!wallet) {
      return(<div>
      <Button variant="contained"
        disabled={connecting}
        onClick={handleClick}
      >
        {connecting ? 'connecting' : wallet ? 'disconnect' : 'Connect'}
      </Button>
    </div>)
    } else {
      return(
      <div></div>)
    }

  }

export default ConnectButton
