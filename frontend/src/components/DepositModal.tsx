import React, { useState, useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'

import { InputAdornment, TextField } from '@mui/material'

import { externalContractsAddressMap } from '../configs/externalContracts.config'
import { CaptureTheStream__factory } from '../../generated/factories/CaptureTheStream__factory'
import { MockDAI__factory } from '../../generated/factories/MockDAI__factory'
import { ethers, BigNumber } from 'ethers'
import { useNetwork, useSigner, useAccount, useContractRead } from 'wagmi'
import useProtocolBalance from '../hooks/useProtocolBalance'
import useDepositAssetBalance from '../hooks/useDepositAssetBalance'

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 300,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
}

const DepositModal = () => {
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const [amount, setAmount] = useState<number>(0)
  const { data: signer } = useSigner()
  const [myAddress, setMyAddress] = useState('')
  const [myChain, setMyChain] = useState<number>()
  const { address } = useAccount()
  const { chain } = useNetwork()

  useEffect(() => {
    address ? setMyAddress(address) : ''
    chain ? setMyChain(chain.id) : ''
  }, [address, chain])

  const handleDepositClick = () => {
    const depositTx = deposit(amount, signer, myChain ?? 31337)
  }

  const handleWithdrawClick = () => {
    withdraw(amount, signer, myChain ?? 31337)
  }

  const protocolBalance = useProtocolBalance()
  const depositAssetBalance = useDepositAssetBalance()

  return (
    <>
      <Button variant='contained' onClick={handleOpen}>
        DEPOSIT/WITHDRAW
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={style}>
          <Typography variant='h6' component='h2'>
            Protocol Balance:{' '}
            <Button
              onClick={() => setAmount(parseFloat(ethers.utils.formatUnits(protocolBalance ?? BigNumber.from(0), 18)))}
            >
              {parseFloat(ethers.utils.formatUnits(protocolBalance ?? BigNumber.from(0), 18))
                .toFixed(2)
                .toString()}
            </Button>
          </Typography>
          <Typography variant='h6' component='h2'>
            Wallet Balance:{' '}
            <Button
              onClick={() =>
                setAmount(parseFloat(ethers.utils.formatUnits(depositAssetBalance ?? BigNumber.from(0), 18)))
              }
            >
              {parseFloat(ethers.utils.formatUnits(depositAssetBalance ?? BigNumber.from(0), 18))
                .toFixed(2)
                .toString()}
            </Button>
          </Typography>
          <TextField
            label='Amount'
            id='amount'
            sx={{ m: 1, width: '25ch', mt: 4, mb: 4 }}
            InputProps={{
              endAdornment: <InputAdornment position='end'>DAI</InputAdornment>
            }}
            value={amount}
            onChange={e => {
              setAmount(parseFloat(e.currentTarget.value))
            }}
            type='number'
            onFocus={e => e.target.select()}
          />

          <Button variant='contained' onClick={handleDepositClick}>
            Deposit
          </Button>
          {'   '}
          <Button variant='contained' onClick={handleWithdrawClick}>
            Withdraw
          </Button>
        </Box>
      </Modal>
    </>
  )
}

async function deposit(amount: number, signer: any, chain: number) {
  console.log('depositing: ', amount)
  console.log('provider:', signer)
  if (signer) {
    const address = externalContractsAddressMap[chain]['CaptureTheStream']
    const captureTheStream = CaptureTheStream__factory.connect(address, signer)
    console.log('captureTheStream contract:', captureTheStream)
    const a = ethers.utils.parseUnits(amount.toString(), 18)

    return await captureTheStream.deposit(a)
  } else {
    return Promise.resolve(false)
  }
}

async function withdraw(amount: number, signer: any, chain: number) {
  console.log('withdrawing: ', amount)
  if (signer) {
    const address = externalContractsAddressMap[chain]['CaptureTheStream']
    const captureTheStream = CaptureTheStream__factory.connect(address, signer)
    const a = ethers.utils.parseUnits(amount.toString(), 18)

    return await captureTheStream.withdraw(a)
  } else {
    return Promise.resolve(false)
  }
}
export default DepositModal
