import {  useEffect, useState } from 'react'

// ** Web3
import { useQuery, getApolloContext} from '@apollo/react-components'
import { ROUNDS_QUERY } from 'src/constants/queries/queries'
import { useContext } from 'react'
import { SubgraphDataContext, RoundType } from 'src/context/subgraphDataContext'


interface RoundDataType {
__typename: string
id: string
oracle: string
startTimestamp: string
  endTimestamp: string
  guessCutOffTimestamp: string
  numberOfGuessesAllowed: string
  minimumGuessSpacing: string
  guessCost: string
  inRoundGuessesAllowed: string
  currentWinner: string
  lastWinnerChange: string
  deposits: string
  roundClosed: string
}

const emptyRoundData: RoundDataType[] = []

const useRounds = () => {
  const [queryData, setQueryData] = useState(emptyRoundData)
  const [roundList, setRoundList] = useState<RoundType[]>([])

  const subgraphDataContext = useContext(SubgraphDataContext)
  const apolloContext = useContext(getApolloContext())

  const { loading, error, data } = useQuery(ROUNDS_QUERY, {
    pollInterval: 5000
  })

  useEffect(() => {
    console.log("useRounds: Apollo client context updated:", apolloContext.client?.link)
  }, [apolloContext.client?.link])
  
  useEffect(() => {
    console.log("error:", error?.message.toString())
  }, [error])

  useEffect(() => {
      setQueryData(data?.rounds ?? [])
  }, [data, loading])

  useEffect(() => {
    const roundList:RoundType[] = []
    queryData.map(r => roundList.push({
      roundId: parseInt(r["id"]),
      oracle: r["oracle"],
      startTimestamp: parseInt(r["startTimestamp"]),
      endTimestamp: parseInt(r["endTimestamp"]),
      guessCutOffTimestamp: parseInt(r["guessCutOffTimestamp"]),
      numberOfGuessesAllowed: parseInt(r["numberOfGuessesAllowed"]),
      minimumGuessSpacing: parseInt(r["minimumGuessSpacing"]),
      guessCost: parseInt(r["guessCost"]),
      inRoundGuessesAllowed: Boolean(r["inRoundGuessesAllowed"]),
      currentWinner: parseInt(r["currentWinner"]),
      lastWinnerChange: parseInt(r["lastWinnerChange"]),      
      deposits: parseInt(r["deposits"]),
      roundClosed: Boolean(r["roundClosed"]),
    })
    )
    setRoundList(roundList)
    subgraphDataContext?.setRounds(roundList)
  },[queryData])

  return roundList
}

export default useRounds
