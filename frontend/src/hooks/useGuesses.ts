import { useEffect, useState } from 'react'

// ** Web3
import { useQuery } from '@apollo/client'
import { GUESSES_QUERY } from 'src/constants/queries/queries'
import { useContext } from 'react'
import { SubgraphDataContext, GuessType } from 'src/context/subgraphDataContext'
import dayjs from 'dayjs'

interface GuessDataType {
  __typename: string
  id: string
  roundId: string
  guessId: string
  user: string
  guess: string
  winningTime: string
  disableEndTimestamp: string
  enableEndTimestamp: string
}

const useGuesses = () => {
  const [queryData, setQueryData] = useState<GuessDataType[]>()
  const [guessList, setGuessList] = useState<GuessType[]>([])

  const subgraphDataContext = useContext(SubgraphDataContext)

  const { loading, error, data } = useQuery(GUESSES_QUERY, {
    pollInterval: 5000
  })

  useEffect(() => {
    if (data) {
      setQueryData(data.guesses)
    }
  }, [data, loading])

  useEffect(() => {
    const guessList: GuessType[] = []
    if (queryData) {
      queryData.map(g => {
        guessList.push({
          id: g['id'],
          roundId: parseInt(g['roundId']),
          guessId: parseInt(g['guessId']),
          user: g['user'],
          guess: parseFloat(g['guess']) / 1e8,
          winningTime: parseInt(g['winningTime']),
          disableEndTimestamp: parseInt(g['disableEndTimestamp']),
          enableEndTimestamp: parseInt(g['enableEndTimestamp'])
        })
      })
    }
    setGuessList(guessList)
    subgraphDataContext?.setGuesses(guessList)
  }, [queryData])

  return guessList
}

export default useGuesses
