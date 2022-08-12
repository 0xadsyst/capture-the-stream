import { gql } from '@apollo/client'

export const GUESSES_QUERY = gql`
  query GetGuesses {
    guesses {
      id
      roundId
      guessId
      user
      guess
      guessCost
      winningTime
    }
  }
`

export const ROUNDS_QUERY = gql`
  query GetRounds {
    rounds {
      id
      oracle
      startTimestamp
      endTimestamp
      guessCutOffTimestamp
      numberOfGuessesAllowed
      minimumGuessSpacing
      guessCost
      inRoundGuessesAllowed
      currentWinner
      lastWinnerChange
      deposits
    }
  }
`
