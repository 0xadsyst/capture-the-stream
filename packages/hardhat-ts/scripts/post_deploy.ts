import { config as envConfig } from 'dotenv';
import { CaptureTheStream__factory, MockDAI__factory, MockVRFCoordinatorV2__factory } from '../generated/contract-types';
import { getHardhatSigners } from '../tasks/functions/accounts';

envConfig({ path: '../../.env' });
import { ethers } from 'ethers';
import { test } from 'mocha';

const ehre = require('hardhat');
const { getNamedAccounts, deployments } = ehre;

const postDeploy = async () => {

  const mockChainlinkAggregatorETHDeployment = await deployments.get('MockChainlinkAggregatorETH');
  console.log("mockChainlinkAggregatorETHDeployment:", mockChainlinkAggregatorETHDeployment.address)
  const captureTheStreamDeployment = await deployments.get('CaptureTheStream');
  console.log("captureTheStreamDeployment:", captureTheStreamDeployment.address)
  const mockDaiDeployment = await deployments.get('MockDAI');
  console.log("mockDaiDeployment:", mockDaiDeployment.address)
  const mockVRFCoordinatorV2Deployment = await deployments.get('MockVRFCoordinatorV2');
  console.log("mockVRFCoordinatorV2Deployment:", mockVRFCoordinatorV2Deployment.address)

  const testAddresses: string[] = JSON.parse(process.env.TEST_ADDRESSES ?? '')
  console.log("Test addresses: ", testAddresses)
  let signer: ethers.Signer = (await getHardhatSigners(ehre)).deployer;

  //Send ETH to test addresses
  testAddresses.map(async (address) => {
    signer.sendTransaction({
      to: address,
      value: ethers.utils.parseEther("1")
    });
  
    await ehre.network.provider.request({
      method: 'hardhat_impersonateAccount',
      params: [address],
    });
  })

  //Test address 0 is the owner of the contract, perform setup tasks
  signer = await ehre.ethers.getSigner(testAddresses[0]);
  const captureTheStreamContract = CaptureTheStream__factory.connect(captureTheStreamDeployment.address, signer);
  console.log("Setting deposit asset to ", mockDaiDeployment.address)
  await captureTheStreamContract.setDepositAsset(mockDaiDeployment.address);

  //Initiate a round
  await captureTheStreamContract.initiateRound(
    mockChainlinkAggregatorETHDeployment.address,
    parseInt((Date.now() / 1000).toString()) + 60,
    parseInt((Date.now() / 1000).toString()) + 100000,
    parseInt((Date.now() / 1000).toString()) + 100000,
    0,
    0,
    10,
    true
  );
  const roundCount = await captureTheStreamContract.roundCount()
  console.log("Initialized round: ", roundCount.sub(1).toString())

  const mockVRFCoordinatorV2Contract = MockVRFCoordinatorV2__factory.connect(mockVRFCoordinatorV2Deployment.address, signer);
  try {
    await mockVRFCoordinatorV2Contract.addConsumer(1, captureTheStreamDeployment.address)
  } catch (error) {
    console.log("Subscription not created, creating now")
    await mockVRFCoordinatorV2Contract.createSubscription()
    await mockVRFCoordinatorV2Contract.addConsumer(1, captureTheStreamDeployment.address)
  }

    for (let index = 0; index < testAddresses.length; index ++) {
    const address = testAddresses[index]
    const s = await ehre.ethers.getSigner(address);
    console.log("connected to signer: ", address)
    const mockDaiContract = MockDAI__factory.connect(mockDaiDeployment.address, s);
    await mockDaiContract.mint(address, ethers.BigNumber.from('1000000000000000000000'));
    const captureTheStreamContract = CaptureTheStream__factory.connect(captureTheStreamDeployment.address, s);
    await captureTheStreamContract.deposit(ethers.BigNumber.from('100000000000000000000'));
    const balance = await captureTheStreamContract.deposits(address);
    console.log("Protocol balance for address ", address, " is ", ethers.utils.formatUnits(balance, 18))
    const guess = ethers.BigNumber.from((1500 + (index * 100)) * 1e8)
    await captureTheStreamContract.enterRound(roundCount.sub(1), guess)
    console.log("Address ", address, " entered round ", roundCount.sub(1).toString(), " with guess of ", ethers.utils.formatUnits(guess, 8))
  }


};

// eslint-disable-next-line @typescript-eslint/require-await
export async function main(): Promise<void> {
  postDeploy().catch((e) => console.log(e));
}

main().catch(console.error);
