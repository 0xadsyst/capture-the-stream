import React, { useState, useContext } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'

import useProtocolBalance from 'src/hooks/useProtocolBalance'
import { InputAdornment, TextField } from '@mui/material'

import { externalContractsAddressMap } from 'src/configs/externalContracts.config'
import { CaptureTheStream__factory } from '../../generated/factories/CaptureTheStream__factory'
import { ethers } from 'ethers'
import { ProviderContext } from 'src/context/providerContext'

const style = {
  position: 'absolute' as const,
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
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
  const balance = useProtocolBalance()
  const providerContext = useContext(ProviderContext)

  const handleDepositClick = () => {
    const depositTx = deposit(amount, providerContext.provider)
    setOpen(false)
  }
  const handleWithdrawClick = () => {
    withdraw(amount, providerContext.provider)
    setOpen(true)
  }

  return (
    <div>
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
          <Typography id='modal-modal-title' variant='h6' component='h2'>
            Current Balance: {balance}
          </Typography>
          <TextField
            label='Amount'
            id='amount'
            sx={{ m: 1, width: '25ch' }}
            InputProps={{
              endAdornment: <InputAdornment position='end'>DAI</InputAdornment>
            }}
            value={amount}
            onChange={e => {
              setAmount(parseInt(e.currentTarget.value))
            }}
          />

          <Button variant='contained' onClick={handleDepositClick}>
            Deposit
          </Button>
          <Button variant='contained' onClick={handleWithdrawClick}>
            Withdraw
          </Button>
        </Box>
      </Modal>
    </div>
  )
}

function deposit(amount: number, provider: ethers.providers.Web3Provider | undefined) {
  console.log('depositing: ', amount)
  console.log('provider:', provider)
  if (provider) {
    const address = externalContractsAddressMap[provider.network.chainId]['CaptureTheStream']
    const captureTheStream = CaptureTheStream__factory.connect(address, provider.getSigner())
    console.log("captureTheStream contract:", captureTheStream)
    const a = ethers.utils.parseUnits(amount.toString(), 18)
    
return captureTheStream.deposit(a)
  } else {
    return Promise.resolve(false)
  }
}

function withdraw(amount: number, provider: ethers.providers.Web3Provider | undefined) {
  console.log('withdrawing: ', amount)
  if (provider) {
    const address = externalContractsAddressMap[provider._network.chainId]['CaptureTheStream']
    const captureTheStream = CaptureTheStream__factory.connect(address, provider.getSigner())
    const a = ethers.utils.parseUnits(amount.toString(), 18)
    
return captureTheStream.withdraw(a)
  } else {
    return Promise.resolve(false)
  }
}
export default DepositModal
