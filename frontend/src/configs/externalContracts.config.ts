import { TExternalContractsAddressMap } from 'eth-hooks/models'

export const externalContractsAddressMap: TExternalContractsAddressMap = {
  [31337]: {
    AggregatorV3InterfaceETH: '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0',
    AggregatorV3InterfaceBTC: '0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9',
    AggregatorV3InterfaceMATIC: '0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9',
    CaptureTheStream: '0xB7f8BC63BbcaD18155201308C8f3540b07f84F5e',
    MockDAI: '0x5FC8d32690cc91D4c39d9d3abcBD16989F875707'
  },
  [80001]: {
    AggregatorV3InterfaceETH: '0x0715A7794a1dc8e42615F059dD6e406A6594651A',
    AggregatorV3InterfaceBTC: '	0x007A22900a3B98143368Bd5906f8E17e9867581b',
    AggregatorV3InterfaceMATIC: '	0xd0D5e3DB44DE05E9F294BB0a3bEEaF030DE24Ada',
    CaptureTheStream: '0xf47E5F4Ee4bE7D88309E2a0dDc99f2ccf0C3eDB0',
    MockDAI: '0xE81Fca457ba225C7D0921207f0b24444b9303944'
  },
  [0]: {
    AggregatorV3InterfaceETH: '',
    AggregatorV3InterfaceBTC: '',
    AggregatorV3InterfaceMATIC: '',
    CaptureTheStream: '',
    MockDAI: ''
  }
}
