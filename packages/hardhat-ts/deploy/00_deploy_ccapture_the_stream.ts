import { ethers } from 'ethers';
import { DeployFunction } from 'hardhat-deploy/types';
import { THardhatRuntimeEnvironmentExtended } from 'helpers/types/THardhatRuntimeEnvironmentExtended';
import { CaptureTheStream__factory } from '../generated/contract-types'
import { getHardhatSigners } from 'tasks/functions/accounts';
import { config as envConfig } from 'dotenv';
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

  const signer = (await getHardhatSigners(hre)).deployer;
  const captureTheStreamContract = CaptureTheStream__factory.connect(captureTheStream.address, signer)
  const transferOwnershipTx = await captureTheStreamContract.transferOwnership(process.env.NEW_OWNER_ADDRESS ?? '')
 
  /*
    // Getting a previously deployed contract
    const YourContract = await ethers.getContract("YourContract", deployer);
    await YourContract.setPurpose("Hello");
    
    //const yourContract = await ethers.getContractAt('YourContract', "0xaAC799eC2d00C013f1F11c37E654e59B0429DF6A") //<-- if you want to instantiate a version of a contract at a specific address!
  */
};
export default func;
func.tags = ['CaptureTheStream'];

/*
Tenderly verification
let verification = await tenderly.verify({
  name: contractName,
  address: contractAddress,
  network: targetNetwork,
});
*/
