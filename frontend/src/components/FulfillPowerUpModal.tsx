import React, { useState, useContext } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import Grid from '@mui/material/Grid'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'

import { TextField } from '@mui/material'

import { externalContractsAddressMap } from 'src/configs/externalContracts.config'
import { MockVRFCoordinatorV2__factory } from 'generated/factories/MockVRFCoordinatorV2__factory'
import { useNetwork, useSigner } from 'wagmi'
import { ethers, BigNumber } from 'ethers'
import { RoundContext } from 'src/context/roundContext'
import dayjs from 'dayjs'

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

interface Form {
  requestId: string
  typeOf: string
  length: string
  target: string
}

interface TransactionValues {
  requestId: number
  typeOf: number
  length: number
  target: number
}

const defaultValues: Form = {
  requestId: '0',
  typeOf: '0',
  length: '0',
  target: '0'
}

const FulfillPowerUpModal = () => {
  const [open, setOpen] = useState(false)
  const [formValues, setFormValues] = useState<Form>(defaultValues)
  const handleOpen = () => {
    setFormValues(defaultValues)
    setOpen(true)
  }
  const handleClose = () => setOpen(false)
  const { data: signer } = useSigner()
  const { chain } = useNetwork()
  const roundContext = useContext(RoundContext)

  const handleInputChange = (e: any) => {
    const { name, value, checked, type } = e.target
    console.log(name, value, checked, type)
    const valueToUse = type == 'checkbox' ? checked.valueOf() : value
    setFormValues({
      ...formValues,
      [name]: valueToUse
    })
  }

  const handleOverride = () => {
    console.log('formValues: ', formValues)
    if (signer) {
      console.log('chain:', chain?.id)
      const fulfillRandomWordsWithOverrideTx = fulfillRandomWordsWithOverride(formValues, signer, chain?.id ?? 31337)
      console.log(fulfillRandomWordsWithOverrideTx.then((x) => {return x.valueOf}))
    } else {
      console.log('No provider')
    }
  }

  const handleRandom = () => {
    console.log('formValues: ', formValues)
    if (signer) {
      console.log('chain:', chain?.id)
      const fulfillRandomWordsTx = fulfillRandomWords(formValues, signer, chain?.id ?? 31337)
      console.log(fulfillRandomWordsTx.then((x) => {return x.valueOf}))
    } else {
      console.log('No provider')
    }
  }

  return (
    <>
      <Button variant='contained' onClick={handleOpen}>
        FULFILL POWER UP
      </Button>

      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby='modal-modal-title'
        aria-describedby='modal-modal-description'
      >
        <Box sx={style}>
          <Typography id='modal-modal-title' variant='h6' component='h2'>
            New Round
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={12}>
              <TextField
                label='Request ID'
                id='requestId'
                name='requestId'
                sx={{ width: 250 }}
                value={formValues?.requestId}
                onChange={handleInputChange}
                onFocus={e => e.target.select()}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField
                label='Type'
                id='typeOf'
                name='typeOf'
                sx={{ width: 250 }}
                value={formValues?.typeOf}
                onChange={handleInputChange}
                onFocus={e => e.target.select()}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField
                label='Length'
                id='length'
                name='length'
                sx={{ width: 250 }}
                value={formValues?.length}
                onChange={handleInputChange}
                onFocus={e => e.target.select()}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField
                label='Target'
                id='target'
                name='target'
                sx={{ width: 250 }}
                value={formValues?.target}
                onChange={handleInputChange}
                onFocus={e => e.target.select()}
              />
            </Grid>
          </Grid>

          <Button variant='contained' onClick={handleRandom}>
            Fulfill Random
          </Button>
          <Button variant='contained' onClick={handleOverride}>
          Fulfill Override
          </Button>
        </Box>
      </Modal>
    </>
  )
}

function fulfillRandomWordsWithOverride(formValues: Form, signer: any, chain: number) {
  if (signer) {
    const vrfAddress = externalContractsAddressMap[chain]['MockVRFCoordinatorV2']
    const ctsAddress = externalContractsAddressMap[chain]['CaptureTheStream']
    const mockVRFCoordinatorV2 = MockVRFCoordinatorV2__factory.connect(vrfAddress, signer)

    return mockVRFCoordinatorV2.fulfillRandomWordsWithOverride(formValues.requestId, ctsAddress, [
      BigNumber.from(formValues.typeOf),
      BigNumber.from(formValues.length),
        BigNumber.from(formValues.target)
    ])
  } else {
    return Promise.resolve(false)
  }
}

function fulfillRandomWords(formValues: Form, signer: any, chain: number) {
  if (signer) {
    const vrfAddress = externalContractsAddressMap[chain]['MockVRFCoordinatorV2']
    const ctsAddress = externalContractsAddressMap[chain]['CaptureTheStream']
    const mockVRFCoordinatorV2 = MockVRFCoordinatorV2__factory.connect(vrfAddress, signer)

    return mockVRFCoordinatorV2.fulfillRandomWords(formValues.requestId, ctsAddress)
  } else {
    return Promise.resolve(false)
  }
}

export default FulfillPowerUpModal
