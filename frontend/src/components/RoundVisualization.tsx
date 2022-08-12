// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

import React, { ProviderProps, useEffect, useState, useRef, useContext } from 'react'

import { memo } from 'react'
import useEthPrice from '../hooks/useEthPrice'
import { RoundCtx } from 'src/context/roundContext'
import { GuessesContext, GuessType } from 'src/context/guessesContext'
import { RoundsCtx, RoundType } from 'src/context/roundsContext'
import { ProviderContext } from 'src/context/providerContext'

import moment from 'moment'
import {getAssetNameFromOracle } from 'src/utils/getAssetNameFromOracle'


interface GuessDisplay {
  guessId: string
  user: string
  guess: number
  difference: number
  winningTime: number
  status: string
}

interface ChartData {
  labels: string[]
  datasets: any[]
}

interface RoundDisplayData {
  asset: string
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

const emptyData: ChartData = {
  labels: ['XXX'],
  datasets: []
}

interface LineDatasetType {
  type: string
  label: string
  data: any[]
  backgroundColor: string
  pointStyle: string
  radius: number
  order: number
}

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  BarOptions,
  LineOptions,
  ChartType,
  InteractionAxis,
  ChartConfiguration,
  ChartTypeRegistry,
  BubbleDataPoint
} from 'chart.js'
import { Chart, Bar, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend )

const yAxis: InteractionAxis = "y"
export const options = {
  indexAxis: yAxis,
  borderSkipped: false,
  plugins: {
    title: {
      display: false,
      text: 'Chart.js Bar Chart - Stacked'
    },
    legend: {
      display: false
    }
  },
  responsive: true,
  scales: {
    x: {
      min: 500,
      max: 5000,
      stacked: false
    },
    y: {
      stacked: true
    }
  }
}

const RoundVisualization = () => {
  const [chartData, setChartData] = useState<ChartData>(emptyData)
  const [chartOptions, setChartOptions] = useState(options)
  const [roundData, setRoundData] = useState<RoundType>()
  const [roundDisplayData, setRoundDisplayData] = useState<RoundDisplayData>()
  const [time, setTime] = useState(Date.now())

  const ethPrice = useEthPrice()
  const roundContext = useContext(RoundCtx)
  const roundsContext = useContext(RoundsCtx)
  const guessesContext = useContext(GuessesContext)
  const providerContext = useContext(ProviderContext)

  const chartRef = useRef<ChartJS>(null)

  useEffect(() => {
    const chart = chartRef.current
    let chartMin = ethPrice ?? 500
    let chartMax = ethPrice ?? 3000
    chartData.datasets.map(ds => {
      if (ds['type'] == 'bar') {
        chartMin = Math.min(chartMin ?? 500, ds['data'][0]['x'][0])
        chartMax = Math.max(chartMax ?? 3000, ds['data'][0]['x'][1])
      }
    })
    const newOptions = { ...chartOptions }
    newOptions.scales.x.min = chartMin - 50
    newOptions.scales.x.max = chartMax + 50
    setChartOptions(newOptions)
    chart?.update()
  }, [chartData])

  useEffect(() => {
    console.log('chart ethPrice updated', ethPrice)
    const chart = chartRef.current

    const newData: ChartData = chartData
    const newLineDataset: LineDatasetType = newData['datasets'].pop()
    if (newLineDataset != undefined) {
      newLineDataset['data'].map(p => {
        p['x'] = ethPrice
      })

      newData['datasets'].push(newLineDataset)
      setChartData(newData)
      chart?.update()
    }
  }, [ethPrice, chartData])

  useEffect(() => {
    if (guessesContext.guesses && roundContext?.roundId != undefined && roundsContext.rounds != []) {
      const newData: ChartData = {
        labels: [],
        datasets: []
      }

      const sortedData = [...guessesContext.guesses]
        .filter(g => {
          return g.roundId == roundContext?.roundId
        })
        .sort((a, b) => a.guess - b.guess)
      const users: string[] = []
      sortedData.map((guessData, index) => {
        let lower = guessData['guess'] - 50
        let upper = +guessData['guess'] + 50
        if (index != 0) {
          lower = (+guessData['guess'] + +sortedData[index - 1].guess) / 2
        } else {
          options.scales.x.min = lower - 50
        }
        if (index != sortedData.length - 1) {
          upper = (+guessData['guess'] + +sortedData[index + 1].guess) / 2
        } else {
          options.scales.x.max = upper + 50
        }
        const user = guessData['user'].substring(0, 8)
        if (!users.includes(user)) {
          users.push(user)
        }

        newData['datasets'].push({
          type: 'bar' as const,
          label: user,
          data: [{ y: user, x: [lower, upper] }],
          backgroundColor: '#' + user.substring(2, 8),
          order: 1,
          borderWidth: 2,
          borderColor: '#bbbbbb'
        })
      })
      const priceData: { y: string; x: number }[] = []

      if (ethPrice) {
        users.map(user => {
          priceData.push({ y: user, x: ethPrice })
        })
      }

      newData['datasets'].push({
        type: 'line'  as const,
        label: 'Price',
        data: priceData,
        backgroundColor: '',
        pointStyle: 'point',
        radius: 2,
        order: 0
      })

      setRoundData(roundsContext.rounds[roundContext.roundId])

      console.log('new chart Data', newData)
      setChartData(newData)
    }
  }, [guessesContext.guesses, roundContext?.roundId])

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 1000)
    
return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (roundData && roundContext) {
      const startTime = moment(roundData.startTimestamp * 1000).format('MMM D hh:mm ')
      const endTime = moment(roundData.endTimestamp * 1000).format('MMM D hh:mm ')
      const secondsRemaining = roundData.endTimestamp - moment().unix()
      const days = Math.floor(secondsRemaining / (60 * 60 * 24))
      const hours = Math.floor((secondsRemaining - days * (60 * 60 * 24)) / (60 * 60))
      const minutes = Math.floor((secondsRemaining - days * (60 * 60 * 24) - hours * (60 * 60)) / 60)
      const seconds = secondsRemaining - days * (60 * 60 * 24) - hours * (60 * 60) - minutes * 60
      const timeRemaining =
        secondsRemaining > 0
          ? days + ' days ' + hours + ' hours ' + minutes + ' minutes ' + seconds + ' seconds'
          : 'Round ended'
      const guessCutOffTime = moment(roundData.guessCutOffTimestamp * 1000).format('MMM D hh:mm ')
      const currentWinnerIndex = roundsContext.rounds[roundContext.roundId]?.currentWinner ?? undefined
      const currentWinner = guessesContext.guesses.find(a => a.id == roundContext.roundId + '-' + currentWinnerIndex)
      const currentWinnerWinnings = (moment().unix() - roundData.lastWinnerChange).toString()
      const asset = getAssetNameFromOracle(roundData['oracle'], providerContext.provider?._network.chainId ?? 0)
      const roundDisplayData: RoundDisplayData = {
        asset: asset,
        startTime: startTime,
        endTime: endTime,
        remainingTime: timeRemaining,
        guessCutOffTime: guessCutOffTime,
        numberOfGuessesAllowed: roundData.numberOfGuessesAllowed ? roundData.numberOfGuessesAllowed.toString() : "Unlimited",
        minimumGuessSpacing: roundData.minimumGuessSpacing.toString(),
        guessCost: roundData.guessCost.toString(),
        poolSize: (roundData.deposits  / 1e18).toString(),
        currentWinner: currentWinner
          ? currentWinner?.user.slice(0, 8) +
            ' (' +
            '$' +
            currentWinner?.guess +
            ') ' +
            currentWinnerWinnings +
            ' seconds'
          : 'None'
      }

      setRoundDisplayData(roundDisplayData)
    }
  }, [chartData, time])

  // ** Hook
  const theme = useTheme()

  return (
    <Card>
      <CardHeader
        title={'Round ' + roundContext?.roundId}
        titleTypographyProps={{
          sx: { lineHeight: '2rem !important', letterSpacing: '0.15px !important' }
        }}
      />
      <CardContent>
        <Grid container spacing={4}>
          <Grid item xs={6} md={6} >
          <Typography variant='body1' sx={{ mr: 4 }}>
              <b>Asset: </b>
              {roundDisplayData?.asset}
            </Typography>
            <Typography variant='body1' sx={{ mr: 4 }}>
              <b>Start Time: </b>
              {roundDisplayData?.startTime}
            </Typography>
            <Typography variant='body1' sx={{ mr: 4 }} display='block'>
              <b>Entry Cut Off Time: </b>
              {roundDisplayData?.guessCutOffTime}
            </Typography>
            <Typography variant='body1' sx={{ mr: 4 }} display='block'>
              <b>End Time: </b>
              {roundDisplayData?.endTime}
            </Typography>
            <Typography variant='body1' sx={{ mr: 4 }} display='block'>
              <b>Remaining Time: </b>
              {roundDisplayData?.remainingTime}
            </Typography>
          </Grid>
          <Grid item xs={6} md={6} >
            <Typography variant='body1' sx={{ mr: 4 }}>
              <b>Number of Guesses Allowed:  </b>
              {roundDisplayData?.numberOfGuessesAllowed}
            </Typography>
            <Typography variant='body1' sx={{ mr: 4 }}>
              <b>Minimum Guess Spacing: </b>
              {roundDisplayData?.minimumGuessSpacing}
            </Typography>
            <Typography variant='body1' sx={{ mr: 4 }} display='block'>
              <b>Guess Cost: </b>
              {roundDisplayData?.guessCost} DAI
            </Typography>
            <Typography variant='body1' sx={{ mr: 4 }} display='block'>
              <b>Pool Size: </b>
              {roundDisplayData?.poolSize} DAI
            </Typography>
            <Typography variant='body1' sx={{ mr: 4 }} display='block'>
              <b>Current Winner: </b>
              {roundDisplayData?.currentWinner}
            </Typography>
          </Grid>
        </Grid>
        <Box sx={{ mb: 7, display: 'flex', alignItems: 'center' }}>
          <Chart type='bar' options={chartOptions} data={chartData} ref={chartRef} />
        </Box>
      </CardContent>
    </Card>
  )
}

export default memo(RoundVisualization)
