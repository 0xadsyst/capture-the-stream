// ** MUI Imports
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'

// ** Types Imports
import { ThemeColor } from 'src/layouts/types'

import { useEffect, useState, useContext } from 'react'
import usePrice from '../hooks/usePrice'

// ** Web3
import { RoundCtx } from 'src/context/roundContext'
import { RoundsCtx } from 'src/context/roundsContext'
import { GuessesContext } from 'src/context/guessesContext'
import { ProviderContext } from 'src/context/providerContext'
import dayjs from 'dayjs'

interface RowType {
  guessId: number
  user: string
  guess: number
  difference: number
  winningTime: number
  winnings: string
  priceNeeded: string
}

interface StatusObj {
  [key: string]: {
    color: ThemeColor
  }
}

const statusObj: StatusObj = {
  applied: { color: 'info' },
  rejected: { color: 'error' },
  current: { color: 'primary' },
  canSteal: { color: 'warning' },
  winning: { color: 'success' }
}

const RoundTable = () => {
  const [rows, setRows] = useState<RowType[]>([])
  const [time, setTime] = useState(Date.now())
  const [oracle, setOracle] = useState<string>()
  const roundContext = useContext(RoundCtx)
  const roundsContext = useContext(RoundsCtx)
  const guessesContext = useContext(GuessesContext)
  const providerContext = useContext(ProviderContext)

  const price = usePrice(oracle ?? null)

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 1000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    if (roundContext?.roundId != null) {
      const newRows: RowType[] = []
      const roundData = roundsContext.rounds[roundContext.roundId]
      setOracle(roundsContext.rounds[roundContext.roundId].oracle)

      const sortedData = [...guessesContext.guesses]
        .filter(g => {
          return g.roundId == roundContext?.roundId
        })
        .sort((a, b) => a.guess - b.guess)

      sortedData.map((guessData, index) => {
        let priceNeeded = 'Losing'
        let winningTime = guessData['winningTime']

        let lower =  guessData['guess'] * 0.95
        let upper = guessData['guess'] * 1.05
        if (index != 0) {
          lower = (+guessData['guess'] + +sortedData[index - 1].guess) / 2
        } 
        if (index != sortedData.length - 1) {
          upper = (+guessData['guess'] + +sortedData[index + 1].guess) / 2
        }

        if (roundData?.currentWinner == guessData.guessId) {
          priceNeeded = 'Winning'
          winningTime += dayjs().unix() - roundData?.lastWinnerChange
        } else {
          if (price) {
            priceNeeded = price > guessData.guess ? (upper).toString() : (lower).toString()
          }
        }
        const winnings = dayjs().unix() > roundData.startTimestamp ?
          (winningTime * roundData.deposits) / ((roundData.endTimestamp - roundData.startTimestamp) * 1e18) : 0
        if (guessData['roundId'] == roundContext?.roundId) {
          newRows.push({
            guessId: guessData['guessId'],
            user: guessData['user'],
            guess: guessData['guess'],
            difference: (price ?? guessData['guess']) - guessData['guess'],
            winningTime: winningTime,
            winnings: winnings.toPrecision(4),
            priceNeeded: priceNeeded
          })
        }
      })
      newRows.sort((a, b) => Math.abs(a.difference) - Math.abs(b.difference))

      setRows(newRows)
    }
  }, [guessesContext.guesses, price, time, roundContext, roundsContext])

  if (!providerContext.provider || roundContext.roundId == undefined) {
    return <></>
  } else {
    return (
      <Card>
        <TableContainer>
          <Table sx={{ minWidth: 800 }} aria-label='table in dashboard'>
            <TableHead>
              <TableRow>
                <TableCell>Guess ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Guess</TableCell>
                <TableCell>Difference</TableCell>
                <TableCell>Time Winning</TableCell>
                <TableCell>Winnings</TableCell>
                <TableCell>Price Needed</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row: RowType) => (
                <TableRow hover key={row.guessId} sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }}>
                  <TableCell>{row.guessId}</TableCell>
                  <TableCell>{row.user}</TableCell>
                  <TableCell>{row.guess}</TableCell>
                  <TableCell>{row.difference}</TableCell>
                  <TableCell>{row.winningTime}</TableCell>
                  <TableCell>{row.winnings + ' DAI'}</TableCell>
                  <TableCell>{row.priceNeeded}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    )
  }
}

export default RoundTable
