import { NetworkID } from '@dethcrypto/eth-sdk/dist/abi-management/networks'
import { TExternalContractsAddressMap } from 'eth-hooks/models'

export const externalContractsAddressMap: TExternalContractsAddressMap = {
  [31337]: {
    AggregatorV3InterfaceETH: '0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9',
    AggregatorV3InterfaceBTC: '0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9',
    AggregatorV3InterfaceMATIC: '0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9',
    CaptureTheStream: '0x9E545E3C0baAB3E08CdfD552C960A1050f373042',
    MockDAI: '0x1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8'
  },
  [80001]: {
    AggregatorV3InterfaceETH: '0x0715A7794a1dc8e42615F059dD6e406A6594651A',
    AggregatorV3InterfaceBTC: '	0x007A22900a3B98143368Bd5906f8E17e9867581b',
    AggregatorV3InterfaceMATIC: '	0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada',
    CaptureTheStream: '0xf47E5F4Ee4bE7D88309E2a0dDc99f2ccf0C3eDB0',
    MockDAI: '0xE81Fca457ba225C7D0921207f0b24444b9303944'
  }
}
