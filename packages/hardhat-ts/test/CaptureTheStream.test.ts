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

describe('CaptureTheStream', function () {
    let captureTheStreamContract: CaptureTheStream;
    let mockChainlinkAggregatorContract: MockChainlinkAggregator;
    let mockDAIContract: MockDAI;

  before(async () => {
    const { deployer } = await getHardhatSigners(hre);
    const captureTheStreamFactory = new CaptureTheStream__factory(deployer);
    captureTheStreamContract = await captureTheStreamFactory.deploy();
    const mockChainlinkAggregatorFactory = new MockChainlinkAggregator__factory(deployer);
    mockChainlinkAggregatorContract = await mockChainlinkAggregatorFactory.deploy(18, 0);
    const mockDAIFactory = new MockDAI__factory(deployer);
    mockDAIContract = await mockDAIFactory.deploy();
  });

  beforeEach(async () => {
    // put stuff you need to run before each test here
  });

  it('Should be able to deposit', async function () {
    const { deployer } = await getHardhatSigners(hre);
    await captureTheStreamContract.deployed();
    await mockChainlinkAggregatorContract.deployed();
    await mockDAIContract.deployed();

    await mockDAIContract.mint(deployer.address, ethers.BigNumber.from(100 * 1e18));
    expect(await mockDAIContract.balanceOf(deployer.address)).to.equal(ethers.BigNumber.from(100 * 1e18));


    // expect(await yourContract.purpose()).to.equal('Building Unstoppable Apps!!!');

    // const newPurpose = 'Hola, mundo!';
    // await yourContract.setPurpose(newPurpose);
    // expect(await yourContract.purpose()).to.equal(newPurpose);
  });
});
