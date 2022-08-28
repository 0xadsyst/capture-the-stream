// ** MUI Imports
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'

// ** Components Imports
import RoundTable from 'src/components/RoundTable'
import RoundSelector from 'src/components/RoundSelector'
import RoundVisualization from 'src/components/RoundVisualization'
import EnterRoundModal from 'src/components/EnterRoundModal'
import GetPowerUpModal from 'src/components/GetPowerUpModal'
import UsePowerUpModal from 'src/components/UsePowerUpModal'
import PowerUpTable from 'src/components/PowerUpTable'

// ** React
import React from 'react'

// ** Web3
import { RoundContext } from 'src/context/roundContext'
import { useContext } from 'react'

const Round = () => {
  const roundContext = useContext(RoundContext)

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={4} md={4}>
          <RoundSelector key={roundContext?.roundId} />
        </Grid>
        <Grid item xs={8} md={8}>
        <Box sx={{ mt: 2, mb: 2, ml: 2, mr: 2, textAlign: 'right' }}>
        <UsePowerUpModal />{'   '}<GetPowerUpModal />{'   '}<EnterRoundModal />
          </Box>
        </Grid>
        <Grid item xs={12} md={12}>
          <RoundVisualization />
        </Grid>
        <Grid item xs={12}>
          <RoundTable key={roundContext?.roundId} />
        </Grid>
        <Grid item xs={12}>
          <PowerUpTable key={roundContext?.roundId} />
        </Grid>
      </Grid>
    </>
  )
}

export default Round
