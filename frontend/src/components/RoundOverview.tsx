// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Button from '@mui/material/Button'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import CardContent from '@mui/material/CardContent'

import { RoundCtx } from 'src/context/roundContext'
import { RoundsCtx, RoundType } from 'src/context/roundsContext'
import { useContext, useEffect, useState } from 'react'
// ** Next
import { useRouter } from 'next/router'

const RoundOverview = () => {
  const [roundOverviewCards, setroundOverviewCards] = useState<any[]>([])
  const roundsContext = useContext(RoundsCtx)
  const roundContext = useContext(RoundCtx)
  const router = useRouter()
  const theme = useTheme()

  function createRoundOverviewCard(round: RoundType) {
    const startTimeString = new Date(round['startTimestamp'] * 1000).toLocaleString('en-GB', {
      dateStyle: 'short',
      timeStyle: 'medium'
    })
    const endTimeString = new Date(round['endTimestamp'] * 1000).toLocaleString('en-GB', {
      dateStyle: 'short',
      timeStyle: 'medium'
    })

    return (
      <Grid item xs={4} md={4}>
        <Card>
          <CardHeader title={'Round: ' + round['roundId'].toString()} />
          <CardContent >
            <Typography variant='body1' sx={{ mr: 4 }}>
              Start Time: {startTimeString}
            </Typography>
            <Typography variant='body1' sx={{ mr: 4 }} display='block'>
              End Time: {endTimeString}
            </Typography>
            <Typography variant='body1'>Current Winner: {round['currentWinner'].toString()}</Typography>
            <p />
            <Button fullWidth variant='contained' onClick={() => handleRoundClick(round.roundId)}>
              Details
            </Button>
          </CardContent>
        </Card>
      </Grid>
    )
  }

  function handleRoundClick(roundId: number) {
    roundContext?.setRoundId(roundId)
    router.push('./round')
  }

  useEffect(() => {
    console.log('roundsContext.rounds', roundsContext.rounds)
    const newroundOverviewCards: any[] = []
    roundsContext?.rounds?.map(round => {
      newroundOverviewCards.push(createRoundOverviewCard(round))
    })
    setroundOverviewCards(newroundOverviewCards)
  }, [roundsContext.rounds])
  console.log('roundOverviewCards', roundOverviewCards)

  return <>{roundOverviewCards}</>
}

export default RoundOverview
