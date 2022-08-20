// ** MUI Imports
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'

import { useEffect, useState, useContext } from 'react'
import usePrice from '../hooks/usePrice'

// ** Web3
import { RoundContext } from '../context/roundContext'
import { RoundsContext } from '../context/roundsContext'
import { GuessesContext } from '../context/guessesContext'
import { useNetwork, useSigner } from 'wagmi'
import dayjs from 'dayjs'

interface RowType {
  guessId: number
  user: string
  guess: number
  difference: number
  winningTime: number
  winnings: string
  priceNeeded: string
  border: number
  borderColor: string
}

const RoundTable = () => {
  const [rows, setRows] = useState<RowType[]>([])
  const [time, setTime] = useState(Date.now())
  const [oracle, setOracle] = useState<string>()
  const roundContext = useContext(RoundContext)
  const roundsContext = useContext(RoundsContext)
  const guessesContext = useContext(GuessesContext)
  const { data: signer} = useSigner()
  const { chain } = useNetwork()

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
        let priceNeeded = ''
        let winningTime = guessData['winningTime']

        let lower = '0'
        let upper = 'Infinity'
        const borderColor = '#F4D35E'
        let border = 0
        if (index != 0) {
          lower = ((+guessData['guess'] + +sortedData[index - 1].guess) / 2).toString()
        }
        if (index != sortedData.length - 1) {
          upper = ((+guessData['guess'] + +sortedData[index + 1].guess) / 2).toString()
        }
        if (lower == '0' && upper == 'Infinity') {
          priceNeeded = '0 - Infinity'
        } else if (lower == '0') {
          priceNeeded = '<' + upper
        } else if (upper == 'Infinity') {
          priceNeeded = '>' + lower
        } else {
          priceNeeded = lower + '-' + upper
        }

        if (roundData?.currentWinner == guessData.guessId) {
          if (dayjs().unix() < roundData.startTimestamp) {
            winningTime = 0
          } else if (dayjs().unix() < roundData.endTimestamp) {
            border = 5
            winningTime += dayjs().unix() - roundData?.lastWinnerChange
          } else {
            winningTime += roundData.endTimestamp - roundData?.lastWinnerChange
          }
        }
        const winnings =
          dayjs().unix() > roundData.startTimestamp
            ? (winningTime * roundData.deposits) / ((roundData.endTimestamp - roundData.startTimestamp) * 1e18)
            : 0
        if (guessData['roundId'] == roundContext?.roundId) {
          newRows.push({
            guessId: guessData['guessId'],
            user: guessData['user'],
            guess: guessData['guess'],
            difference: (price ?? guessData['guess']) - guessData['guess'],
            winningTime: winningTime,
            winnings: winnings.toFixed(4),
            priceNeeded: priceNeeded,
            border: border,
            borderColor: borderColor
          })
        }
      })
      newRows.sort((a, b) => Math.abs(a.difference) - Math.abs(b.difference))

      setRows(newRows)
    }
  }, [guessesContext.guesses, price, time, roundContext, roundsContext])

  if (!signer || chain?.id == undefined) {
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
                <TableCell>Winning Range</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row: RowType) => (
                <TableRow
                  key={row.guessId}
                  sx={{
                    '&:last-of-type td, &:last-of-type th': { border: 0 },
                    border: row.border,
                    borderColor: row.borderColor
                  }}
                >
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
