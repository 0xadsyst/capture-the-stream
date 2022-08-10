// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'

// ** React
import React, { useEffect, useState } from 'react'

// ** Web3
import RoundOverview from 'src/components/RoundOverview'

// ** Next
import { useContext } from 'react'

import { RoundsCtx } from 'src/context/roundsContext'

const Summary = () => {
  const roundsContext = useContext(RoundsCtx)

  return (
    <Grid container spacing={12}>
      <RoundOverview />
    </Grid>
  )
}

export default Summary
