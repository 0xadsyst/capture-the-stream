import { BigInt, Address } from '@graphprotocol/graph-ts';
import { CaptureTheStream, EndWinner, EnterRound, InitiateRound, StartWinner } from '../generated/captureTheStream/CaptureTheStream';
import { Round, Guess } from '../generated/schema';

export function handleInitiateRound(event: InitiateRound): void {
  const id = event.params.roundId.toString();

  let entity = Round.load(id);

  if (!entity) {
    entity = new Round(id);
    entity.oracle = event.params.oracle;
    entity.startTimestamp = event.params.startTimestamp;
    entity.endTimestamp = event.params.endTimestamp;
    entity.guessCutOffTimestamp = event.params.guessCutOffTimestamp;
    entity.numberOfGuessesAllowed = event.params.numberOfGuessesAllowed;
    entity.minimumGuessSpacing = event.params.minimumGuessSpacing;
    entity.guessCost = event.params.guessCost;
    entity.inRoundGuessesAllowed = event.params.inRoundGuessesAllowed;
    entity.lastWinnerChange = event.params.startTimestamp;
    entity.currentWinner = new BigInt(0);
    entity.deposits = new BigInt(0);
  }
  entity.save();
}

export function handleEnterRound(event: EnterRound): void {
  const guessId = event.params.roundId.toString() + '-' + event.params.guessIndex.toString();

  let guessEntity = Guess.load(guessId);

  if (!guessEntity) {
    guessEntity = new Guess(guessId);
    guessEntity.roundId = event.params.roundId;
    guessEntity.guessId = event.params.guessIndex;
    guessEntity.user = event.params.user;
    guessEntity.guess = event.params.guess;
    guessEntity.guessCost = event.params.guessCost;
    guessEntity.winningTime = new BigInt(0);
  }
  guessEntity.save();

  const roundId = event.params.roundId.toString();

  let roundEntity = Round.load(roundId);

  if (roundEntity) {
    roundEntity.deposits = roundEntity.deposits.plus(event.params.guessCost);
    roundEntity.save();
  }
}

export function handleEndWinner(event: EndWinner): void {
  const id = event.params.roundId.toString() + '-' + event.params.winningGuessIndex.toString();

  let entity = Guess.load(id);

  if (entity) {
    entity.winningTime = entity.winningTime.plus(event.params.timeWinning);
    entity.save();
  }
}

export function handleStartWinner(event: StartWinner): void {
  const roundId = event.params.roundId.toString();

  let roundEntity = Round.load(roundId);

  if (roundEntity) {
    roundEntity.currentWinner = event.params.winningGuessIndex;
    roundEntity.lastWinnerChange = event.block.timestamp;
    roundEntity.save();
  }
}