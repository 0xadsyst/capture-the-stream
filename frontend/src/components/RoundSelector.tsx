import React, {useContext} from 'react'

// ** MUI Imports
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { FormControl } from '@mui/material'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'

import { useEffect, useState } from 'react'

// ** Web3
import { SubgraphDataContext, RoundType } from 'src/context/subgraphDataContext' 
import { RoundContext } from 'src/context/roundContext'

const emptyList = [<MenuItem value={0} key ="">0</MenuItem>]

const RoundSelector = () => {
  const subgraphDataContext = useContext(SubgraphDataContext)
  const roundContext = useContext(RoundContext)

  const [items, setItems] = useState<any[]>([])
  const [selectedValue, setSelectedValue] = useState<string>("")

  const handleChange = (event:SelectChangeEvent<string>) => {
    console.log("event.target.value", event.target.value)
    setSelectedValue(event.target.value.toString())
    roundContext?.setRoundId(parseInt(event.target.value))
  }

  useEffect(() => {
    if (subgraphDataContext.rounds) {
      const newItemList = subgraphDataContext.rounds.map(r => {
        return (
          <MenuItem value={r.roundId} key={r.roundId}>
            {r.roundId}
          </MenuItem>
        )
      })
      setItems(newItemList)
    }
  }, [subgraphDataContext.rounds])

  return (
    <FormControl fullWidth>
      <InputLabel id='round-select-label'>Round</InputLabel>
      <Select labelId='roundId-label' id='roundId-select' value={selectedValue} label='Round' onChange={handleChange}>
        {items}
      </Select>
    </FormControl>
  )
}

export default RoundSelector
