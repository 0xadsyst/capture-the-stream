// ** React Imports
import { ReactNode } from 'react'

// ** Next Import
import Link from 'next/link'

// ** MUI Components
import Button from '@mui/material/Button'
import { styled } from '@mui/material/styles'
import Typography from '@mui/material/Typography'
import Box, { BoxProps } from '@mui/material/Box'

// ** Layout Import
import BlankLayout from 'src/layouts/BlankLayout'

// ** Styled Components
const BoxWrapper = styled(Box)<BoxProps>(({ theme }) => ({
  [theme.breakpoints.down('md')]: {
    width: '90vw',
  },
}))

const UnderConstruction = () => {
  return (
    <Box className="content-center">
      <Box
        sx={{
          p: 5,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        <BoxWrapper>
          <Typography variant="h1">Under Construction</Typography>
          <Typography
            variant="h5"
            sx={{ mb: 1, fontSize: '1.5rem !important' }}
          >
            Check back soon.
          </Typography>
        </BoxWrapper>
        <Link passHref href="/">
          <Button component="a" variant="contained" sx={{ px: 5.5 }}>
            Back to Home
          </Button>
        </Link>
      </Box>
    </Box>
  )
}

UnderConstruction.getLayout = (page: ReactNode) => (
  <BlankLayout>{page}</BlankLayout>
)

export default UnderConstruction
