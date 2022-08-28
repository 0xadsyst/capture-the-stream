import { createContext, Dispatch, SetStateAction } from 'react'

export interface RoundType {
  roundId: number
  oracle: string
  startTimestamp: number
  endTimestamp: number
  guessCutOffTimestamp: number
  numberOfGuessesAllowed: number
  minimumGuessSpacing: number
  guessCost: number
  inRoundGuessesAllowed: boolean
  currentWinner: number
  lastWinnerChange: number
  deposits: number
  roundClosed: boolean
}

export interface GuessType {
  id: string
  roundId: number
  guessId: number
  user: string
  guess: number
  winningTime: number
  disableEndTimestamp: number
  enableEndTimestamp: number
}

export interface PowerUpType {
  id: string
  user: string
  roundId: number
  status: string
  typeOf: string
  length: number
  endTime: number
  selectableTarget: boolean
  target: number
}

export interface SubgraphDataContextInterface {
  rounds: RoundType[]
  setRounds: Dispatch<SetStateAction<RoundType[] | undefined>>
  guesses: GuessType[]
  setGuesses: Dispatch<SetStateAction<GuessType[] | undefined>>
  powerUps: PowerUpType[]
  setPowerUps: Dispatch<SetStateAction<PowerUpType[] | undefined>>
}

export const SubgraphDataContext = createContext<SubgraphDataContextInterface>({
  rounds: [],
  setRounds: () => null,
  guesses: [],
  setGuesses: () => null,
  powerUps: [],
  setPowerUps: () => null
})
