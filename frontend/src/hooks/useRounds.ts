import {  useEffect, useState } from 'react'

// ** Web3
import { useQuery } from '@apollo/client'
import { ROUNDS_QUERY } from '../constants/queries/queries'
import { useContext } from 'react'
import { RoundsCtx, RoundType } from 'src/context/roundsContext' 

interface RoundDataType {
__typename: string
  id: string
  startTimestamp: string
  endTimestamp: string
  currentWinner: string
}

const emptyRoundData: RoundDataType[] = []

const useRounds = () => {
  const [queryData, setQueryData] = useState(emptyRoundData)
  const [roundList, setRoundList] = useState<RoundType[]>([])

  const roundsContext = useContext(RoundsCtx)


  const { loading, error, data } = useQuery(ROUNDS_QUERY, {
    pollInterval: 5000
  })

  useEffect(() => {
    console.log("loadedData:", data)
    if (data) {
      setQueryData(data.rounds)
    }
  }, [data, loading])

  useEffect(() => {
    const roundList:RoundType[] = []
    queryData.map(r => roundList.push({
      roundId: parseInt(r["id"]),
      startTimestamp: parseInt(r["startTimestamp"]),
      endTimestamp: parseInt(r["endTimestamp"]),
      currentWinner: parseInt(r["currentWinner"]),
    })
    )
    setRoundList(roundList)
    roundsContext?.setRounds(roundList)
  },[queryData])

  return roundList
}

export default useRounds
