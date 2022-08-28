import { TExternalContractsAddressMap } from 'eth-hooks/models'

export const externalContractsAddressMap: TExternalContractsAddressMap = {
  [31337]: {
    AggregatorV3InterfaceETH: '0x5FbDB2315678afecb367f032d93F642f64180aa3',
    AggregatorV3InterfaceBTC: '0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512',
    AggregatorV3InterfaceMATIC: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    CaptureTheStream: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707',
    MockDAI: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    MockVRFCoordinatorV2: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9'
  },
  [80001]: {
    AggregatorV3InterfaceETH: '0x0715A7794a1dc8e42615F059dD6e406A6594651A',
    AggregatorV3InterfaceBTC: '0x007A22900a3B98143368Bd5906f8E17e9867581b',
    AggregatorV3InterfaceMATIC: '0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada',
    CaptureTheStream: '0xB8B68ADe9E4D0825e8D952d89073324B1452b2ef',
    MockDAI: '0xaafa2ad13e083e95d9fd09c7fe31f08a8746d0ae',
    MockVRFCoordinatorV2: '0x0165878A594ca255338adfa4d48449f69242Eb8F'
  },
  [0]: {
    AggregatorV3InterfaceETH: '',
    AggregatorV3InterfaceBTC: '',
    AggregatorV3InterfaceMATIC: '',
    CaptureTheStream: '',
    MockDAI: '',
    MockVRFCoordinatorV2: ''
  }
}
