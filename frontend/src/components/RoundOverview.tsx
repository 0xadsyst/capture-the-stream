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
import {getAssetNameFromOracle } from 'src/utils/getAssetNameFromOracle'
import { ProviderContext } from 'src/context/providerContext'

import moment from 'moment'

const RoundOverview = () => {
  const [roundOverviewCards, setroundOverviewCards] = useState<any[]>([])
  const roundsContext = useContext(RoundsCtx)
  const roundContext = useContext(RoundCtx)
  const providerContext = useContext(ProviderContext)

  const router = useRouter()
  const theme = useTheme()

  function createRoundOverviewCard(round: RoundType) {
    const startTimeString = moment(round['startTimestamp'] * 1000).format("MMM D hh:mm ")
    const endTimeString = moment(round['endTimestamp'] * 1000).format("MMM D hh:mm ")
    const guessCutOffTimestamp = moment(round['guessCutOffTimestamp'] * 1000).format("MMM D hh:mm ")
    const numberOfGuessesAllowed = round['numberOfGuessesAllowed'] == 0 ? "Unlimited" : round['numberOfGuessesAllowed']
    const asset = getAssetNameFromOracle(round['oracle'], providerContext.provider?._network.chainId ?? 0)

    return (
      <Grid item xs={4} md={4} key={round.roundId}>
        <Card>
          <CardHeader title={'Round: ' + round['roundId'].toString()} />
          <CardContent >
          <Typography variant='body1'><b>Asset: </b>{asset}</Typography>

            <Typography variant='body1' sx={{ mr: 4 }}>
              <b>Start Time: </b>{startTimeString}
            </Typography>
            <Typography variant='body1' sx={{ mr: 4 }} display='block'>
              <b>End Time: </b>{endTimeString}
            </Typography>
            <Typography variant='body1'><b>Entry Cut-off Time: </b>{guessCutOffTimestamp}</Typography>
            <Typography variant='body1'><b>Number of Guesses Allowed: </b>{numberOfGuessesAllowed}</Typography>
            <Typography variant='body1'><b>Minimum Guess Spacing: </b>{round['minimumGuessSpacing'].toString()}</Typography>
            <Typography variant='body1'><b>Guess Cost: </b>{round['guessCost'].toString()}</Typography>
            <Typography variant='body1'><b>In Round Guesses Allowed: </b>{round['inRoundGuessesAllowed'] ? "Yes" : "No"}</Typography>
            <Typography variant='body1'><b>Current Winner: </b>{round['currentWinner'].toString()}</Typography>
            <Typography variant='body1'><b>Pool Size: </b>{(round['deposits'] / 1e18).toString()} DAI</Typography>
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
