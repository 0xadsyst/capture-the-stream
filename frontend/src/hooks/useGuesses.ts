import { useEffect, useState } from 'react'

// ** Web3
import { useQuery } from '@apollo/client'
import { GUESSES_QUERY } from '../constants/queries/queries'
import { useContext } from 'react'
import { GuessesContext, GuessType } from 'src/context/guessesContext'

interface GuessDataType {
  __typename: string
  id: string
  roundId: string
  guessId: string
  user: string
  guess: string
  winningTime: string
}

const useGuesses = () => {
  const [queryData, setQueryData] = useState<GuessDataType[]>()
  const [guessList, setGuessList] = useState<GuessType[]>([])

  const guessesContext = useContext(GuessesContext)

  const { loading, error, data } = useQuery(GUESSES_QUERY, {
    pollInterval: 5000
  })

  useEffect(() => {
    console.log("guessData", data)
    if (data) {
      setQueryData(data.guesses)
    }
  }, [data, loading])

  useEffect(() => {
    const guessList: GuessType[] = []
    console.log("guess queryData", queryData)
    if (queryData) {
      queryData.map(g =>
        guessList.push({
          id: g['id'],
          roundId: parseInt(g['roundId']),
          guessId: parseInt(g['guessId']),
          user: g['user'],
          guess: parseFloat(g['guess']) / 1e8,
          winningTime: parseInt(g['winningTime'])
        })
      )
    }
    console.log("guessList", guessList)
    setGuessList(guessList)
    guessesContext?.setGuesses(guessList)
  }, [queryData])

  return guessList
}

export default useGuesses
