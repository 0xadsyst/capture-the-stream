import { DeployFunction } from 'hardhat-deploy/types';
import { THardhatRuntimeEnvironmentExtended } from 'helpers/types/THardhatRuntimeEnvironmentExtended';
import { config as envConfig } from 'dotenv';
envConfig({ path: '../../../.env' });

const ehre = require('hardhat');

const ethernal = require('hardhat-ethernal');

const func: DeployFunction = async (hre: THardhatRuntimeEnvironmentExtended) => {
  if (['localhost', 'mumbai'].includes(process.env.HARDHAT_TARGET_NETWORK ?? '')) {
    const { getNamedAccounts, deployments } = hre;
    const { deploy } = deployments;
    const { deployer } = await getNamedAccounts();

    const mockDai = await deploy('MockDAI', {
      // Learn more about args here: https://www.npmjs.com/package/hardhat-deploy#deploymentsdeploy
      from: deployer,
      gasPrice: '50000000000',
      // args: ["Hello"],
      log: true,
    });


    if (!(process.env.HARDHAT_TARGET_NETWORK == 'localhost')) {
      return;
    }
  
    await ehre.ethernal.push({
      name: 'MockDAI',
      address: mockDai.address,
    });
  }
};
export default func;
func.tags = ['MockDAI'];

/*
Tenderly verification
let verification = await tenderly.verify({
  name: contractName,
  address: contractAddress,
  network: targetNetwork,
});
*/
