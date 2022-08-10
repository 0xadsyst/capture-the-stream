import React from 'react'

// ** MUI Imports
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { FormControl } from '@mui/material'
import MenuItem from '@mui/material/MenuItem'
import InputLabel from '@mui/material/InputLabel'

import { ProviderProps, useEffect, useState } from 'react'

// ** Web3
import { useQuery } from '@apollo/client'
import { ROUNDS_QUERY } from '../constants/queries/queries'

interface RoundDataType {
  __typeName: string
  id: string
}

const emptyList = [<MenuItem value={0} key ="">0</MenuItem>]
const emptyQueryData: number[] = []
const emptyRoundData: RoundDataType[] = []

interface Props {
  onChange: (e: SelectChangeEvent) => void
  roundId: number | undefined
}

const RoundSelector = (props: Props) => {
  const [items, setItems] = useState(emptyList)
  const [queryData, setQueryData] = useState(emptyRoundData)

  const { loading, error, data } = useQuery(ROUNDS_QUERY, {
    pollInterval: 5000
  }
  )

  useEffect(() => {
    if (data) {
      console.log('rounds data:', data)
      setQueryData(data.rounds)
    }
  }, [data, loading])

  useEffect(() => {
    console.log('queryData:', queryData)
    if (queryData) {
      const newItemList = queryData.map((q, index) => {
        return (
          <MenuItem value={q['id']} key={index}>
            {q['id']}
          </MenuItem>
        )
      })
      setItems(newItemList)
    }
  }, [queryData])

  return (
    <FormControl fullWidth>
      <InputLabel id='demo-simple-select-label'>Round</InputLabel>
      <Select labelId='roundId-label' id='roundId-select' value={props.roundId ? props.roundId.toString() : ''} label='Round' onChange={props.onChange}>
        {items}
      </Select>
    </FormControl>
  )
}

export default RoundSelector
