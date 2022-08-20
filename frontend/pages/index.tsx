// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Switch from '@mui/material/Switch'

// ** React
import React, { useEffect, useState } from 'react'

// ** Web3
import RoundOverview from '../src/components/RoundOverview'
import InitiateRoundModal from '../src/components/InitiateRoundModal'

const Summary = () => {
  const [showFinishedRounds, setShowFinishedRounds] = useState<boolean>(false)
  const handleInputChange = (e: any) => {
    setShowFinishedRounds(e.target.checked)
  }

  return (
    <Grid container spacing={12}>
      <Grid item xs={6} md={6}>
        <InitiateRoundModal />
      </Grid>
      <Grid item xs={6} md={6} textAlign={'right'}>
        Show Finished Rounds
      <Switch
                id='inRoundGuessesAllowed'
                name='inRoundGuessesAllowed'
                onChange={handleInputChange}
                inputProps={{ 'aria-label': 'controlled' }}
                value={showFinishedRounds}
              />
      </Grid>
        <RoundOverview key={showFinishedRounds.toString()} showFinishedRounds={showFinishedRounds}/>
    </Grid>
  )
}

export default Summary
