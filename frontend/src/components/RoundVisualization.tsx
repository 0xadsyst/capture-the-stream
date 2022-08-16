// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import Typography from '@mui/material/Typography'
import Grid from '@mui/material/Grid'

import React, { useEffect, useState, useRef, useContext } from 'react'

import { memo } from 'react'
import { RoundCtx } from 'src/context/roundContext'
import { GuessesContext } from 'src/context/guessesContext'
import { RoundsCtx, RoundType } from 'src/context/roundsContext'
import { ProviderContext } from 'src/context/providerContext'
import usePrice from '../hooks/usePrice'

import dayjs from 'dayjs'
import { getAssetNameFromOracle } from 'src/utils/getAssetNameFromOracle'
import {AssetLogo} from './AssetLogo'


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
  InteractionAxis,
} from 'chart.js'
import { Chart } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

const yAxis: InteractionAxis = 'y'
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
      stacked: false,
      ticks: {
        precision: 0
      }
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
  const [oracle, setOracle] = useState<string>()

  const roundContext = useContext(RoundCtx)
  const roundsContext = useContext(RoundsCtx)
  const guessesContext = useContext(GuessesContext)
  const providerContext = useContext(ProviderContext)

  const chartRef = useRef<ChartJS>(null)
  const price = usePrice(oracle ?? null)

  useEffect(() => {
    const chart = chartRef.current
    let chartMin = 0
    let chartMax = 50000

    chartData.datasets.map(ds => {
      if (ds['type'] == 'bar') {
        if (price) {
          chartMin = Math.min(price * 0.9, ds['data'][0]['x'][0])
          chartMax = Math.max(price * 1.1, ds['data'][0]['x'][1])
        }else {
          chartMin = ds['data'][0]['x'][0] ?? chartMin
          chartMax = ds['data'][0]['x'][1] ?? chartMax
        }

      }
    })
    const newOptions = { ...chartOptions }
    newOptions.scales.x.min = parseFloat((chartMin * 0.95).toFixed(3))
    newOptions.scales.x.max = parseFloat((chartMax * 1.05).toFixed(3))
    setChartOptions(newOptions)
    chart?.update()
  }, [chartData, price])

  useEffect(() => {
    console.log('chart price updated', price)
    const chart = chartRef.current

    const newData: ChartData = chartData
    const newLineDataset: LineDatasetType = newData['datasets'].pop()
    if (newLineDataset != undefined) {
      newLineDataset['data'].map(p => {
        p['x'] = price
      })

      newData['datasets'].push(newLineDataset)
      setChartData(newData)
      chart?.update()
    }
  }, [price, chartData])

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
        let lower =  Math.min(guessData['guess'] * 0.95, (price ?? 1e10) * 0.95)
        let upper = Math.max(guessData['guess'] * 1.05, (price ?? 0) * 1.05)
        if (index != 0) {
          lower = (+guessData['guess'] + +sortedData[index - 1].guess) / 2
        } else {
          options.scales.x.min = lower * 0.95
        }
        if (index != sortedData.length - 1) {
          upper = (+guessData['guess'] + +sortedData[index + 1].guess) / 2
        } else {
          options.scales.x.max = upper * 1.05
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

      if (price) {
        users.map(user => {
          priceData.push({ y: user, x: price })
        })
      }

      newData['datasets'].push({
        type: 'line' as const,
        label: 'Price',
        data: priceData,
        backgroundColor: '',
        pointStyle: 'point',
        radius: 2,
        order: 0
      })

      setRoundData(roundsContext.rounds[roundContext.roundId])
      setOracle(roundsContext.rounds[roundContext.roundId].oracle)

      console.log('new chart Data', newData)
      setChartData(newData)
    }
  }, [guessesContext.guesses, roundContext?.roundId, price])

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 1000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (roundData && roundContext) {
      const startTime = dayjs(roundData.startTimestamp * 1000).format('MMM D h:mm a')
      const endTime = dayjs(roundData.endTimestamp * 1000).format('MMM D h:mm a')
      const secondsRemaining = roundData.endTimestamp - dayjs().unix()
      const days = Math.floor(secondsRemaining / (60 * 60 * 24))
      const hours = Math.floor((secondsRemaining - days * (60 * 60 * 24)) / (60 * 60))
      const minutes = Math.floor((secondsRemaining - days * (60 * 60 * 24) - hours * (60 * 60)) / 60)
      const seconds = secondsRemaining - days * (60 * 60 * 24) - hours * (60 * 60) - minutes * 60
      const timeRemaining =
        secondsRemaining > 0
          ? days + ' days ' + hours + ' hours ' + minutes + ' minutes ' + seconds + ' seconds'
          : 'Round ended'
      const guessCutOffTime = dayjs(roundData.guessCutOffTimestamp * 1000).format('MMM D h:mm a')
      const currentWinnerIndex = roundContext.roundId != undefined
        ? roundsContext.rounds[roundContext.roundId]?.currentWinner
        : undefined
      const currentWinner = guessesContext.guesses.find(a => a.id == roundContext.roundId + '-' + currentWinnerIndex)
      const currentWinnerWinnings = dayjs().unix() > roundData.startTimestamp ? (dayjs().unix() - roundData.lastWinnerChange).toString() : ''
      const asset = getAssetNameFromOracle(roundData['oracle'], providerContext.chainId)
      const roundDisplayData: RoundDisplayData = {
        asset: asset,
        startTime: startTime,
        endTime: endTime,
        remainingTime: timeRemaining,
        guessCutOffTime: guessCutOffTime,
        numberOfGuessesAllowed: roundData.numberOfGuessesAllowed
          ? roundData.numberOfGuessesAllowed.toString()
          : 'Unlimited',
        minimumGuessSpacing: roundData.minimumGuessSpacing.toString(),
        guessCost: roundData.guessCost.toString(),
        poolSize: (roundData.deposits / 1e18).toString(),
        currentWinner: (currentWinner && currentWinnerWinnings)
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

  
  if (!providerContext.provider) {
    return <h1>CONNECT YOUR WALLET</h1>
  } else if (roundContext.roundId == undefined) {
    return <h1>SELECT ROUND</h1>
  }  else {
    return (
      <Card>
        <CardHeader
          title={'Round ' + roundContext?.roundId}
          titleTypographyProps={{
            sx: { lineHeight: '2rem !important', letterSpacing: '0.15px !important' }
          }}
          avatar={<AssetLogo asset={roundDisplayData?.asset ?? ''}></AssetLogo>}
        />
        <CardContent>
          <Grid container spacing={4}>
            <Grid item xs={6} md={6}>
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
            <Grid item xs={6} md={6}>
              <Typography variant='body1' sx={{ mr: 4 }}>
                <b>Number of Guesses Allowed: </b>
                {roundDisplayData?.numberOfGuessesAllowed}
              </Typography>
              <Typography variant='body1' sx={{ mr: 4 }}>
                <b>Minimum Guess Spacing: </b>
                {roundDisplayData?.minimumGuessSpacing}
              </Typography>
              <Typography variant='body1' sx={{ mr: 4 }} display='block'>
                <b>Guess Cost: </b>
                {parseInt(roundDisplayData?.guessCost ?? '0') / 1e18} DAI
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
}

export default memo(RoundVisualization)
