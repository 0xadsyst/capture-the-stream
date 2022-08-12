// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'

// ** React
import React, { useEffect, useState } from 'react'

// ** Web3
import RoundOverview from 'src/components/RoundOverview'
import InitiateRoundModal from 'src/components/InitiateRoundModal'

// ** Next
import { useContext } from 'react'

import { RoundsCtx } from 'src/context/roundsContext'

const Summary = () => {
  const roundsContext = useContext(RoundsCtx)

  return (
    <Grid container spacing={12}>
      <Grid item xs={12} md={12}>
        <InitiateRoundModal />
      </Grid>
      <Grid item xs={12} md={12}>
        <RoundOverview />
      </Grid>
    </Grid>
  )
}

export default Summary
