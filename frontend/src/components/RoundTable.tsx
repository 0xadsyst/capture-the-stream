// ** MUI Imports
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import Typography from '@mui/material/Typography'
import TableContainer from '@mui/material/TableContainer'

// ** Types Imports
import { ThemeColor } from 'src/layouts/types'

import { ProviderProps, useEffect, useState, useContext } from 'react'

// ** Web3
import useEthPrice from 'src/hooks/useEthPrice'
import { RoundCtx } from 'src/context/roundContext'
import { RoundsCtx } from 'src/context/roundsContext'
import { GuessesContext } from 'src/context/guessesContext'
import moment from 'moment'

interface RowType {
  guessId: number
  user: string
  guess: number
  difference: number
  winningTime: number
  winnings: string
  status: string
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

const emptyRow: RowType[] = []

const RoundTable = () => {
  const [rows, setRows] = useState<RowType[]>([])
  const [time, setTime] = useState(Date.now());
  const roundContext = useContext(RoundCtx)
  const roundsContext = useContext(RoundsCtx)
  const guessesContext = useContext(GuessesContext)
  const ethPrice = useEthPrice()

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 1000);
    
return () => {
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const newRows: RowType[] = []
    const currentRound = roundContext?.roundId ?? 0
    const roundData = roundsContext.rounds[currentRound]

    guessesContext.guesses.map(guessData => {
      let status = 'Losing'
      let winningTime = guessData['winningTime']
      
      if (roundData?.currentWinner == guessData.guessId) {
        status = 'Winning'
        winningTime += (moment().unix() - roundData?.lastWinnerChange)
      }
      const winnings = winningTime * roundData.deposits / ((roundData.endTimestamp - roundData.startTimestamp) * 1e18)
      if (guessData['roundId'] == roundContext?.roundId) {
        newRows.push({
          guessId: guessData['guessId'],
          user: guessData['user'],
          guess: guessData['guess'],
          difference: (ethPrice ?? guessData['guess']) - guessData['guess'],
          winningTime: winningTime,
          winnings: winnings.toPrecision(4),
          status: status
        })
      }
    })
    newRows.sort((a, b) => Math.abs(a.difference) - Math.abs(b.difference))

    setRows(newRows)
  }, [guessesContext.guesses, ethPrice, time])

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
              <TableCell>Status</TableCell>
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
                <TableCell>{row.winnings + " DAI"}</TableCell>
                <TableCell>{row.status}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  )
}

export default RoundTable
