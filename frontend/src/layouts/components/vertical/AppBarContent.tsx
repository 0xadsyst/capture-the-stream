// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'

// ** Type Import
import { Settings } from 'src/context/settingsContext'

// ** Components
import ModeToggler from 'src/layouts/components/shared-components/ModeToggler'
// import ConnectButton from 'src/components/ConnectButton'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import DepositModal from 'src/components/DepositModal'

import useRounds from 'src/hooks/useRounds'
import useGuesses from 'src/hooks/useGuesses'
import usePowerUps from 'src/hooks/usePowerUps'

import React from 'react'
import { ethers } from 'ethers'
import useProtocolBalance from 'src/hooks/useProtocolBalance'

interface Props {
  hidden: boolean
  settings: Settings
  toggleNavVisibility: () => void
  saveSettings: (values: Settings) => void
}

const AppBarContent = (props: Props) => {
  const { settings, saveSettings, toggleNavVisibility } = props

  const rounds = useRounds()
  const guesses = useGuesses()
  const powerUps = usePowerUps()
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
