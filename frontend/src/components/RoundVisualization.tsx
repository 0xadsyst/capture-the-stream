// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import { useTheme } from '@mui/material/styles'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'

import React, { ProviderProps, useEffect, useState, useRef, useContext} from 'react'

import { memo } from 'react'
import useEthPrice from '../hooks/useEthPrice'
import { RoundCtx } from 'src/context/roundContext'
import { GuessesContext } from 'src/context/guessesContext'

interface GuessType {
  guessId: string
  user: string
  guess: number
  difference: number
  winningTime: number
  status: string
}
const emptyGuess: GuessType[] = []

interface chartDataType {
  labels: string[]
  datasets: any[]
}

const emptyData: chartDataType = {
  labels: ['XXX'],
  datasets: []
}

interface lineDatasetType {
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
  Legend
} from 'chart.js'
import { Bar, Line } from 'react-chartjs-2'

ChartJS.register(CategoryScale, LinearScale, BarElement, LineElement, PointElement, Title, Tooltip, Legend)

export const options = {
  indexAxis: 'y',
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
  const [chartData, setChartData] = useState(emptyData)
  const [chartOptions, setChartOptions] = useState(options)
  const ethPrice = useEthPrice()
  const roundContext = useContext(RoundCtx)
  const guessesContext = useContext(GuessesContext)

  const chartRef = useRef<ChartJS>(null)

  useEffect(() => {
    const chart = chartRef.current
    let chartMin = ethPrice ?? 500
    let chartMax = ethPrice ?? 3000
    chartData.datasets.map((ds) => {
      if (ds["type"] == "bar") {

        chartMin = Math.min(chartMin ?? 500, ds["data"][0]["x"][0])
        chartMax = Math.max(chartMax ?? 3000, ds["data"][0]["x"][1])
      }
    })
    const newOptions = {...chartOptions}
    newOptions.scales.x.min = chartMin - 50
    newOptions.scales.x.max = chartMax + 50
    setChartOptions(newOptions)
      chart?.update()
    }
  , [chartData])

  useEffect(() => {
    console.log('chart ethPrice updated', ethPrice)
    const chart = chartRef.current

    const newData: chartDataType = chartData
    const newLineDataset: lineDatasetType = newData['datasets'].pop()
    if (newLineDataset != undefined) {
      newLineDataset['data'].map(p => {
        p['x'] = ethPrice
      })

      newData['datasets'].push(newLineDataset)
      setChartData(newData)
      chart?.update()
    }
  }, [ethPrice])

  useEffect(() => {
    const newData: chartDataType = {
      labels: [],
      datasets: []
    }

    const sortedData = [...guessesContext.guesses].filter((g)=>{return (g.roundId == roundContext?.roundId)}).sort((a, b) => a.guess - b.guess)
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
        type: 'bar',
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
      type: 'line',
      label: 'Price',
      data: priceData,
      backgroundColor: '',
      pointStyle: 'point',
      radius: 2,
      order: 0
    })

    console.log('new chart Data', newData)
    setChartData(newData)

  }, [guessesContext.guesses, roundContext?.roundId])

  // ** Hook
  const theme = useTheme()

  return (
    <Card>
      <CardHeader
        title='Round Visualization'
        titleTypographyProps={{
          sx: { lineHeight: '2rem !important', letterSpacing: '0.15px !important' }
        }}
      />
      <CardContent >
        <Box sx={{ mb: 7, display: 'flex', alignItems: 'center' }}>
          <Bar options={chartOptions} data={chartData} ref={chartRef} />
        </Box>
      </CardContent>
    </Card>
  )
}

export default memo(RoundVisualization)
