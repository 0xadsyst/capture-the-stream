// ** MUI Imports
import Card from '@mui/material/Card'
import Table from '@mui/material/Table'
import TableRow from '@mui/material/TableRow'
import TableHead from '@mui/material/TableHead'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import { Typography } from '@mui/material'

import { useEffect, useState, useContext } from 'react'
import usePrice from 'src/hooks/usePrice'

// ** Web3
import { RoundContext } from 'src/context/roundContext'
import { SubgraphDataContext, PowerUpType } from 'src/context/subgraphDataContext'
import { useNetwork, useSigner } from 'wagmi'
import dayjs from 'dayjs'

interface RowType {
  id: string
  user: string
  status: string
  typeOf: string
  endTime: string
  target: string
}

const PowerUpTable = () => {
  const [rows, setRows] = useState<RowType[]>([])
  const [oracle, setOracle] = useState<string>()
  const roundContext = useContext(RoundContext)
  const subgraphDataContext = useContext(SubgraphDataContext)
  const [myChain, setMyChain] = useState<number>()
  const { chain } = useNetwork()

  useEffect(() => {
    chain ? setMyChain(chain.id) : ''
  }, [chain])

  const price = usePrice(oracle ?? null)

  useEffect(() => {
    if (roundContext?.roundId != null) {
      const round = subgraphDataContext.rounds[roundContext.roundId]
      const newRows: RowType[] = []
      const powerUps = [...subgraphDataContext.powerUps].filter(p => {
        return p.roundId == roundContext.roundId
      })
      const guesses = [...subgraphDataContext.guesses]
      .filter(g => {
        return g.roundId == roundContext.roundId
      })

      
      powerUps.map(p => {
        let target = guesses[p.target]?.guess.toString() + ' (' + guesses[p.target]?.user.substring(0,7) + ')'
        if  (p.typeOf == 'FREE_GUESS') {
          target = 'N/A'
        } else if (p.selectableTarget && p.status != 'USED') {
          target = 'Awaiting selection'
        }

        let endTime = ''
        if (p.status == 'USED') {
          endTime = dayjs(p.endTime * 1000).format('MMM D h:mm a')
        } else if (p.typeOf == "DISABLE_GUESS" || p.typeOf == "TAKEOVER_GUESS")  {
          endTime = dayjs((dayjs().unix() + ((round.endTimestamp - dayjs().unix()) * (p.length / 100))) * 1000).format('MMM D h:mma')
        }
        let powerUpType = ''
        powerUpType = p.typeOf == "DISABLE_GUESS" ? powerUpType = 'Disable Guess' : powerUpType
        powerUpType = p.typeOf == "TAKEOVER_GUESS" ? powerUpType = 'Takeover Guess' : powerUpType
        powerUpType = p.typeOf == "FREE_GUESS" ? powerUpType = 'Free Guess' : powerUpType

        let status = ''
        p.status == "UNFULFILLED" ? status = 'Waiting for VRF' : null
        p.status == "READY" ? status = 'Ready!' : null
        p.status == "USED" ? status = 'Used' : null
        console.log(p.typeOf, p.status)
        console.log(powerUpType, status)

        newRows.push({
          id: p.id.length > 5 ? p.id.substring(p.id.length - 5, p.id.length - 1) : p.id,
          user: p.user.substring(0, 8),
          status: status,
          typeOf: p.status == 'UNFULFILLED' ? '' : powerUpType,
          endTime: endTime,
          target: p.status == 'UNFULFILLED' ? '' : target 
        })
      })

      setRows(newRows)
    }
  }, [roundContext?.roundId, subgraphDataContext.powerUps, subgraphDataContext.guesses])

  if (!myChain) {
    return <></>
  } else {
    return (
      <Card>
        <Typography sx={{ fontSize: 18, mt: 2, ml: 5, fontWeight: 'bold'}} color="text.secondary" gutterBottom>
          Power Ups
        </Typography>
        <TableContainer>
          <Table sx={{ minWidth: 800 }} aria-label='table in dashboard'>
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>User</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>End Time</TableCell>
                <TableCell>Target</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {rows.map((row: RowType) => (
                <TableRow key={row.id}>
                  <TableCell>{row.id}</TableCell>
                  <TableCell>{row.user}</TableCell>
                  <TableCell>{row.status}</TableCell>
                  <TableCell>{row.typeOf}</TableCell>
                  <TableCell>{row.endTime}</TableCell>
                  <TableCell>{row.target}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Card>
    )
  }
}

export default PowerUpTable
