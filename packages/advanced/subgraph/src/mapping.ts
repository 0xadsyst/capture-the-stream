import { BigInt, Address } from '@graphprotocol/graph-ts';
import {
  CaptureTheStream,
  EndWinner,
  NewGuess,
  InitiateRound,
  StartWinner,
  PowerUpEvent,
} from '../generated/captureTheStream/CaptureTheStream';
import { Round, Guess, PowerUp } from '../generated/schema';
import { log } from '@graphprotocol/graph-ts'

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
    entity.roundClosed = false;
  }
  entity.save();
}

export function handleNewGuess(event: NewGuess): void {
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
    guessEntity.disableEndTimestamp = event.params.disableEndTimestamp;
    guessEntity.enableEndTimestamp = event.params.enableEndTimestamp;
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

  const roundId = event.params.roundId.toString();

  let roundEntity = Round.load(roundId);
  if (roundEntity && event.block.timestamp >= roundEntity.endTimestamp) {
    roundEntity.roundClosed = true;
    roundEntity.save();
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

export function handlePowerUpEvent(event: PowerUpEvent): void {
  const id = event.params.id.toString();
  log.info('Power up processing id:', [id])

  let entity = PowerUp.load(id);

  if (!entity) {
    entity = new PowerUp(id);
  }
  log.info('power up entity:', [entity.id])

  entity.user = event.params.user;
  entity.roundId = event.params.roundId;
  entity.status = event.params.status;
  entity.typeOf = event.params.typeOf;
  entity.length = event.params.length;
  entity.endTime = event.params.endTime;
  entity.selectableTarget = event.params.selectableTarget;
  entity.target = event.params.target;

  log.warning('user: ' + entity.user.toHexString(), [])
  log.warning('roundId: ' + entity.roundId.toString(), [])
  log.warning('status: ' + entity.status, [])
  log.warning('typeOf: ' + entity.typeOf, [])
  log.warning('length: ' + entity.length.toString(), [])
  log.warning('endTime: ' + entity.endTime.toString(), [])
  log.warning('selectableTarget: ' + entity.selectableTarget.toString(), [])
  log.warning('target: ' + entity.target.toString(), [])

  entity.save();

  if (entity.status == 'USED' && (entity.typeOf == 'DISABLE_GUESS' || entity.typeOf == 'TAKEOVER_GUESS')) {
    const guessId = entity.roundId.toString() + '-' + entity.target.toString();
    let guessEntity = Guess.load(guessId);
    if (guessEntity) {
      guessEntity.disableEndTimestamp = event.params.endTime;
      
      guessEntity.save()
    }

    
  }
}
