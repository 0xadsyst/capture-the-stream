import React, {useContext} from 'react'

// ** MUI Imports
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { FormControl } from '@mui/material'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'

import { useEffect, useState } from 'react'

// ** Web3
import { RoundsCtx, RoundType } from 'src/context/roundsContext' 
import { RoundCtx } from 'src/context/roundContext'

const emptyList = [<MenuItem value={0} key ="">0</MenuItem>]

const RoundSelector = () => {
  const roundsContext = useContext(RoundsCtx)
  const roundContext = useContext(RoundCtx)

  const [items, setItems] = useState<any[]>([])
  const [selectedValue, setSelectedValue] = useState<string>("")

  const handleChange = (event:SelectChangeEvent<string>) => {
    console.log("event.target.value", event.target.value)
    setSelectedValue(event.target.value.toString())
    roundContext?.setRoundId(event.target.value)
  }

  useEffect(() => {
    if (roundsContext.rounds) {
      const newItemList = roundsContext.rounds.map(r => {
        return (
          <MenuItem value={r.roundId} key={r.roundId}>
            {r.roundId}
          </MenuItem>
        )
      })
      setItems(newItemList)
    }
  }, [roundsContext.rounds])

  return (
    <FormControl fullWidth>
      <InputLabel id='demo-simple-select-label'>Round</InputLabel>
      <Select labelId='roundId-label' id='roundId-select' value={selectedValue} label='Round' onChange={handleChange}>
        {items}
      </Select>
    </FormControl>
  )
}

export default RoundSelector
