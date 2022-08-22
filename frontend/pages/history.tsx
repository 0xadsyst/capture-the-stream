// ** MUI Imports
import Grid from '@mui/material/Grid'

// ** Components Imports
import HistoryTable from 'src/components/HistoryTable'


// ** React
import React from 'react'

// ** Web3
import { RoundContext } from 'src/context/roundContext'
import { useContext } from 'react'

const History = () => {
  const roundContext = useContext(RoundContext)

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <HistoryTable key={roundContext?.roundId} />
        </Grid>
      </Grid>
    </>
  )
}

export default History
