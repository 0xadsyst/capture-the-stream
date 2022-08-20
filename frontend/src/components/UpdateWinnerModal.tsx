import React, { useState, useContext } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'

import { externalContractsAddressMap } from 'src/configs/externalContracts.config'
import { CaptureTheStream__factory } from 'generated/factories/CaptureTheStream__factory'
import { useNetwork, useSigner } from 'wagmi'
import { ethers } from 'ethers'
import { RoundContext } from 'src/context/roundContext'

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

const UpdateWinnerModal = () => {
  const [open, setOpen] = useState(false)
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const [guess, setGuess] = useState<number>(0)
  const { data: signer} = useSigner()
  const { chain } = useNetwork()
  const roundContext = useContext(RoundContext)

  const handleUpdateWinnerClick = () => {
    if (roundContext?.roundId){
      const updateWinnerTx = updateWinner(roundContext?.roundId, signer, chain?.id ?? 31337)
      setOpen(false)
    }
  }

  return (
    <>
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
    </>
  )
}

function updateWinner(roundId: number | undefined, signer: any, chain: number) {
  console.log('updating winner, provider:', signer)
  console.log('updating winner, roundId:', roundId)
  if (signer && roundId != undefined) {
    const address = externalContractsAddressMap[chain]['CaptureTheStream']
    const captureTheStream = CaptureTheStream__factory.connect(address, signer)
    
return captureTheStream.updateWinner(roundId)
  } else {
    return Promise.resolve(false)
  }
}

export default UpdateWinnerModal
