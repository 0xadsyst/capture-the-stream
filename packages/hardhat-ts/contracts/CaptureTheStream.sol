// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/SignedSafeMath.sol";
import "@openzeppelin/contracts/utils/math/SignedMath.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract CaptureTheStream is KeeperCompatibleInterface, Ownable {
    using SafeMath for uint256;
    using SignedSafeMath for int256;
    using SafeERC20 for IERC20;

    struct Round {
        address oracle;
        uint256 startTimestamp;
        uint256 endTimestamp;
        uint256 guessCutOffTimestamp;
        uint256 numberOfGuessesAllowed;
        uint256 minimumGuessSpacing;
        uint256 guessCost;
        bool inRoundGuessesAllowed;
        Guess[] guesses;
        uint256 currentWinnerIndex;
        uint256 lastWinnerChange;
        uint256 deposits;
        bool roundClosed;
    }

    struct Guess {
        address user;
        int256 guess;
        uint256 timeWinning;
    }

    mapping(address => uint256) public deposits;
    mapping(uint256 => Round) public rounds;
    uint256 public roundCount;
    uint256 public guessCost;
    

    IERC20 public depositAsset;

    event Deposit(address user, uint256 depositAmount, uint256 balance);
    event Withdraw(address user, uint256 withdrawAmount, uint256 balance);
    event EndRound(uint256 roundId);
    event EnterRound(uint256 roundId, uint256 guessIndex, address user, uint256 balance, int256 guess, uint256 guessCost);
    event StartWinner(uint256 roundId, uint256 winningGuessIndex, address winnerAddress, int256 winningGuess, int256 currentPrice);
    event EndWinner(uint256 roundId, uint256 winningGuessIndex, address winnerAddress, int256 winningGuess, int256 currentPrice, uint256 timeWinning);
    event WinningGuesses(Guess[] winningGuesses);
    event InitiateRound(
        uint256 roundId,
        address oracle,
        uint256 startTimestamp,
        uint256 endTimestamp,
        uint256 guessCutOffTimestamp,
        uint256 numberOfGuessesAllowed,
        uint256 minimumGuessSpacing,
        uint256 guessCost,
        bool inRoundGuessesAllowed
    );

    constructor() {
        depositAsset = IERC20(0xE81Fca457ba225C7D0921207f0b24444b9303944); // MockDAI
        guessCost = 10 * 1e18; // 10 DAI
    }

    function getLatestPrice(address _oracle) public view returns (int256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(_oracle);
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return price;
    }

    function getRoundGuesses(uint256 _roundId) public view returns (Guess[] memory) {
        return rounds[_roundId].guesses;
    }

    function initiateRound(
        address _oracle,
        uint256 _startTimestamp,
        uint256 _endTimestamp,
        uint256 _guessCutOffTimestamp,
        uint256 _numberOfGuessesAllowed,
        uint256 _minimumGuessSpacing,
        uint256 _guessCost,
        bool _inRoundGuessesAllowed
    ) public {
        require(_startTimestamp > block.timestamp, "Start time must be in the future");
        require(_endTimestamp > _startTimestamp, "endTimestamp < startTimestamp");
        rounds[roundCount].oracle = _oracle;
        rounds[roundCount].startTimestamp = _startTimestamp;
        rounds[roundCount].endTimestamp = _endTimestamp;
        rounds[roundCount].guessCutOffTimestamp = _guessCutOffTimestamp;
        rounds[roundCount].numberOfGuessesAllowed = _numberOfGuessesAllowed;
        rounds[roundCount].minimumGuessSpacing = _minimumGuessSpacing;
        rounds[roundCount].guessCost = _guessCost * 1e18;
        rounds[roundCount].inRoundGuessesAllowed = _inRoundGuessesAllowed;
        rounds[roundCount].lastWinnerChange = _startTimestamp;
        rounds[roundCount].roundClosed = false;

        emitInitiateRound();

        roundCount++;
    }

    function emitInitiateRound() internal {
        emit InitiateRound(
            roundCount,
            rounds[roundCount].oracle,
            rounds[roundCount].startTimestamp,
            rounds[roundCount].endTimestamp,
            rounds[roundCount].guessCutOffTimestamp,
            rounds[roundCount].numberOfGuessesAllowed,
            rounds[roundCount].minimumGuessSpacing,
            rounds[roundCount].guessCost,
            rounds[roundCount].inRoundGuessesAllowed
        );
    }

    function setDepositAsset (address _asset) public onlyOwner {
        depositAsset = IERC20(_asset);
    }

    function deposit(uint256 _depositAmount) public {
        depositAsset.safeTransferFrom(msg.sender, address(this), _depositAmount);
        deposits[msg.sender] += _depositAmount;
        emit Deposit(msg.sender, _depositAmount, deposits[msg.sender]);
    }

    function withdraw(uint256 _withdrawAmount) public {
        require(_withdrawAmount <= deposits[msg.sender]);
        deposits[msg.sender] -= _withdrawAmount;
        SafeERC20.safeTransfer(depositAsset, msg.sender, _withdrawAmount);
        emit Withdraw(msg.sender, _withdrawAmount, deposits[msg.sender]);
    }

    function enterRound(uint256 _roundId, int256 _guess) public {
        Round memory round = rounds[_roundId];
        require(deposits[msg.sender] >= round.guessCost, "Not enough funds to enter round");
        require(block.timestamp <= round.endTimestamp, "Round has finished");
        require(block.timestamp <= round.guessCutOffTimestamp, "Round entries have closed");
        require(round.numberOfGuessesAllowed == 0 || round.guesses.length < round.numberOfGuessesAllowed, "Round guesses are full");

        for (uint256 i = 0; i < round.guesses.length; i++) {
            uint256 guessDiff = SignedMath.abs(_guess - round.guesses[i].guess);
            require(guessDiff >= round.minimumGuessSpacing, "Too close to another guess");
        }

        Guess memory newGuess = Guess({ user: msg.sender, guess: _guess, timeWinning: 0 });
        rounds[_roundId].guesses.push(newGuess);
        deposits[msg.sender] = deposits[msg.sender].sub(round.guessCost);
        rounds[_roundId].deposits = round.deposits.add(round.guessCost);

        emit EnterRound(_roundId, rounds[_roundId].guesses.length - 1, msg.sender, deposits[msg.sender], _guess, guessCost);
    }

    function updateWinner(uint256 _roundId) public {
        Round memory round = rounds[_roundId];
        require(block.timestamp >= round.startTimestamp && block.timestamp <= round.endTimestamp, "Not within time range of round");

        int256 price = getLatestPrice(round.oracle);

        uint256 bestGuessIndex = getBestGuess(_roundId, price);

        if (bestGuessIndex == round.currentWinnerIndex) {
            revert("No change to current winner");
        } else {
            uint256 timeSinceLastWinnerChange = block.timestamp.sub(round.lastWinnerChange);
            uint256 previousWinnerIndex = round.currentWinnerIndex;
            Guess memory previousWinnerGuess = round.guesses[previousWinnerIndex];

            emit EndWinner(_roundId, previousWinnerIndex, previousWinnerGuess.user, previousWinnerGuess.guess, price, timeSinceLastWinnerChange);

            rounds[_roundId].guesses[previousWinnerIndex].timeWinning += timeSinceLastWinnerChange;
            rounds[_roundId].lastWinnerChange = block.timestamp;
            rounds[_roundId].currentWinnerIndex = bestGuessIndex;

            emit StartWinner(_roundId, bestGuessIndex, round.guesses[bestGuessIndex].user, round.guesses[bestGuessIndex].guess, price);
        }
    }

    function endRound(uint256 _roundId) public {
        Round memory round = rounds[_roundId];
        require(block.timestamp >= round.endTimestamp, "Round has not finished");

        uint256 roundLength = round.endTimestamp.sub(round.startTimestamp);
        for (uint256 i = 0; i < round.guesses.length; i++) {
            if (round.guesses[i].timeWinning > 0) {
                Guess memory guess = round.guesses[i];
                uint256 winnings = round.deposits.mul(guess.timeWinning).div(roundLength);
                require(winnings <= round.deposits, "Error, winnings were calculated as greater than round deposits");
                deposits[guess.user] += winnings;
            }
        }
        emit WinningGuesses(round.guesses);
        emit EndRound(_roundId);
    }

    function getBestGuess(uint256 _roundId, int256 _price) internal view returns (uint256) {
        uint256 bestGuessIndex;
        uint256 minPriceDifference = 2**256 - 1;
        for (uint256 i = 0; i < rounds[_roundId].guesses.length; i++) {
            uint256 priceDifference = SignedMath.abs(_price.sub(rounds[_roundId].guesses[i].guess));

            if (priceDifference < minPriceDifference) {
                bestGuessIndex = i;
                minPriceDifference = priceDifference;
            }
        }
        return bestGuessIndex;
    }

    function checkUpkeep(
        bytes calldata /* checkData */
    ) external view override returns (bool upkeepNeeded, bytes memory performData) {
        (uint256 updatesRequired, uint256[] memory roundsToUpdate) = getRoundsToUpdate();
        upkeepNeeded = updatesRequired > 0;
        uint256[] memory roundsToUpdateFinal = new uint256[](updatesRequired);
        for (uint256 i = 0; i < updatesRequired; i++) {
            roundsToUpdateFinal[i] = roundsToUpdate[i];
        }
        performData = abi.encode(roundsToUpdateFinal);
    }

    function performUpkeep(bytes calldata performData) external override {
        uint256[] memory roundsToUpdate = abi.decode(performData, (uint256[]));
        for (uint256 i = 0; i < roundsToUpdate.length; i++) {
            if (!rounds[roundsToUpdate[i]].roundClosed && block.timestamp >= rounds[roundsToUpdate[i]].endTimestamp) {
                endRound(roundsToUpdate[i]);
            } else {
                updateWinner(roundsToUpdate[i]);
            }
        }
    }

    function getRoundsToUpdate() public view returns (uint256, uint256[] memory) {
        uint256[] memory needsUpdating = new uint256[](roundCount);
        uint256 updatesRequired = 0;
        for (uint256 _roundId = 0; _roundId < roundCount; _roundId++) {
            if (block.timestamp >= rounds[_roundId].startTimestamp && block.timestamp <= rounds[_roundId].endTimestamp) {
                int256 price = getLatestPrice(rounds[_roundId].oracle);

                uint256 bestGuessIndex = getBestGuess(_roundId, price);

                if (bestGuessIndex != rounds[_roundId].currentWinnerIndex) {
                    needsUpdating[updatesRequired] = _roundId;
                    updatesRequired++;
                }
            } else if (!rounds[_roundId].roundClosed && block.timestamp >= rounds[_roundId].endTimestamp) {
                needsUpdating[updatesRequired] = _roundId;
                updatesRequired++;
            }
        }
        return (updatesRequired, needsUpdating);
    }
}
