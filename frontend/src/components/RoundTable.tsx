// ** MUI Imports
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import Tooltip from '@mui/material/Tooltip';
import CardHeader from '@mui/material/CardHeader'
import { Typography } from '@mui/material'

import { useEffect, useState, useContext } from 'react'
import usePrice from 'src/hooks/usePrice'
import {getGuessRanges} from 'src/utils/guesshelpers'

// ** Web3
import { RoundContext } from 'src/context/roundContext'
import { SubgraphDataContext } from 'src/context/subgraphDataContext'
import { useNetwork, useSigner } from 'wagmi'
import dayjs from 'dayjs'

interface RowType {
  guessId: number
  user: string
  guess: number
  difference: number
  winningTime: number
  winnings: string
  winningRange: string
  tempStatus: string
  border: number
  borderColor: string
}

const RoundTable = () => {
  const [rows, setRows] = useState<RowType[]>([])
  const [time, setTime] = useState(Date.now())
  const [oracle, setOracle] = useState<string>()
  const roundContext = useContext(RoundContext)
  const subgraphDataContext = useContext(SubgraphDataContext)
  const [myChain, setMyChain] = useState<number>()
  const { chain } = useNetwork()

  useEffect(() => {
    chain ? setMyChain(chain.id) : ''
  }, [chain])

  useEffect

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
      const roundData = subgraphDataContext.rounds[roundContext.roundId]
      setOracle(subgraphDataContext.rounds[roundContext.roundId].oracle)

      const sortedData = [...subgraphDataContext.guesses]
        .filter(g => {
          return g.roundId == roundContext?.roundId
        })
        .sort((a, b) => a.guess - b.guess)

      const guessRanges = getGuessRanges(subgraphDataContext.guesses, roundContext.roundId)

      sortedData.map((guessData, index) => {
        let winningRange = ''
        let winningTime = guessData['winningTime']

        const borderColor = '#F4D35E'
        let border = 0
        let decimalsForDisplay = 3
        price > 10  ? decimalsForDisplay = 2 : decimalsForDisplay = 3
        price > 100 ? decimalsForDisplay = 1 : decimalsForDisplay = 2
        price > 1000 ? decimalsForDisplay = 0 : decimalsForDisplay = 1

        const lower = guessRanges[guessData.guessId].lower
        const upper = guessRanges[guessData.guessId].upper
        const disabled =
        (guessData.disableEndTimestamp ?? Number.MAX_SAFE_INTEGER) > dayjs().unix() ||
        (guessData.enableEndTimestamp ?? 0) < dayjs().unix()
      const temporary = (guessData.enableEndTimestamp ?? 0) < roundData.endTimestamp      

        if (disabled) {
          winningRange = 'Disabled'
        } else if (lower == 0 && upper == Number.MAX_SAFE_INTEGER) {
          winningRange = '0 - Infinity'
        } else if (lower == 0) {
          winningRange = '< ' + upper.toFixed(decimalsForDisplay)
        } else if (upper == Number.MAX_SAFE_INTEGER) {
          winningRange = '> ' + lower.toFixed(decimalsForDisplay)
        } else {
          winningRange = lower.toFixed(decimalsForDisplay) + '-' + upper.toFixed(decimalsForDisplay)
        }
        if (!disabled && temporary) {
          winningRange += ' (Temp)'
        }

        if (roundData?.currentWinner == guessData.guessId) {
          if (dayjs().unix() < roundData.startTimestamp) {
            winningTime = 0
          } else if (dayjs().unix() < roundData.endTimestamp) {
            border = 5
            winningTime += dayjs().unix() - roundData?.lastWinnerChange
          } else if (!roundData.roundClosed) {
            winningTime += roundData?.endTimestamp - roundData?.lastWinnerChange

          }

        }
        const winnings =
          dayjs().unix() > roundData.startTimestamp
            ? (winningTime * roundData.deposits) / ((roundData.endTimestamp - roundData.startTimestamp) * 1e18)
            : 0

        let tempStatus = ''
        if (guessData.disableEndTimestamp > dayjs().unix()) {
          tempStatus = 'Disabled until ' + dayjs(guessData.disableEndTimestamp * 1000).format('MMM D h:mm a')
        }
        if (guessData.enableEndTimestamp < roundData.endTimestamp) {
          tempStatus = 'Enabled until ' + dayjs(guessData.enableEndTimestamp * 1000).format('MMM D h:mm a')
        }

        const hideOldTempGuesses = false

        if (guessData.enableEndTimestamp < dayjs().unix() && hideOldTempGuesses) {
          return
        }
        if (guessData['roundId'] == roundContext?.roundId) {
          newRows.push({
            guessId: guessData['guessId'],
            user: guessData['user'].substring(0,7),
            guess: guessData['guess'],
            difference: parseFloat(((price ?? guessData['guess']) - guessData['guess']).toFixed(decimalsForDisplay)),
            winningTime: winningTime,
            winnings: winnings.toFixed(4),
            winningRange: winningRange,
            tempStatus: tempStatus,
            border: border,
            borderColor: borderColor
          })
        }
      })
      newRows.sort((a, b) => Math.abs(a.difference) - Math.abs(b.difference))

      setRows(newRows)
    }
  }, [subgraphDataContext.guesses, price, time, roundContext, subgraphDataContext])

  if (!myChain) {
    return <></>
  } else {
    return (
      <Card>
        <Typography sx={{ fontSize: 18, mt: 2, ml: 5, fontWeight: 'bold'}} color="text.secondary" gutterBottom>
          Guesses
        </Typography>
        <TableContainer>
          <Table sx={{ minWidth: 800 }} aria-label='table in dashboard'>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
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
                  <Tooltip key={row.guessId} title={row.tempStatus} placement="bottom" arrow><TableCell>{row.winningRange}</TableCell></Tooltip>
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
