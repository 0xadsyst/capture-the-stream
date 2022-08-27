import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

import React from 'react'

export interface RoundDisplayData {
    asset: string
    price: string
    startTime: string
    endTime: string
    remainingTime: string
    guessCutOffTime: string
    numberOfGuessesAllowed: string
    minimumGuessSpacing: string
    guessCost: string
    poolSize: string
    currentWinner: string
  }

interface Props {
    roundDisplayData: RoundDisplayData | undefined
  }

export const RoundVisualizationData = (props: Props) => {
    if (props.roundDisplayData) {
        return (
        <Grid container spacing={4}>
            <Grid item xs={6} md={6}>
                <Typography variant='body1' sx={{ mr: 4 }}>
                    <b>Asset: </b>
                    {props.roundDisplayData.asset + ' ($' + props.roundDisplayData.price + ')'}
                </Typography>
                <Typography variant='body1' sx={{ mr: 4 }}>
                    <b>Start Time: </b>
                    {props.roundDisplayData.startTime}
                </Typography>
                <Typography variant='body1' sx={{ mr: 4 }} display='block'>
                    <b>Entry Cut Off Time: </b>
                    {props.roundDisplayData.guessCutOffTime}
                </Typography>
                <Typography variant='body1' sx={{ mr: 4 }} display='block'>
                    <b>End Time: </b>
                    {props.roundDisplayData.endTime}
                </Typography>
                <Typography variant='body1' sx={{ mr: 4 }} display='block'>
                    <b>Remaining Time: </b>
                    {props.roundDisplayData.remainingTime}
                </Typography>
                </Grid>
                <Grid item xs={6} md={6}>
                <Typography variant='body1' sx={{ mr: 4 }}>
                    <b>Number of Guesses Allowed: </b>
                    {props.roundDisplayData.numberOfGuessesAllowed}
                </Typography>
                <Typography variant='body1' sx={{ mr: 4 }}>
                    <b>Minimum Guess Spacing: </b>
                    {props.roundDisplayData.minimumGuessSpacing}
                </Typography>
                <Typography variant='body1' sx={{ mr: 4 }} display='block'>
                    <b>Guess Cost: </b>
                    {parseInt(props.roundDisplayData.guessCost ?? '0') / 1e18} DAI
                </Typography>
                <Typography variant='body1' sx={{ mr: 4 }} display='block'>
                    <b>Pool Size: </b>
                    {props.roundDisplayData.poolSize} DAI
                </Typography>
                <Typography variant='body1' sx={{ mr: 4 }} display='block'>
                    <b>Current Winner: </b>
                    {props.roundDisplayData.currentWinner}
                </Typography>
            </Grid>
        </Grid>
        )
} else {
    return <></>
}

}

