// ** Type Imports
import { PaletteMode } from '@mui/material'

const DefaultPalette = (mode: PaletteMode) => {
  // ** Vars
  const lightColor = "#2E3538"
  const darkColor = "#DDE0E3"
  const mainColor = mode === 'light' ? lightColor : darkColor

  return {
    customColors: {
      main: mainColor,
      primaryGradient: '#BCC2C8',
      tableHeaderBg: mode === 'light' ? '#F9FAFC' : '#3E505B'
    },
    common: {
      black: '#000',
      white: '#FFF'
    },
    mode: mode,
    primary: {
      light: '#D3E5EE',
      main: '#37718E',
      dark: '#285267',
      contrastText: '#FFF'
    },
    text: {
      primary: mainColor + 'F0',
      secondary: mainColor + 'C0',
      disabled: mainColor + '70',
    },
    divider: `rgba(${mainColor}, 0.12)`,
    background: {
      paper: mode === 'light' ? '#F4F5F6' : '#404B4F',
      default: mode === 'light' ? '#DDE0E3' : '#2E3538'
    },
    action: {
      active: mainColor + 'A0',
      hover: mainColor + '10',
      selected: mainColor + '20',
      disabled: mainColor + '80',
      disabledBackground: mainColor + '30',
      focus: mainColor + '30',
    }
  }
}

export default DefaultPalette
