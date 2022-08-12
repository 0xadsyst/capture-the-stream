import React from 'react'
import { useConnectWallet } from '@web3-onboard/react'
import Button from '@mui/material/Button'

const ConnectButton = () => {
  const [{ wallet, connecting }, connect, disconnect] = useConnectWallet()

    if (!wallet) {
      return(<div>
      <Button variant="contained"
        disabled={connecting}
        onClick={() => {
          if (wallet) {
            disconnect(wallet)
          } else {
            connect()
          }
        }}
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
