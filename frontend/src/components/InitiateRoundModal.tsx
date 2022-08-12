import React, { useState, useContext } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'
import Grid from '@mui/material/Grid'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Switch from '@mui/material/Switch'
import FormHelperText from '@mui/material/FormHelperText'

import { InputAdornment, TextField } from '@mui/material'

import { externalContractsAddressMap } from 'src/configs/externalContracts.config'
import { CaptureTheStream__factory } from '../../generated/factories/CaptureTheStream__factory'
import { ProviderContext } from 'src/context/providerContext'
import { ethers } from 'ethers'
import { RoundCtx } from 'src/context/roundContext'
import moment from 'moment'

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

const defaultValues: Form = {
  oracle: 'ETH',
  startTimestamp: moment().add(10, 'minutes').format('yyyy-MM-DD[T]HH:mm'),
  endTimestamp: moment().add(2, 'days').format('yyyy-MM-DD[T]HH:mm'),
  guessCutOffTimestamp: moment().add(10, 'minutes').format('yyyy-MM-DD[T]HH:mm'),
  numberOfGuessesAllowed: '0',
  minimumGuessSpacing: '0',
  guessCost: '10',
  inRoundGuessesAllowed: false
}

const InitiateRoundModal = () => {
  const [open, setOpen] = useState(false)
  const [formValues, setFormValues] = useState<Form>(defaultValues)
  const [invalidValues, setInvalidValues] = useState<InvalidTransactionValues>()
  const handleOpen = () => setOpen(true)
  const handleClose = () => setOpen(false)
  const providerContext = useContext(ProviderContext)
  const roundContext = useContext(RoundCtx)

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
    if (providerContext.provider) {
      console.log('chain:', providerContext.provider.network.chainId)
      const txValues: TransactionValues = {
        oracle:
          externalContractsAddressMap[providerContext.provider.network.chainId][
            'AggregatorV3Interface' + formValues.oracle
          ],
        startTimestamp: moment(formValues.startTimestamp).unix(),
        endTimestamp: moment(formValues.endTimestamp).unix(),
        guessCutOffTimestamp: formValues.inRoundGuessesAllowed
          ? moment(formValues.endTimestamp).unix()
          : moment(formValues.guessCutOffTimestamp).unix(),
        numberOfGuessesAllowed: parseInt(formValues.numberOfGuessesAllowed),
        minimumGuessSpacing: parseInt(formValues.minimumGuessSpacing),
        guessCost: parseInt(formValues.guessCost),
        inRoundGuessesAllowed: formValues.inRoundGuessesAllowed
      }
      const invalidTransactionValues = validateTxValues(txValues)
      setInvalidValues(validateTxValues(txValues))
      if (Object.values(invalidTransactionValues).every(v => v == false)) {
        console.log('Looks good, submit: ', txValues)
        const initiateRoundTx = initiateRound(txValues, providerContext.provider)
      } else {
        console.log('oracle', txValues.oracle.substring(0, 2))
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
        (txValues.startTimestamp > moment().unix() ? false : true) ||
        (txValues.startTimestamp < moment().add(1, 'weeks').unix() ? false : true),
      endTimestamp:
        (txValues.endTimestamp > txValues.startTimestamp + 600 ? false : true) ||
        (txValues.endTimestamp < moment().add(1, 'months').unix() ? false : true),
      guessCutOffTimestamp:
        (txValues.guessCutOffTimestamp > moment().unix() ? false : true) ||
        (txValues.guessCutOffTimestamp <= txValues.endTimestamp ? false : true) ||
        (txValues.guessCutOffTimestamp >= txValues.startTimestamp && !txValues.inRoundGuessesAllowed ? true : false),
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
              <FormHelperText>Asset</FormHelperText>
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
              />
            </Grid>
            <Grid item xs={12} md={12}>
              <Switch
                id='inRoundGuessesAllowed'
                name='inRoundGuessesAllowed'
                onChange={handleInputChange}
                inputProps={{ 'aria-label': 'controlled' }}
                value={formValues?.inRoundGuessesAllowed}
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

function initiateRound(txValues: TransactionValues, provider: ethers.providers.Web3Provider | undefined) {
  console.log('provider: ', provider)

  if (provider) {
    const address = externalContractsAddressMap[provider.network.chainId]['CaptureTheStream']
    const captureTheStream = CaptureTheStream__factory.connect(address, provider.getSigner())
    
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
