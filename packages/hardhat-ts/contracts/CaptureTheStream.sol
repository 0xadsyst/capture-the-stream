// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

import "@chainlink/contracts/src/v0.8/interfaces/AggregatorV3Interface.sol";
import "@chainlink/contracts/src/v0.8/KeeperCompatible.sol";
import "@chainlink/contracts/src/v0.8/VRFConsumerBaseV2.sol";
import "@chainlink/contracts/src/v0.8/interfaces/VRFCoordinatorV2Interface.sol";
import "@openzeppelin/contracts/utils/math/Math.sol";
import "@openzeppelin/contracts/utils/math/SafeMath.sol";
import "@openzeppelin/contracts/utils/math/SignedSafeMath.sol";
import "@openzeppelin/contracts/utils/math/SignedMath.sol";
import "@openzeppelin/contracts/utils/math/SafeCast.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Strings.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title Capture the Stream
 * @author Adsyst (https://github.com/0xadsyst)
 */
contract CaptureTheStream is KeeperCompatibleInterface, VRFConsumerBaseV2, Ownable {
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
        uint256 disableEndTimestamp;
        uint256 enableEndTimestamp;
    }

    mapping(address => uint256) public deposits;
    mapping(uint256 => Round) public rounds;
    uint256 public roundCount;

    IERC20 public depositAsset;

    event Deposit(address user, uint256 depositAmount, uint256 balance);
    event Withdraw(address user, uint256 withdrawAmount, uint256 balance);
    event NewGuess(
        uint256 roundId,
        uint256 guessIndex,
        address user,
        uint256 balance,
        int256 guess,
        uint256 guessCost,
        uint256 disableEndTimestamp,
        uint256 enableEndTimestamp
    );

    event StartWinner(
        uint256 roundId,
        uint256 winningGuessIndex,
        address winnerAddress,
        int256 winningGuess,
        int256 currentPrice
    );
    event EndWinner(
        uint256 roundId,
        uint256 winningGuessIndex,
        address winnerAddress,
        int256 winningGuess,
        int256 currentPrice,
        uint256 timeWinning
    );
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

    event PowerUpEvent(
        string id,
        address user,
        uint256 roundId,
        string status,
        string typeOf,
        uint256 length,
        uint256 endTime,
        bool selectableTarget,
        uint256 target
    );

    struct PowerUp {
        address user;
        uint256 roundId;
        string status;
        string typeOf;
        uint256 length;
        uint256 endTime;
        bool selectableTarget;
        uint256 target;
    }

    mapping(string => PowerUp) powerUps;

    bytes32 keyHash;
    uint64 s_subscriptionId;
    VRFCoordinatorV2Interface COORDINATOR;
    address public vrfCoordinator;

    constructor(uint64 subscriptionId, address _vrfCoordinator, address _depositAsset, bytes32 _keyHash) VRFConsumerBaseV2(_vrfCoordinator) {
        COORDINATOR = VRFCoordinatorV2Interface(_vrfCoordinator);
        vrfCoordinator = _vrfCoordinator;
        s_subscriptionId = subscriptionId;
        depositAsset = IERC20(_depositAsset);
        keyHash = _keyHash;
    }

    /**
     * @notice Gets the latest price from a Chainlink oracle.
     * @param _oracle Address of oracle.
     * @return price Price returned by oracle call.
     */
    function getLatestPrice(address _oracle) public view returns (int256) {
        AggregatorV3Interface priceFeed = AggregatorV3Interface(_oracle);
        (, int256 price, , , ) = priceFeed.latestRoundData();
        return price;
    }

    /**
     * @notice Initiates a new round with the specified settings.
     * @param _oracle Address of oracle.
     * @param _startTimestamp Timestamp that the round begins (UTC).
     * @param _endTimestamp Timestamp that the round ends (UTC).
     * @param _guessCutOffTimestamp Timestamp when guesses are no longer allowed (UTC).
     * @param _numberOfGuessesAllowed Total number of guesses allowed.
     * @param _minimumGuessSpacing Minimum spacing between guesses.
     * @param _guessCost Cost in deposit asset tokens to make a guess (assuming 18 decimals currents).
     * @param _inRoundGuessesAllowed If in round guesses are allowed, the guess cutoff is set to the end timestamp.
     */
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

        roundCount++;

        emitInitiateRound(roundCount.sub(1));
    }

    /**
     * @notice Owner only function to set the address of the allowed deposit. Will be removed in production version.
     * @param _asset Address of the new deposit asset.
     */
    function setDepositAsset(address _asset) public onlyOwner {
        depositAsset = IERC20(_asset);
    }

    /**
     * @notice Deposit some amount of the deposit asset into the protocol.
     * @param _depositAmount Amount to deposit.
     */
    function deposit(uint256 _depositAmount) public {
        depositAsset.safeTransferFrom(msg.sender, address(this), _depositAmount);
        deposits[msg.sender] += _depositAmount;
        emit Deposit(msg.sender, _depositAmount, deposits[msg.sender]);
    }

    /**
     * @notice Withdraw some amount of the deposit asset from the protocol.
     * @param _withdrawAmount Amount to withdraw.
     */
    function withdraw(uint256 _withdrawAmount) public {
        require(_withdrawAmount <= deposits[msg.sender]);
        deposits[msg.sender] -= _withdrawAmount;
        SafeERC20.safeTransfer(depositAsset, msg.sender, _withdrawAmount);
        emit Withdraw(msg.sender, _withdrawAmount, deposits[msg.sender]);
    }

    /**
     * @notice Enter a guess into a round.
     * @param _roundId ID number of the round to make the guess.
     * @param _guess Price in USD of the guess. Needs to use the same amount of decimals as the oracle.
     */
    function enterRound(uint256 _roundId, int256 _guess) public {
        Round memory round = rounds[_roundId];
        require(deposits[msg.sender] >= round.guessCost, "Not enough funds to enter round");
        require(block.timestamp <= round.endTimestamp, "Round has finished");
        require(block.timestamp <= round.guessCutOffTimestamp, "Round entries have closed");
        require(
            round.numberOfGuessesAllowed == 0 || round.guesses.length < round.numberOfGuessesAllowed,
            "Round guesses are full"
        );

        deposits[msg.sender] = deposits[msg.sender].sub(round.guessCost);
        rounds[_roundId].deposits = round.deposits.add(round.guessCost);

        newGuess(msg.sender, _roundId, _guess, round.endTimestamp, round.guessCost, false);
    }

    /**
     * @notice Update the winner of a round, or close it out if it is finished.
     * @param _roundId Id number of the round to update.
     * @param _forceUpdate Set to true to force an update to a round where the winner has not changed.
     */
    function updateRound(uint256 _roundId, bool _forceUpdate) public {
        Round memory round = rounds[_roundId];
        require(block.timestamp >= round.startTimestamp, "Round hasn't started");
        require(!round.roundClosed, "Round is already closed");

        int256 price = getLatestPrice(round.oracle);

        uint256 timeSinceLastWinnerChange = block.timestamp.sub(round.lastWinnerChange);
        if (block.timestamp >= round.endTimestamp) {
            timeSinceLastWinnerChange = round.endTimestamp.sub(round.lastWinnerChange);
        }
        uint256 previousWinnerIndex = round.currentWinnerIndex;

        Guess memory previousWinnerGuess = round.guesses[previousWinnerIndex];
        rounds[_roundId].guesses[previousWinnerIndex].timeWinning += timeSinceLastWinnerChange;

        emit EndWinner(
            _roundId,
            previousWinnerIndex,
            previousWinnerGuess.user,
            previousWinnerGuess.guess,
            price,
            timeSinceLastWinnerChange
        );

        if (block.timestamp < round.endTimestamp) {
            uint256 bestGuessIndex = getBestGuess(_roundId, price);
            require(
                bestGuessIndex != round.currentWinnerIndex || _forceUpdate,
                "No change to current winner, updates can be forced using _forceUpdate = true"
            );
            rounds[_roundId].lastWinnerChange = block.timestamp;
            rounds[_roundId].currentWinnerIndex = bestGuessIndex;
            emit StartWinner(
                _roundId,
                bestGuessIndex,
                round.guesses[bestGuessIndex].user,
                round.guesses[bestGuessIndex].guess,
                price
            );
        } else {
            uint256 roundLength = round.endTimestamp.sub(round.startTimestamp);
            for (uint256 i = 0; i < round.guesses.length; i++) {
                if (round.guesses[i].timeWinning > 0) {
                    Guess memory guess = round.guesses[i];
                    uint256 winnings = round.deposits.mul(guess.timeWinning).div(roundLength);
                    require(
                        winnings <= round.deposits,
                        "Error, winnings were calculated as greater than round deposits"
                    );
                    deposits[guess.user] += winnings;
                }
            }

            rounds[_roundId].roundClosed = true;
            emit WinningGuesses(round.guesses);
        }
    }

    /**
     * @notice Internal function to get the closest guess in a round.
     * @param _roundId ID number of the round to update.
     * @param _price Current price retrieved from the oracle.
     * @return bestGuessIndex The index number of the closest guess.
     */
    function getBestGuess(uint256 _roundId, int256 _price) internal view returns (uint256) {
        uint256 bestGuessIndex;
        uint256 minPriceDifference = 2**256 - 1;

        for (uint256 i = 0; i < rounds[_roundId].guesses.length; i++) {

            if (
                block.timestamp > rounds[_roundId].guesses[i].disableEndTimestamp &&
                block.timestamp < rounds[_roundId].guesses[i].enableEndTimestamp
            ) {
                uint256 priceDifference = SignedMath.abs(_price.sub(rounds[_roundId].guesses[i].guess));

                if (priceDifference < minPriceDifference) {
                    bestGuessIndex = i;
                    minPriceDifference = priceDifference;
                }
            }
        }
        return bestGuessIndex;
    }

    /**
     * @notice Function for Chainlink keeper to check whether upkeep is required.
     * @param checkData Required by Chainlink Keeper, but unused.
     * @return upkeepNeeded True if upkeep is required.
     * @return performData Data for the upkeep, an encoded uint256 array of round numbers to be updated.
     */
    function checkUpkeep(bytes calldata checkData)
        external
        view
        override
        returns (bool upkeepNeeded, bytes memory performData)
    {
        (uint256 updatesRequired, uint256[] memory roundsToUpdate) = getRoundsToUpdate();
        upkeepNeeded = updatesRequired > 0;
        uint256[] memory roundsToUpdateFinal = new uint256[](updatesRequired);
        for (uint256 i = 0; i < updatesRequired; i++) {
            roundsToUpdateFinal[i] = roundsToUpdate[i];
        }
        performData = abi.encode(roundsToUpdateFinal);
    }

    /**
     * @notice View function to return an array of the rounds to update.
     * @return updatesRequired Count of the number of rounds that need to be updated.
     * @return roundsToUpdate Array of round numbers to be updated, note that this array is longer than required and is filtered in checkUpkeep.
     */
    function getRoundsToUpdate() public view returns (uint256, uint256[] memory) {
        uint256[] memory roundsToUpdate = new uint256[](roundCount);
        uint256 updatesRequired = 0;
        for (uint256 _roundId = 0; _roundId < roundCount; _roundId++) {
            if (block.timestamp >= rounds[_roundId].startTimestamp && block.timestamp < rounds[_roundId].endTimestamp) {
                int256 price = getLatestPrice(rounds[_roundId].oracle);

                uint256 bestGuessIndex = getBestGuess(_roundId, price);

                if (bestGuessIndex != rounds[_roundId].currentWinnerIndex) {
                    roundsToUpdate[updatesRequired] = _roundId;
                    updatesRequired++;
                }
            } else if (!rounds[_roundId].roundClosed && block.timestamp >= rounds[_roundId].endTimestamp) {
                roundsToUpdate[updatesRequired] = _roundId;
                updatesRequired++;
            }
        }
        return (updatesRequired, roundsToUpdate);
    }

    /**
     * @notice Perform the updates on rounds specified in the call data.
     * @param performData An encoded uint256 array of round numbers to be updated.
     */
    function performUpkeep(bytes calldata performData) external override {
        uint256[] memory roundsToUpdate = abi.decode(performData, (uint256[]));
        for (uint256 i = 0; i < roundsToUpdate.length; i++) {
            updateRound(roundsToUpdate[i], false);
        }
    }

    function getPowerUp(uint256 _roundId) public {
        uint256 powerUpCost = rounds[_roundId].guessCost.div(2);
        require(deposits[msg.sender] >= powerUpCost, "Not enough funds to get a power up");
        require(block.timestamp <= rounds[_roundId].endTimestamp, "Round has finished");
        require(block.timestamp >= rounds[_roundId].startTimestamp, "Round has not started");
        require((rounds[_roundId].guesses.length > 0), "Round must have at least one guess");


        PowerUp memory powerUp = PowerUp({
            user: msg.sender,
            roundId: _roundId,
            status: "UNFULFILLED",
            typeOf: "FREE_GUESS",
            length: 0,
            endTime: 0,
            selectableTarget: false,
            target: 0
        });

        deposits[msg.sender] = deposits[msg.sender].sub(powerUpCost);
        rounds[_roundId].deposits = rounds[_roundId].deposits.add(powerUpCost);

        uint256 requestId = requestRandomWords();
        string memory powerUpId = Strings.toString(requestId);
        powerUps[powerUpId] = powerUp;
        emitPowerUpEvent(powerUpId);
    }

    function requestRandomWords() internal returns (uint256 requestId) {
        uint32 callbackGasLimit = 1000000;
        uint32 numWords = 3;
        uint16 requestConfirmations = 3;

        requestId = COORDINATOR.requestRandomWords(
            keyHash,
            s_subscriptionId,
            requestConfirmations,
            callbackGasLimit,
            numWords
        );
        return requestId;
    }

    function fulfillRandomWords(uint256 requestId, uint256[] memory randomWords) internal override {
        string memory powerUpId = Strings.toString(requestId);
        fulfillPowerUp(powerUpId, randomWords);
    }

    function fulfillPowerUp(string memory _powerUpId, uint256[] memory _randomWords) public {
        string[3] memory powerUpTypes = ["DISABLE_GUESS", "TAKEOVER_GUESS", "FREE_GUESS"];
        string memory typeOf = powerUpTypes[_randomWords[0].mod(powerUpTypes.length)];
        uint256 length = _randomWords[1].mod(50).add(25);
        uint256 roundGuessCount = rounds[powerUps[_powerUpId].roundId].guesses.length;
        uint256 target = (_randomWords[2].mod(roundGuessCount * 2));
        bool selectableTarget = false;
        if (target >= roundGuessCount) {
            selectableTarget = true;
            target = 0;
        }

        powerUps[_powerUpId].typeOf = typeOf;
        powerUps[_powerUpId].length = length;
        powerUps[_powerUpId].selectableTarget = selectableTarget;
        powerUps[_powerUpId].target = target;
        powerUps[_powerUpId].status = "READY";

        if (
            !selectableTarget &&
            (keccak256(abi.encodePacked(typeOf)) != keccak256(abi.encodePacked("FREE_GUESS"))) &&
            rounds[powerUps[_powerUpId].roundId].guesses[target].user == powerUps[_powerUpId].user
        ) {
            usePowerUp(_powerUpId, target, 0);
        }
        emitPowerUpEvent(_powerUpId);
    }

    function usePowerUp(
        string memory _powerUpId,
        uint256 _target,
        int256 _guess
    ) public {
        PowerUp memory powerUp = powerUps[_powerUpId];
        Round memory round = rounds[powerUp.roundId];

        require(msg.sender == powerUp.user || msg.sender == vrfCoordinator, "You are not the owner of the power up");
        require(
            keccak256(abi.encodePacked(powerUp.status)) == keccak256(abi.encodePacked("READY")),
            "Power up is not ready or already used"
        );
        require(_target < round.guesses.length, "Invalid target for power up");
        require(block.timestamp <= round.endTimestamp, "Round has finished");

        uint256 roundTimeRemaining = round.endTimestamp.sub(block.timestamp);
        powerUps[_powerUpId].endTime = block.timestamp.add(roundTimeRemaining.mul(powerUp.length).div(100));

        if (powerUps[_powerUpId].selectableTarget) {
            powerUps[_powerUpId].target = _target;
        } else {
            _target = powerUps[_powerUpId].target;
        }

        if (keccak256(abi.encodePacked(powerUp.typeOf)) == keccak256(abi.encodePacked("DISABLE_GUESS"))) {
            require(
                rounds[powerUp.roundId].guesses[_target].disableEndTimestamp < powerUps[_powerUpId].endTime,
                "Target already disabled for longer"
            );
            rounds[powerUp.roundId].guesses[_target].disableEndTimestamp = powerUps[_powerUpId].endTime;
        } else if (keccak256(abi.encodePacked(powerUp.typeOf)) == keccak256(abi.encodePacked("TAKEOVER_GUESS"))) {
            require(
                rounds[powerUp.roundId].guesses[_target].disableEndTimestamp < powerUps[_powerUpId].endTime,
                "Target already disabled for longer"
            );
            rounds[powerUp.roundId].guesses[_target].disableEndTimestamp = powerUps[_powerUpId].endTime;
            newGuess(
                powerUp.user,
                powerUp.roundId,
                round.guesses[_target].guess,
                powerUps[_powerUpId].endTime,
                0,
                true
            );
        } else if (keccak256(abi.encodePacked(powerUp.typeOf)) == keccak256(abi.encodePacked("FREE_GUESS"))) {
            newGuess(powerUp.user, powerUp.roundId, _guess, round.endTimestamp, 0, false);
        }

        powerUps[_powerUpId].status = "USED";
        emitPowerUpEvent(_powerUpId);
    }

    function newGuess(
        address _user,
        uint256 _roundId,
        int256 _guess,
        uint256 _enableEndTimestamp,
        uint256 _guessCost,
        bool _isTakeover
    ) internal {
        Round memory round = rounds[_roundId];
        for (uint256 i = 0; i < round.guesses.length; i++) {
            uint256 guessDiff = SignedMath.abs(_guess - round.guesses[i].guess);
            require(
                _isTakeover || (guessDiff != 0 && guessDiff >= round.minimumGuessSpacing),
                "Too close to another guess"
            );
        }

        rounds[_roundId].guesses.push(
            Guess({
                user: _user,
                guess: _guess,
                timeWinning: 0,
                disableEndTimestamp: 0,
                enableEndTimestamp: _enableEndTimestamp
            })
        );

        emit NewGuess(
            _roundId,
            rounds[_roundId].guesses.length - 1,
            _user,
            deposits[_user],
            _guess,
            _guessCost,
            0,
            _enableEndTimestamp
        );
    }

    /**
     * @notice Function to complete initiate round event emission.
     */
    function emitInitiateRound(uint256 _roundCount) internal {
        emit InitiateRound(
            _roundCount,
            rounds[_roundCount].oracle,
            rounds[_roundCount].startTimestamp,
            rounds[_roundCount].endTimestamp,
            rounds[_roundCount].guessCutOffTimestamp,
            rounds[_roundCount].numberOfGuessesAllowed,
            rounds[_roundCount].minimumGuessSpacing,
            rounds[_roundCount].guessCost,
            rounds[_roundCount].inRoundGuessesAllowed
        );
    }

        function emitPowerUpEvent(string memory _powerUpId) internal {
        emit PowerUpEvent(
            _powerUpId,
            powerUps[_powerUpId].user,
            powerUps[_powerUpId].roundId,
            powerUps[_powerUpId].status,
            powerUps[_powerUpId].typeOf,
            powerUps[_powerUpId].length,
            powerUps[_powerUpId].endTime,
            powerUps[_powerUpId].selectableTarget,
            powerUps[_powerUpId].target
        );
    }
}
