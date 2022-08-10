import { BigInt, Address } from '@graphprotocol/graph-ts';
import { CaptureTheStream, EndWinner, EnterRound, InitiateRound } from '../generated/captureTheStream/CaptureTheStream';
import { Round, Guess } from '../generated/schema';

export function handleInitiateRound(event: InitiateRound): void {
  const id = event.params.roundId.toString();

  let entity = Round.load(id);

  if (!entity) {
    entity = new Round(id);
    entity.asset = event.params.asset;
    entity.startTimestamp = event.params.startTimestamp;
    entity.endTimestamp = event.params.endTimestamp;
    entity.currentWinner = new BigInt(0);
  }
  entity.save();
}

export function handleEnterRound(event: EnterRound): void {
  const id = event.params.roundId.toString() + '-' + event.params.guessIndex.toString();

  let entity = Guess.load(id);

  if (!entity) {
    entity = new Guess(id);
    entity.roundId = event.params.roundId;
    entity.guessId = event.params.guessIndex;
    entity.user = event.params.user;
    entity.guess = event.params.guess;
    entity.winningTime = new BigInt(0);
  }
  entity.save();
}

export function handleEndWinner(event: EndWinner): void {
  const id = event.params.roundId.toString() + '-' + event.params.winningGuessIndex.toString();

  let entity = Guess.load(id);

  if (entity) {
    entity.winningTime = entity.winningTime.plus(event.params.timeWinning);
    entity.save();
  }
}
