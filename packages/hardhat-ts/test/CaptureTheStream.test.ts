import '../helpers/hardhat-imports';

import './helpers/chai-imports';

import { expect } from 'chai';
import {
  CaptureTheStream,
  CaptureTheStream__factory,
  MockChainlinkAggregator,
  MockChainlinkAggregator__factory,
  MockDAI,
  MockDAI__factory,
} from 'generated/contract-types';
import hre from 'hardhat';
import { ethers } from 'hardhat';
import { getHardhatSigners } from 'tasks/functions/accounts';
import { SignerWithAddress } from 'hardhat-deploy-ethers/signers';
import { CaptureTheStreamInterface } from 'generated/contract-types/contracts/CaptureTheStream';
import { BigNumber } from 'ethers';

const {
  BN, // Big Number support
  constants, // Common constants, like the zero address and largest integers
  expectEvent, // Assertions for emitted events
  expectRevert, // Assertions for transactions that should fail
} = require('@openzeppelin/test-helpers');

describe('CTS', function () {
  let captureTheStreamContract: CaptureTheStream;
  let mockChainlinkAggregatorContract: MockChainlinkAggregator;
  let mockDAIContract: MockDAI;
  let deployer: SignerWithAddress;
  let deployerAddress: string;

  this.beforeAll(async () => {
    deployer = (await getHardhatSigners(hre)).deployer;
    deployerAddress = deployer.address;

    const captureTheStreamFactory = new CaptureTheStream__factory(deployer);
    captureTheStreamContract = await captureTheStreamFactory.deploy();
    const mockChainlinkAggregatorFactory = new MockChainlinkAggregator__factory(deployer);
    mockChainlinkAggregatorContract = await mockChainlinkAggregatorFactory.deploy(18, 0);
    const mockDAIFactory = new MockDAI__factory(deployer);
    mockDAIContract = await mockDAIFactory.deploy();

    await captureTheStreamContract.deployed();
    await mockChainlinkAggregatorContract.deployed();
    await mockDAIContract.deployed();
  });

  describe('Deposits', function () {
    before(async () => {});

    beforeEach(async () => {});

    it('Should be able to mint', async function () {
      const beforeMintBalance = await mockDAIContract.balanceOf(deployerAddress);
      console.log('Before mint balance: ', ethers.utils.formatEther(beforeMintBalance));
      await mockDAIContract.mint(deployerAddress, ethers.BigNumber.from('100000000000000000000'));
      const afterMintBalance = await mockDAIContract.balanceOf(deployerAddress);
      console.log('After mint balance: ', ethers.utils.formatEther(afterMintBalance));
      expect(afterMintBalance).to.equal(beforeMintBalance.add(ethers.BigNumber.from('100000000000000000000')));
    });

    it('Should be able to set the deposit asset', async function () {
      await captureTheStreamContract.setDepositAsset(mockDAIContract.address);
      expect(await captureTheStreamContract.depositAsset()).to.equal(mockDAIContract.address);
    });

    it('Should be able to deposit', async function () {
      const depositAmount = ethers.BigNumber.from('100000000000000000000');
      const beforeDepositContractBalance = await captureTheStreamContract.deposits(deployerAddress);
      console.log('Before deposit contract balance: ', ethers.utils.formatEther(beforeDepositContractBalance));
      const beforeDepositBalance = await mockDAIContract.balanceOf(deployerAddress);
      console.log('Before deposit  balance: ', ethers.utils.formatEther(beforeDepositBalance));
      await captureTheStreamContract.deposit(depositAmount);
      const afterDepositContractBalance = await captureTheStreamContract.deposits(deployerAddress);
      console.log('After deposit contract balance: ', ethers.utils.formatEther(afterDepositContractBalance));
      const afterDepositBalance = await mockDAIContract.balanceOf(deployerAddress);
      console.log('After deposit  balance: ', ethers.utils.formatEther(afterDepositBalance));
      expect(afterDepositContractBalance).to.equal(beforeDepositContractBalance.add(depositAmount));
      expect(afterDepositBalance).to.equal(beforeDepositBalance.sub(depositAmount));
    });

    it('Should be able to withdraw', async function () {
      const withdrawAmount = ethers.BigNumber.from('10000000000000000000');
      const beforeWithdrawContractBalance = await captureTheStreamContract.deposits(deployerAddress);
      console.log('Before withdraw contract balance: ', ethers.utils.formatEther(beforeWithdrawContractBalance));
      const beforeWithdrawBalance = await mockDAIContract.balanceOf(deployerAddress);
      console.log('Before withdraw  balance: ', ethers.utils.formatEther(beforeWithdrawBalance));
      await captureTheStreamContract.withdraw(withdrawAmount);
      const afterWithdrawContractBalance = await captureTheStreamContract.deposits(deployerAddress);
      console.log('After withdraw contract balance: ', ethers.utils.formatEther(afterWithdrawContractBalance));
      const afterWithdrawBalance = await mockDAIContract.balanceOf(deployerAddress);
      console.log('After withdraw  balance: ', ethers.utils.formatEther(afterWithdrawBalance));
      expect(afterWithdrawContractBalance).to.equal(beforeWithdrawContractBalance.sub(withdrawAmount));
      expect(afterWithdrawBalance).to.equal(beforeWithdrawBalance.add(withdrawAmount));
    });
  });

  describe('Initiate Round Tests', function () {
    let valuesArray: [string, number, number, number, number, number, number, boolean];
    let baseData: any;

    before(() => {
      baseData = {
        oracle: mockChainlinkAggregatorContract.address,
        startTimestamp: parseInt((Date.now() / 1000).toString()) + 100,
        endTimestamp: parseInt((Date.now() / 1000).toString()) + 1000,
        guessCutOffTimestamp: parseInt((Date.now() / 1000).toString()) + 1000,
        numberOfGuessesAllowed: 0,
        minimumGuessSpacing: 0,
        guessCost: 10,
        inRoundGuessesAllowed: true,
      };
    });

    beforeEach(async () => {});

    it('Should be able to initiate a round with valid data', async function () {
      valuesArray = [...Object.values(baseData)] as [string, number, number, number, number, number, number, boolean];
      const initTx = await captureTheStreamContract.initiateRound(...valuesArray);
      expect(initTx.confirmations).is.greaterThan(0);
      await captureTheStreamContract.rounds(0);
    });

    it('Should not be able to initiate a round with startTimestamp > block.timestamp', async function () {
      const baseDataTemp = { ...baseData };
      baseDataTemp.startTimestamp = parseInt((Date.now() / 1000).toString()) - 100;
      valuesArray = [...Object.values(baseDataTemp)] as [string, number, number, number, number, number, number, boolean];
      await expectRevert(captureTheStreamContract.initiateRound(...valuesArray), 'Start time must be in the future');
    });

    it('Should not be able to initiate a round with endTimestamp < startTimestamp>', async function () {
      const baseDataTemp = { ...baseData };
      baseDataTemp.endTimestamp = parseInt((Date.now() / 1000).toString()) + 50;
      valuesArray = [...Object.values(baseDataTemp)] as [string, number, number, number, number, number, number, boolean];
      await expectRevert(captureTheStreamContract.initiateRound(...valuesArray), 'endTimestamp < startTimestamp');
    });
  });

  describe('Enter Round Tests', function () {
    before(async () => {});

    beforeEach(async () => {});

    it('Should be able to enter a round with valid data', async function () {
      const roundId = 0;
      const guess = 1000;
      await captureTheStreamContract.enterRound(roundId, guess);
      const roundGuesses = await captureTheStreamContract.getRoundGuesses(roundId);
      expect(roundGuesses[0].user).to.equal(deployerAddress);
      expect(roundGuesses[0].guess).to.equal(guess);
    });
  });
});
