// ** MUI Imports
import Card from '@mui/material/Card'
import CardHeader from '@mui/material/CardHeader'
import CardContent from '@mui/material/CardContent'
import { Typography } from '@mui/material'

import React, { useEffect, useState, useRef, useContext } from 'react'

import { RoundContext } from 'src/context/roundContext'
import { SubgraphDataContext, RoundType } from 'src/context/subgraphDataContext'
import { useNetwork, useSigner } from 'wagmi'
import usePrice from 'src/hooks/usePrice'

import dayjs from 'dayjs'
import { getAssetNameFromOracle } from 'src/utils/getAssetNameFromOracle'
import { AssetLogo } from './AssetLogo'

import { RoundVisualizationData, RoundDisplayData } from 'src/components/RoundVisualizationData'
import { timeRemaining } from 'src/utils/timeRemaining'
import { getGuessRanges } from 'src/utils/guesshelpers'

import {
  Label,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip as TooltipRechart,
  Legend as LegendRechart,
  Bar,
  Line,
  ResponsiveContainer
} from 'recharts'

interface RechartData {
  [key: string]: {
    name: string
    guess: number
    lower: number
    upper: number
    winning: boolean
    disabled: boolean
    temporary: boolean
    lowest: boolean
    highest: boolean
  }[]
}

const RoundVisualization = () => {
  const [rechartData, setRechartData] = useState<any[]>([])
  const [rechartBars, setRechartBars] = useState<any[]>([])
  const [rechartMinMax, setRechartMinMax] = useState<number[]>([0, 9999999])

  const [roundDisplayData, setRoundDisplayData] = useState<RoundDisplayData>()
  const [time, setTime] = useState(Date.now())
  const [roundData, setroundData] = useState<RoundType>()
  const [roundActive, setRoundActive] = useState<boolean>(false)
  const [tooltipData, setTooltipData] = useState<RechartData>()

  const roundContext = useContext(RoundContext)
  const subgraphDataContext = useContext(SubgraphDataContext)
  const [myChain, setMyChain] = useState<number>()
  const { chain } = useNetwork()

  const chartRef = useRef<any>(null)

  useEffect(() => {
    chain ? setMyChain(chain.id) : ''
  }, [chain])

  const price = usePrice(roundData?.oracle ?? null)

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 1000)
    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (roundContext.roundId == undefined) {
      return
    }
    const round = subgraphDataContext.rounds[roundContext.roundId]
    if (dayjs().unix() > round.startTimestamp && dayjs().unix() < round.endTimestamp) {
    }
    setroundData(round)
    setRoundActive(true)
  }, [subgraphDataContext.rounds, roundContext.roundId])

  useEffect(() => {
    if (roundContext.roundId == undefined || roundData == undefined || price == 0) {
      return
    }
    const newRechartsData: RechartData = {}

    const guessRanges = getGuessRanges(subgraphDataContext.guesses, roundContext.roundId)
    const newMinMax = [Number.MAX_SAFE_INTEGER, 0]

    guessRanges.map((guess, index) => {
      if (roundContext.roundId == undefined || !subgraphDataContext.rounds) {
        return
      }

      const winning = guess.id == roundData.currentWinner && roundActive

      const user: string = guess.user.substring(0, 8)
      const name = user + '-' + guess.guess
      let lowest = false
      let highest = false
      let lower = guess.lower
      let upper = guess.upper
      if (guess.lower == 0) {
        lower = Math.min(guessRanges[0].guess * 0.99, price * 0.99)
        lowest = true
      }
      else if (guess.upper == Number.MAX_SAFE_INTEGER){
        upper = Math.max(guessRanges[guessRanges.length - 1].guess * 1.01, price * 1.01)
        highest = true
      }
      const tempGuessData = subgraphDataContext.guesses.find(g => {
        return g.id == roundContext.roundId + '-' + guess.id
      })

      const disabled =
        (tempGuessData?.disableEndTimestamp ?? Number.MAX_SAFE_INTEGER) > dayjs().unix() ||
        (tempGuessData?.enableEndTimestamp ?? 0) < dayjs().unix()
      const temporary = (tempGuessData?.enableEndTimestamp ?? 0) < roundData.endTimestamp

      newMinMax[0] = Math.min(newMinMax[0], lower * 0.99)
      newMinMax[1] = Math.max(newMinMax[1], upper * 1.01)

      const guessData = {
        name: name,
        guess: guess.guess,
        lower: lower,
        upper: upper,
        winning: winning,
        disabled: disabled,
        temporary: temporary,
        lowest: lowest,
        highest: highest
      }

      if (Object.keys(newRechartsData).includes(user)) {
        newRechartsData[user].push(guessData)
      } else {
        newRechartsData[user] = [guessData]
      }
    })

    setTooltipData(newRechartsData)

    const chartBars: any[] = []
    const newChartData = []

    for (let [user, guesses] of Object.entries(newRechartsData)) {
      const newUserSet: { [key: string]: any } = { user: user }

      guesses.map((guess, index) => {
        const previousUpper = index == 0 ? 0 : guesses[index - 1]?.upper
        const transparentBarSize = guess.lower - previousUpper
        newUserSet[guess.name + '-blank'] = transparentBarSize
        chartBars.push(<Bar key={guess.name + '-blank'} dataKey={guess.name + '-blank'} stackId='a' fill='transparent' />)

        const barSize = guess.upper - guess.lower
        newUserSet[guess.name + '-guess'] = barSize
        let backgroundColor = '#' + user.substring(2, 8)
        let strokeWidth = 0
        let strokeColor = '#F4D35E'
        if (guess.winning) {
          strokeWidth = 5
        } else if (guess.disabled) {
          backgroundColor += '44'
        } else if (guess.temporary) {
          backgroundColor += 'CC'
          strokeWidth = 5
          strokeColor = '#00AAFF'
        }

        chartBars.push(
          <Bar
          key={guess.name + '-guess'}
            dataKey={guess.name + '-guess'}
            stackId='a'
            fill={backgroundColor}
            radius={[10, 10, 10, 10]}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        )
      })

      newUserSet['price'] = price

      newChartData.push(newUserSet)
    }

    setRechartMinMax(newMinMax)

    setRechartData(newChartData)
    setRechartBars(chartBars)
  }, [subgraphDataContext, roundContext?.roundId, roundActive, price, roundData])

  const tickFormatter = (tickItem: any) => {
    const formatter = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    })
    return formatter.format(tickItem)
  }

  useEffect(() => {
    if (roundContext.roundId == undefined || !subgraphDataContext.rounds[roundContext.roundId]) {
      return
    }

    const roundData = subgraphDataContext.rounds[roundContext.roundId]

    const startTime = dayjs(roundData.startTimestamp * 1000).format('MMM D h:mm a')
    const endTime = dayjs(roundData.endTimestamp * 1000).format('MMM D h:mm a')
    const secondsRemaining = roundData.endTimestamp - dayjs().unix()
    const timeRemainingString = timeRemaining(secondsRemaining)

    const guessCutOffTime = dayjs(roundData.guessCutOffTimestamp * 1000).format('MMM D h:mm a')
    const currentWinnerIndex =
      roundContext.roundId != undefined ? subgraphDataContext.rounds[roundContext.roundId]?.currentWinner : undefined
    const currentWinner =
      dayjs().unix() > roundData.startTimestamp && dayjs().unix() < roundData.endTimestamp
        ? subgraphDataContext.guesses.find(a => a.id == roundContext.roundId + '-' + currentWinnerIndex)
        : ''
    const currentWinnerWinnings =
      roundData.endTimestamp && dayjs().unix() < roundData.endTimestamp
        ? (dayjs().unix() - roundData.lastWinnerChange).toString()
        : ''
    const asset = getAssetNameFromOracle(roundData['oracle'], myChain ?? 0)

    const roundDisplayData: RoundDisplayData = {
      asset: asset,
      price: price.toString(),
      startTime: startTime,
      endTime: endTime,
      remainingTime: timeRemainingString,
      guessCutOffTime: guessCutOffTime,
      numberOfGuessesAllowed: roundData.numberOfGuessesAllowed
        ? roundData.numberOfGuessesAllowed.toString()
        : 'Unlimited',
      minimumGuessSpacing: (roundData.minimumGuessSpacing / 1e8).toString(),
      guessCost: roundData.guessCost.toString(),
      poolSize: (roundData.deposits / 1e18).toString(),
      currentWinner:
        currentWinner && currentWinnerWinnings
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
  }, [myChain, time])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length && tooltipData) {
      const tooltip: any[] = []
      tooltipData[label].map((guess : any, index) => {
        if (!guess.disabled && guess.user && guess.guess) {
          if (guess.lowest) {
            tooltip.push(<div className='label' id={guess.user + guess.guess}>{' < $' + guess.upper}</div>)
          } else if (guess.highest) {
            tooltip.push(<div className='label'>{' > $' + guess.lower}</div>)
          } else {
            tooltip.push(<div className='label'>{'$' + guess.lower + ' - $' + guess.upper}</div>)
          }
        }
      })
      return (
        <Card>
          <CardContent>
          <Typography sx={{ fontSize: 14 }} color="text.secondary" gutterBottom>
          {label ?? ''}
        </Typography>
            <div key={label ?? ''} className='custom-tooltip'>{tooltip}</div>
          </CardContent>
        </Card>
      )
    }

    return null
  }

  if (!myChain) {
    return <h1>CONNECT YOUR WALLET</h1>
  } else if (roundContext.roundId == undefined) {
    return <h1>SELECT ROUND</h1>
  } else {
    return (
      <>
        <Card sx={{ mb: 2 }}>
          <CardHeader
            title={'Round ' + roundContext?.roundId}
            avatar={<AssetLogo asset={roundDisplayData?.asset ?? ''}></AssetLogo>}
          />
          <CardContent>
            <RoundVisualizationData roundDisplayData={roundDisplayData} />
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <ResponsiveContainer width='100%' height={400}>
              <ComposedChart data={rechartData} layout={'vertical'} key={1} ref={chartRef}>
                <CartesianGrid strokeDasharray='3 3' />
                <XAxis
                  type='number'
                  domain={rechartMinMax}
                  allowDataOverflow={true}
                  tickFormatter={tickFormatter}
                  style={{ fontSize: '1rem' }}
                  height={50}
                >
                  <Label value='Price' offset={0} position='insideBottom' />
                </XAxis>
                <YAxis type='category' dataKey='user' width={100} style={{ fontSize: '0.75rem' }}>
                  <Label value='User' angle={-90} position='insideLeft' />
                </YAxis>
                <TooltipRechart content={<CustomTooltip />} />

                {/* <LegendRechart /> */}
                {rechartBars}
                <Line type='monotone' dataKey='price' stroke='#888888' />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </>
    )
  }
}

export default RoundVisualization
