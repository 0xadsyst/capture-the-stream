// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'

// ** Type Import
import { Settings } from '../../../context/settingsContext'

// ** Components
import ModeToggler from '../../../layouts/components/shared-components/ModeToggler'
// import ConnectButton from '../../../components/ConnectButton'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import DepositModal from '../../../components/DepositModal'

import useRounds from '../../../hooks/useRounds'
import useGuesses from '../../../hooks/useGuesses'

import React, { useState, useEffect } from 'react'
import { externalContractsAddressMap } from '../../../configs/externalContracts.config'
import { CaptureTheStream__factory } from '../../../../generated/factories/CaptureTheStream__factory'
import { ethers, BigNumber } from 'ethers'
import { useContractRead, useNetwork, useAccount, useSigner } from 'wagmi'
import useProtocolBalance from '../../../hooks/useProtocolBalance'

interface Props {
  hidden: boolean
  settings: Settings
  toggleNavVisibility: () => void
  saveSettings: (values: Settings) => void
}

const AppBarContent = (props: Props) => {
  const { hidden, settings, saveSettings, toggleNavVisibility } = props
  const { chain } = useNetwork()
  const { address } = useAccount()
  const [myAddress, setMyAddress] = useState('')
  const [myChain, setMyChain] = useState<number>()
  const { data: signer } = useSigner()

  useEffect(() => {
    address ? setMyAddress(address) : null
    chain ? setMyChain(chain.id) : null
  }, [address, chain])
  // ** Props

  const rounds = useRounds()
  const guesses = useGuesses()
  const protocolBalance = useProtocolBalance()

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}
    >
      <Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
        <ModeToggler settings={settings} saveSettings={saveSettings} />
      </Box>
      <Box className='actions-middle' sx={{ mt: 4, mr: 12, display: 'flex', textAlign: 'left' }}>
        <Card>
          <Box sx={{ mt: 2, mb: 2, ml: 2, mr: 2, textAlign: 'center' }}>
            Balance: {parseFloat(ethers.utils.formatUnits(protocolBalance, 18)).toFixed(2).toString()} DAI
          </Box>
          <Box
            sx={{
              mt: 2,
              mb: 2,
              ml: 2,
              mr: 2,
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <DepositModal />
          </Box>
        </Card>
      </Box>
      <Box className='actions-right' sx={{ display: 'flex', alignItems: 'center' }}>
        <ConnectButton />
      </Box>
    </Box>
  )
}

export default AppBarContent
