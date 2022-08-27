import { config as envConfig } from 'dotenv';
import { DeployFunction } from 'hardhat-deploy/types';
import { THardhatRuntimeEnvironmentExtended } from 'helpers/types/THardhatRuntimeEnvironmentExtended';

envConfig({ path: '../../.env' });

const ehre = require('hardhat');

const ethernal = require('hardhat-ethernal');

const func: DeployFunction = async (hre: THardhatRuntimeEnvironmentExtended) => {
  if (!(process.env.HARDHAT_TARGET_NETWORK == 'localhost')) {
    return;
  }

  const { getNamedAccounts, deployments } = hre;
  const { deploy } = deployments;
  const { deployer } = await getNamedAccounts();
  const mockVRFCoordinatorV2 = await deploy('MockVRFCoordinatorV2', {
    // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
    from: deployer,
    gasPrice: '50000000000',
    args: [0, 0],
    log: true,
  });

  await ehre.ethernal.push({
    name: 'MockVRFCoordinatorV2',
    address: mockVRFCoordinatorV2.address,
  });
};
export default func;
func.tags = ['MockVRFCoordinatorV2'];