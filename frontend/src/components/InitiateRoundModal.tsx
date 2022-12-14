import React, { useState, useContext } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import Grid from '@mui/material/Grid'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';

import { TextField } from '@mui/material'

import { externalContractsAddressMap } from 'src/configs/externalContracts.config'
import { CaptureTheStream__factory } from 'generated/factories/CaptureTheStream__factory'
import { useNetwork, useSigner } from 'wagmi'
import { ethers } from 'ethers'
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
  oracle: string
  startTimestamp: string
  endTimestamp: string
  guessCutOffTimestamp: string
  numberOfGuessesAllowed: string
  minimumGuessSpacing: string
  guessCost: string
  inRoundGuessesAllowed: boolean
}

interface TransactionValues {
  oracle: string
  startTimestamp: number
  endTimestamp: number
  guessCutOffTimestamp: number
  numberOfGuessesAllowed: number
  minimumGuessSpacing: number
  guessCost: number
  inRoundGuessesAllowed: boolean
}

interface InvalidTransactionValues {
  oracle: boolean
  startTimestamp: boolean
  endTimestamp: boolean
  guessCutOffTimestamp: boolean
  numberOfGuessesAllowed: boolean
  minimumGuessSpacing: boolean
  guessCost: boolean
  inRoundGuessesAllowed: boolean
}

const invalidTransactionValues: InvalidTransactionValues = {
  oracle: false,
  startTimestamp: false,
  endTimestamp: false,
  guessCutOffTimestamp: false,
  numberOfGuessesAllowed: false,
  minimumGuessSpacing: false,
  guessCost: false,
  inRoundGuessesAllowed: false
}

const defaultValues: Form = {
  oracle: 'ETH',
  startTimestamp: dayjs().add(10, 'minutes').format('YYYY-MM-DD[T]HH:mm'),
  endTimestamp: dayjs().add(2, 'days').add(10, 'minutes').format('YYYY-MM-DD[T]HH:mm'),
  guessCutOffTimestamp: dayjs().add(10, 'minutes').format('YYYY-MM-DD[T]HH:mm'),
  numberOfGuessesAllowed: '0',
  minimumGuessSpacing: '0',
  guessCost: '10',
  inRoundGuessesAllowed: false
}

const InitiateRoundModal = () => {
  const [open, setOpen] = useState(false)
  const [formValues, setFormValues] = useState<Form>(defaultValues)
  const [invalidValues, setInvalidValues] = useState<InvalidTransactionValues>(invalidTransactionValues)
  const handleOpen = () => {
    setFormValues(defaultValues)
    setInvalidValues(invalidTransactionValues)
    setOpen(true)
  }
  const handleClose = () => setOpen(false)
  const { data: signer} = useSigner()
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

  const handleSubmit = () => {
    console.log('formValues: ', formValues)
    if (signer) {
      console.log('chain:', chain?.id)
      const txValues: TransactionValues = {
        oracle:
          externalContractsAddressMap[chain?.id ?? 31337][
            'AggregatorV3Interface' + formValues.oracle
          ],
        startTimestamp: dayjs(formValues.startTimestamp).unix(),
        endTimestamp: dayjs(formValues.endTimestamp).unix(),
        guessCutOffTimestamp: formValues.inRoundGuessesAllowed
          ? dayjs(formValues.endTimestamp).unix()
          : dayjs(formValues.guessCutOffTimestamp).unix(),
        numberOfGuessesAllowed: parseInt(formValues.numberOfGuessesAllowed),
        minimumGuessSpacing: parseFloat(formValues.minimumGuessSpacing) * 1e8,
        guessCost: parseInt(formValues.guessCost),
        inRoundGuessesAllowed: formValues.inRoundGuessesAllowed
      }
      const invalidTransactionValues = validateTxValues(txValues)
      setInvalidValues(validateTxValues(txValues))
      if (Object.values(invalidTransactionValues).every(v => v == false)) {
        console.log('Looks good, submit: ', txValues)
        const initiateRoundTx = initiateRound(txValues, signer, chain?.id ?? 31337)
      } else {
        console.log('Issues with data: ', txValues, invalidTransactionValues)
      }
    } else {
      console.log('No provider')
    }
  }

  const validateTxValues = (txValues: TransactionValues): InvalidTransactionValues => {
    const invalidTransactionValues: InvalidTransactionValues = {
      oracle: txValues.oracle.substring(0, 2) == '0x' ? false : true,
      startTimestamp:
        (txValues.startTimestamp > dayjs().unix() ? false : true) ||
        (txValues.startTimestamp < dayjs().add(1, 'weeks').unix() ? false : true),
      endTimestamp:
        (txValues.endTimestamp > txValues.startTimestamp + 60 ? false : true) ||
        (txValues.endTimestamp < dayjs().add(1, 'months').unix() ? false : true),
      guessCutOffTimestamp:
        (txValues.guessCutOffTimestamp > dayjs().unix() ? false : true) ||
        (txValues.guessCutOffTimestamp <= txValues.endTimestamp ? false : true) ||
        (txValues.guessCutOffTimestamp > txValues.startTimestamp && !txValues.inRoundGuessesAllowed ? true : false),
      numberOfGuessesAllowed: txValues.numberOfGuessesAllowed >= 0 ? false : true,
      minimumGuessSpacing: txValues.minimumGuessSpacing >= 0 ? false : true,
      guessCost: txValues.guessCost > 0 ? false : true,
      inRoundGuessesAllowed: false
    }
    
return invalidTransactionValues
  }

  return (
    <>
      <Button variant='contained' onClick={handleOpen}>
        INITIATE ROUND
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
            <Grid item xs={12} md={12} mt={4}>
            <FormControl sx={{  minWidth: 80 }}>
            <InputLabel id="oracle">Asset</InputLabel>
              <Select
                name='oracle'
                id='oracle'
                value={formValues?.oracle}
                label='Asset'
                error={invalidValues?.oracle}
                onChange={handleInputChange}
                sx={{ width: 250 }}

              >
                <MenuItem value={'ETH'}>ETH</MenuItem>
                <MenuItem value={'BTC'}>BTC</MenuItem>
                <MenuItem value={'MATIC'}>MATIC</MenuItem>
              </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField
                name='startTimestamp'
                id='startTimestamp'
                label='Start Time'
                type='datetime-local'
                defaultValue={defaultValues.startTimestamp}
                sx={{ width: 250 }}
                InputLabelProps={{
                  shrink: true
                }}
                error={invalidValues?.startTimestamp}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField
                name='endTimestamp'
                id='endTimestamp'
                label='End Time'
                type='datetime-local'
                defaultValue={defaultValues.endTimestamp}
                sx={{ width: 250 }}
                InputLabelProps={{
                  shrink: true
                }}
                error={invalidValues?.endTimestamp}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField
                label='Number Of Guesses Allowed'
                id='numberOfGuessesAllowed'
                name='numberOfGuessesAllowed'
                sx={{ width: 250 }}
                value={formValues?.numberOfGuessesAllowed}
                error={invalidValues?.numberOfGuessesAllowed}
                onChange={handleInputChange}
                onFocus={e => e.target.select()}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField
                label='Minimum Guess Spacing'
                id='minimumGuessSpacing'
                name='minimumGuessSpacing'
                sx={{ width: 250 }}
                value={formValues?.minimumGuessSpacing}
                error={invalidValues?.minimumGuessSpacing}
                onChange={handleInputChange}
                onFocus={e => e.target.select()}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <TextField
                label='Guess Cost'
                id='guessCost'
                name='guessCost'
                sx={{ width: 250 }}
                value={formValues?.guessCost}
                error={invalidValues?.guessCost}
                onChange={handleInputChange}
                onFocus={e => e.target.select()}
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <Switch
                id='inRoundGuessesAllowed'
                name='inRoundGuessesAllowed'
                onChange={handleInputChange}
                inputProps={{ 'aria-label': 'controlled' }}
                value={formValues?.inRoundGuessesAllowed}
                checked={formValues?.inRoundGuessesAllowed}
              />
              In-round Guesses Allowed
            </Grid>
            <Grid item xs={12} md={12} mb={4}>
              <TextField
                disabled={formValues?.inRoundGuessesAllowed}
                name='guessCutOffTimestamp'
                id='guessCutOffTimestamp'
                label='Guess Cut-off Time'
                type='datetime-local'
                defaultValue={defaultValues.guessCutOffTimestamp}
                sx={{ width: 250 }}
                InputLabelProps={{
                  shrink: true
                }}
                error={invalidValues?.guessCutOffTimestamp}
                onChange={handleInputChange}
              />
            </Grid>
          </Grid>

          <Button variant='contained' onClick={handleSubmit}>
            Initiate Round
          </Button>
        </Box>
      </Modal>
    </>
  )
}

function initiateRound(txValues: TransactionValues, signer: any, chain: number) {
  if (signer) {
    const address = externalContractsAddressMap[chain]['CaptureTheStream']
    const captureTheStream = CaptureTheStream__factory.connect(address, signer)
    
return captureTheStream.initiateRound(
      txValues.oracle,
      txValues.startTimestamp,
      txValues.endTimestamp,
      txValues.guessCutOffTimestamp,
      txValues.numberOfGuessesAllowed,
      txValues.minimumGuessSpacing,
      txValues.guessCost,
      txValues.inRoundGuessesAllowed
    )
  } else {
    return Promise.resolve(false)
  }
}

export default InitiateRoundModal
