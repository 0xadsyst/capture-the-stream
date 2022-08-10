import React, { useState, useContext } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'

import useProtocolBalance from 'src/hooks/useProtocolBalance'

import { externalContractsAddressMap } from 'src/configs/externalContracts.config'
import { CaptureTheStream__factory } from '../../generated/factories/CaptureTheStream__factory'
import { ProviderContext } from 'src/context/providerContext'
import { ethers } from 'ethers'
import { RoundCtx } from 'src/context/roundContext'

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4
}

const EnterRoundModal = () => {
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const [guess, setGuess] = useState<number>(0)
  const balance = useProtocolBalance()
  const providerContext = useContext(ProviderContext)
  const roundContext = useContext(RoundCtx)

  const handleUpdateWinnerClick = () => {
    const updateWinnerTx = updateWinner(roundContext?.roundId, providerContext.provider)
    setOpen(false)
  }

  return (
    <div>
      <Button variant='contained' onClick={handleOpen}>
        UPDATE WINNER
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={style}>
          <Typography id='modal-modal-title' variant='h6' component='h2'>
            Current Winner:
          </Typography>
          <Typography id='modal-modal-title' variant='h6' component='h2'>
            Round: {roundContext?.roundId}
          </Typography>

          <Button variant='contained' onClick={handleUpdateWinnerClick}>
            Update Winner
          </Button>
        </Box>
      </Modal>
    </div>
  )
}

function updateWinner(roundId: number | undefined, provider: ethers.providers.Web3Provider | undefined) {
  console.log('updating winner, provider:', provider)
  console.log('updating winner, roundId:', roundId)
  if (provider && roundId != undefined) {
    const address = externalContractsAddressMap[provider.network.chainId]['CaptureTheStream']
    const captureTheStream = CaptureTheStream__factory.connect(address, provider.getSigner())
    return captureTheStream.updateWinner(roundId)
  } else {
    return Promise.resolve(false)
  }
}

export default EnterRoundModal
