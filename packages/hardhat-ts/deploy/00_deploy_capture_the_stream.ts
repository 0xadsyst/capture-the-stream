import { config as envConfig } from 'dotenv';
import { DeployFunction } from 'hardhat-deploy/types';
import { THardhatRuntimeEnvironmentExtended } from 'helpers/types/THardhatRuntimeEnvironmentExtended';
import { CaptureTheStream__factory } from '../generated/contract-types';
import { getHardhatSigners } from 'tasks/functions/accounts';

envConfig({ path: '../../.env' });

const ehre = require('hardhat');

const func: DeployFunction = async (hre: THardhatRuntimeEnvironmentExtended) => {
  const { getNamedAccounts, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const captureTheStream = await deploy('CaptureTheStream', {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    // args: ["Hello"],
    log: true,
  });
  const newOwnerAddress = process.env.NEW_OWNER_ADDRESS ?? '';
  if (newOwnerAddress.substring(0, 1) != '0x') {
    const signer = (await getHardhatSigners(hre)).deployer;
    const captureTheStreamContract = CaptureTheStream__factory.connect(captureTheStream.address, signer);
    await captureTheStreamContract.transferOwnership(process.env.NEW_OWNER_ADDRESS ?? '');
  } else {
    console.log('New owner address not set in .env, contract is owned by deployer');
  }
};
export default func;
func.tags = ['CaptureTheStream'];
