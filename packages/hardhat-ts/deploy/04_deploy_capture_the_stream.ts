import { config as envConfig } from 'dotenv';
import { DeployFunction } from 'hardhat-deploy/types';
import { THardhatRuntimeEnvironmentExtended } from 'helpers/types/THardhatRuntimeEnvironmentExtended';
import { CaptureTheStream__factory } from '../generated/contract-types';
import { getHardhatSigners } from 'tasks/functions/accounts';
envConfig({ path: '../../../.env' });

const ehre = require('hardhat');

const ethernal = require('hardhat-ethernal');

const func: DeployFunction = async (hre: THardhatRuntimeEnvironmentExtended) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  let vrfCoordinatorV2Address;
  let subId;
  let keyHash;
  if (['mumbai'].includes(process.env.HARDHAT_TARGET_NETWORK ?? '')) {
    vrfCoordinatorV2Address = '0x7a1bac17ccc5b313516c5e16fb24f7659aa5ebed';
    subId = 1536;
    keyHash = '0x4b09e658ed251bcafeebbc69400383d49f344ace09b9576fe248bb02c003fe9f'
  } else {
    subId = 1;
    vrfCoordinatorV2Address = (await deployments.get('MockVRFCoordinatorV2')).address;
    keyHash = '0x06eb0e2ea7cca202fc7c8258397a36f33d88568d2522b37aaa3b14ff6ee1b696'
  }
  const mockDaiDeployment = await deployments.get('MockDAI');

  const args = [subId, vrfCoordinatorV2Address, mockDaiDeployment.address, keyHash];
  console.log('Deploying with args:', args);
  const captureTheStream = await deploy('CaptureTheStream', {
    from: deployer,
    gasPrice: '25000000000',
    args: args,
    log: true,
  });

  const testAddresses: string[] = JSON.parse(process.env.TEST_ADDRESSES ?? '');
  if (testAddresses[0].substring(0, 1) != '0x') {
    const signer = (await getHardhatSigners(hre)).deployer;
    const captureTheStreamContract = CaptureTheStream__factory.connect(captureTheStream.address, signer);
    const currentOwner = await captureTheStreamContract.owner();
    if (signer.address != currentOwner) {
      console.log('Deployer is not the current owner, owner is: ' + currentOwner);
    } else {
      await captureTheStreamContract.transferOwnership(testAddresses[0]);
    }
  } else {
    console.log('New owner address not set in .env, contract is owned by deployer');
  }

  if (!(process.env.HARDHAT_TARGET_NETWORK == 'localhost')) {
    return;
  }

  await ehre.ethernal.push({
    name: 'CaptureTheStream',
    address: captureTheStream.address,
  });
};
export default func;
func.tags = ['CaptureTheStream'];
