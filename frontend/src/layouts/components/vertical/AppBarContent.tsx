// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'

// ** Type Import
import { Settings } from 'src/context/settingsContext'

// ** Components
import ModeToggler from 'src/layouts/components/shared-components/ModeToggler'
import ConnectButton from 'src/components/ConnectButton'
import useProtocolBalance from '../../../hooks/useProtocolBalance'
import DepositModal from '../../../components/DepositModal'

import useRounds from '../../../hooks/useRounds'
import useGuesses from '../../../hooks/useGuesses'
import useProvider from '../../../hooks/useProvider'

interface Props {
  hidden: boolean
  settings: Settings
  toggleNavVisibility: () => void
  saveSettings: (values: Settings) => void
}

const AppBarContent = (props: Props) => {
  // ** Props
  const { hidden, settings, saveSettings, toggleNavVisibility } = props

  // ** Hook
  const balance = useProtocolBalance()
  const rounds = useRounds()
  const guesses = useGuesses()
  const provider = useProvider()

  return (
    <Box sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <Box className='actions-left' sx={{ mr: 2, display: 'flex', alignItems: 'center' }}>
        <ModeToggler settings={settings} saveSettings={saveSettings} />
      </Box>
      <Box className='actions-middle' sx={{ mt: 4, mr: 2, display: 'flex', textAlign: 'center' }}>
        <Card>
          <Box sx={{ mt: 2, mb: 2, ml: 2, mr: 2, textAlign: 'center' }}>Balance: {balance} DAI</Box>
          <Box sx={{ mt: 2, mb: 2, ml: 2, mr: 2, display: 'flex', alignItems: 'center' }}>
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
