// ** Web3
import { GuessType } from 'src/context/subgraphDataContext'
import dayjs from 'dayjs'

interface GuessRangeType {
  id: number
  user: string
  guess: number
  lower: number
  upper: number
}

export const getGuessRanges = (allGuesses : GuessType[], roundId: number | null) => {

    const guesses = [...allGuesses].filter(g => {
      return g.roundId == roundId
    })

    const guessesAscending = [...guesses].sort((a, b) => a.guess - b.guess)
    const guessesDescending = [...guesses].sort((a, b) => b.guess - a.guess)

    const guessRanges: GuessRangeType[] = []

    guesses.map(guess => {
      const guessBelow = guessesDescending.find(g => {
        return g.disableEndTimestamp < dayjs().unix() && g.enableEndTimestamp > dayjs().unix() && g.guess < guess.guess
      })
      const guessAbove = guessesAscending.find(g => {
        return g.disableEndTimestamp < dayjs().unix() && g.enableEndTimestamp > dayjs().unix() && g.guess > guess.guess
      })
      const lower = guessBelow ? (guess.guess + guessBelow.guess) / 2 : 0
      const upper = guessAbove ? (guess.guess + guessAbove.guess) / 2 : Number.MAX_SAFE_INTEGER
      
      
      guessRanges.push({
        id: guess.guessId,
        user: guess.user,
        guess: guess.guess,
        lower: lower,
        upper:  upper
      })
    })

  return guessRanges
}
