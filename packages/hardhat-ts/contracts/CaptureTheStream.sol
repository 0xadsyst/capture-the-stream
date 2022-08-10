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
//import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Strings.sol";

contract CaptureTheStream is KeeperCompatibleInterface {
    using SafeMath for uint256;
    using SignedSafeMath for int256;
    using SafeERC20 for IERC20;

    struct Round {
        address asset;
        address oracle;
        uint256 startTimestamp;
        uint256 endTimestamp;
        Guess[] guesses;
        uint256 currentWinnerIndex;
        uint256 lastWinnerChange;
        uint256 deposits;
    }

    struct Guess {
        address user;
        int256 guess;
        uint256 timeWinning;
    }

    mapping(address => uint256) public deposits;
    mapping(address => AggregatorV3Interface) public oracles;
    mapping(uint256 => Round) public rounds;
    uint256 public roundCount;
    uint256 public guessCost;

    IERC20 public depositAsset;

    event Deposit(address user, uint256 depositAmount, uint256 balance);
    event Withdraw(address user, uint256 withdrawAmount, uint256 balance);
    event InitiateRound(uint256 roundId, address asset, uint256 startTimestamp, uint256 endTimestamp);
    event EndRound(uint256 roundId);
    event EnterRound(uint256 roundId, uint256 guessIndex, address user, uint256 balance, int256 guess);
    event StartWinner(uint256 roundId, uint256 winningGuessIndex, address winnerAddress, int256 winningGuess, int256 currentPrice);
    event EndWinner(uint256 roundId, uint256 winningGuessIndex, address winnerAddress, int256 winningGuess, int256 currentPrice, uint256 timeWinning);
    event WinningGuesses(Guess[] winningGuesses);

    constructor() {
        oracles[0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2] = AggregatorV3Interface(0x0715A7794a1dc8e42615F059dD6e406A6594651A);
        depositAsset = IERC20(0xE81Fca457ba225C7D0921207f0b24444b9303944); // MockDAI
        guessCost = 10 * 1e18; // 10 DAI
    }

    function getLatestPrice(address _asset) public view returns (int256) {
        AggregatorV3Interface priceFeed = oracles[_asset];
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return price.div(1e8);
    }

    function initiateRound() public //address _asset,
    //uint256 _startTimestamp,
    //uint256 _endTimestamp
    {
        address _asset = 0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2;
        uint256 _startTimestamp = block.timestamp;
        uint256 _endTimestamp = _startTimestamp + 1000;
        require(_endTimestamp > _startTimestamp, "_endTimestamp < _startTimestamp");
        rounds[roundCount].asset = _asset;
        rounds[roundCount].startTimestamp = _startTimestamp;
        rounds[roundCount].endTimestamp = _endTimestamp;
        rounds[roundCount].lastWinnerChange = _startTimestamp;

        emit InitiateRound(roundCount, _asset, _startTimestamp, _endTimestamp);

        roundCount++;
    }

    function setDepositAsset(address _asset) public {
        depositAsset = IERC20(_asset);
    }

    function setOracle(address _asset, address _oracle) public {
        oracles[_asset] = AggregatorV3Interface(_oracle);
    }

    function deposit(uint256 _depositAmount) public {
        depositAsset.safeTransferFrom(msg.sender, address(this), _depositAmount);
        deposits[msg.sender] += _depositAmount;
        emit Deposit(msg.sender, _depositAmount, deposits[msg.sender]);
    }

    function withdraw(uint256 _withdrawAmount) public {
        require(_withdrawAmount <= deposits[msg.sender]);
        deposits[msg.sender] -= _withdrawAmount;
        SafeERC20.safeTransfer(depositAsset, address(this), _withdrawAmount);
        emit Withdraw(msg.sender, _withdrawAmount, deposits[msg.sender]);
    }

    function daiBalance() public view returns (uint256) {
        return depositAsset.balanceOf(msg.sender);
    }

    function connectedUser() public view returns (address) {
        return msg.sender;
    }

    function enterRound(uint256 _roundId, int256 _guess) public {
        require(deposits[msg.sender] >= guessCost, "Not enough funds to enter round");
        require(block.timestamp <= rounds[_roundId].endTimestamp, "Round has finished");

        Guess memory newGuess = Guess({ user: msg.sender, guess: _guess, timeWinning: 0 });
        rounds[_roundId].guesses.push(newGuess);
        deposits[msg.sender] = deposits[msg.sender].sub(guessCost);
        rounds[_roundId].deposits += guessCost;

        emit EnterRound(_roundId, rounds[_roundId].guesses.length - 1, msg.sender, deposits[msg.sender], _guess);
    }

    function updateWinner(uint256 _roundId) public {
        require(block.timestamp >= rounds[_roundId].startTimestamp && block.timestamp <= rounds[_roundId].endTimestamp, "Not within time range of round");

        int256 price = getLatestPrice(rounds[_roundId].asset);

        uint256 bestGuessIndex = getBestGuess(_roundId, price);

        if (bestGuessIndex == rounds[_roundId].currentWinnerIndex) {
            revert("No change to current winner");
        } else {
            uint256 timeSinceLastWinnerChange = block.timestamp.sub(rounds[_roundId].lastWinnerChange);
            uint256 previousWinnerIndex = rounds[_roundId].currentWinnerIndex;
            Guess memory previousWinnerGuess = rounds[_roundId].guesses[previousWinnerIndex];

            emit EndWinner(_roundId, previousWinnerIndex, previousWinnerGuess.user, previousWinnerGuess.guess, price, timeSinceLastWinnerChange);

            rounds[_roundId].guesses[previousWinnerIndex].timeWinning += timeSinceLastWinnerChange;
            rounds[_roundId].lastWinnerChange = block.timestamp;
            rounds[_roundId].currentWinnerIndex = bestGuessIndex;

            emit StartWinner(_roundId, bestGuessIndex, rounds[_roundId].guesses[bestGuessIndex].user, rounds[_roundId].guesses[bestGuessIndex].guess, price);
        }
    }

    function endRound(uint256 _roundId) public {
        require(block.timestamp >= rounds[_roundId].endTimestamp, "Round has not finished");
        Round memory round = rounds[_roundId];
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
            updateWinner(roundsToUpdate[i]);
        }
    }

    function getRoundsToUpdate() public view returns (uint256, uint256[] memory) {
        uint256[] memory needsUpdating = new uint256[](roundCount);
        uint256 updatesRequired = 0;
        for (uint256 _roundId = 0; _roundId < roundCount; _roundId++) {
            if (block.timestamp >= rounds[_roundId].startTimestamp && block.timestamp <= rounds[_roundId].endTimestamp) {
                int256 price = getLatestPrice(rounds[_roundId].asset);

                uint256 bestGuessIndex = getBestGuess(_roundId, price);

                if (bestGuessIndex != rounds[_roundId].currentWinnerIndex) {
                    needsUpdating[updatesRequired] = _roundId;
                    updatesRequired++;
                }
            }
        }
        return (updatesRequired, needsUpdating);
    }
}
