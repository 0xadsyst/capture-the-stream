// ** MUI Imports
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'

// ** Components Imports
import RoundTable from 'src/components/RoundTable'
import RoundSelector from 'src/components/RoundSelector'
import RoundVisualization from 'src/components/RoundVisualization'
import EnterRoundModal from '../components/EnterRoundModal'
import UpdateWinnerModal from '../components/UpdateWinnerModal'
import Select, { SelectChangeEvent } from '@mui/material/Select'

// ** React
import React from 'react'

// ** Web3
import { RoundCtx } from 'src/context/roundContext'
import { useContext } from 'react'

const Round = () => {
  const roundContext = useContext(RoundCtx)

  const handleRoundIdChange = (e: SelectChangeEvent) => {
    roundContext?.setRoundId(parseInt(e.target.value))
  }

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={4} md={4}>
          <RoundSelector onChange={handleRoundIdChange} roundId={roundContext?.roundId} />
        </Grid>
        <Grid item xs={4} md={4}>
          <Box sx={{ mt: 2, mb: 2, ml: 2, mr: 2, textAlign: 'center' }}>
            <EnterRoundModal />
          </Box>
        </Grid>
        <Grid item xs={4} md={4}>
          <Box sx={{ mt: 2, mb: 2, ml: 2, mr: 2, textAlign: 'right' }}>
            <UpdateWinnerModal />
          </Box>
        </Grid>
        <Grid item xs={12} md={12}>
          <RoundVisualization />
        </Grid>
        <Grid item xs={12}>
          <RoundTable key={roundContext?.roundId} />
        </Grid>
      </Grid>
    </>
  )
}

export default Round
