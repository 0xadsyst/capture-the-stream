import { gql } from '@apollo/client'

export const GUESSES_ROUND_QUERY = gql`
  query GetGuesses($roundId: BigInt!) {
    guesses(where: { roundId: $roundId }) {
      id
      roundId
      guessId
      user
      guess
      winningTime
    }
  }
`
export const GUESSES_QUERY = gql`
  query GetGuesses{
    guesses{
      id
      roundId
      guessId
      user
      guess
      winningTime
    }
  }
`

export const ROUNDS_QUERY = gql`
  query GetRounds {
    rounds {
      id
      startTimestamp
      endTimestamp
      currentWinner
    }
  }
`
