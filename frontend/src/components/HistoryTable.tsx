// ** MUI Imports
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'

import { useEffect, useState, useContext } from 'react'

// ** Web3
import { RoundContext } from 'src/context/roundContext'
import { SubgraphDataContext } from 'src/context/subgraphDataContext'
import { useNetwork, useSigner } from 'wagmi'
import { useRouter } from 'next/router'

interface RowType {
  roundId: string
  entries: number
  entriesCost: number
  winnings: number
  profitLoss: number
}

const HistoryTable = () => {
  const [rows, setRows] = useState<RowType[]>([])
  const [myAddress, setMyAddress] = useState<string>('')
  const [time, setTime] = useState(Date.now())
  const roundContext = useContext(RoundContext)
  const subgraphDataContext = useContext(SubgraphDataContext)
  const { data: signer} = useSigner()
  const { chain } = useNetwork()
  const router = useRouter()

  function handleRoundClick(roundId: string) {
    if (roundId != "Totals") {
      roundContext?.setRoundId(parseInt(roundId))
      router.push('./round')
    }
  }

  useEffect(() => {
    if (signer) {
      signer
        .getAddress()
        .then(value => {
          setMyAddress(value)
        })
    }
  }, [signer])

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 1000)

    return () => {
      clearInterval(interval)
    }
  }, [])

  useEffect(() => {
    const newRows: RowType[] = []
    const totalsRow: RowType = {
      roundId: "Totals",
      entries: 0,
      entriesCost: 0,
      winnings: 0, 
      profitLoss: 0
    }

    for (let i = 0; i < subgraphDataContext.rounds.length; i++) {

      const roundGuesses = subgraphDataContext.guesses.filter(guess => {
        return (guess.user.toLowerCase() == myAddress.toLowerCase() && guess.roundId == i)
      })
      
      const entries = roundGuesses.length
      if (entries > 0) {
        const entriesCost = subgraphDataContext.rounds[i].guessCost * entries / 1e18
        let roundWinningTime = 0
        roundGuesses.map(guess => {
          console.log(guess.id, guess.winningTime)
          roundWinningTime = +guess.winningTime
        })
        const winnings = parseFloat((
          (subgraphDataContext.rounds[i].deposits * roundWinningTime) /
          (subgraphDataContext.rounds[i].endTimestamp - subgraphDataContext.rounds[i].startTimestamp) * 1e-18).toFixed(2))
        const profitLoss = winnings - entriesCost
        newRows.push({
          roundId: i.toString(),
          entries: entries,
          entriesCost: entriesCost,
          winnings: winnings,
          profitLoss: parseFloat(profitLoss.toFixed(2))
        })
        totalsRow.entries += entries
        totalsRow.entriesCost += entriesCost
        totalsRow.winnings += winnings
        totalsRow.profitLoss += parseFloat(profitLoss.toFixed(2))
      }
    }
    newRows.push(totalsRow)
    setRows(newRows)
  }, [myAddress, subgraphDataContext.guesses, subgraphDataContext.rounds])

  if (!myAddress) {
    return <></>
  } else {
    return (
      <Card>
        <TableContainer>
          <Table sx={{ minWidth: 800 }} aria-label='table in dashboard'>
            <TableHead>
              <TableRow>
                <TableCell>Round</TableCell>
                <TableCell>Guesses</TableCell>
                <TableCell>Guesses Cost</TableCell>
                <TableCell>Winnings</TableCell>
                <TableCell>Profit / Loss</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row: RowType) => (
                <TableRow hover key={row.roundId} sx={{ '&:last-of-type td, &:last-of-type th': { border: 0 } }} onClick={() => handleRoundClick(row.roundId)}>
                  <TableCell>{row.roundId}</TableCell>
                  <TableCell>{row.entries}</TableCell>
                  <TableCell>{row.entriesCost + ' DAI'}</TableCell>
                  <TableCell>{row.winnings + ' DAI'}</TableCell>
                  <TableCell>{row.profitLoss + ' DAI'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    )
  }
}

export default HistoryTable
