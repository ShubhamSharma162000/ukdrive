import { makeTheme } from 'dripsy';

export const theme = makeTheme({
  colors: {
    passengerTheme: '#f66a0cff',
    driverTheme: '#666adfff',

    passenger: '#f66a0cff',
    driver: '#801da7ff',
    success: '#2ecc71',
    warning: '#f1c40f',
    error: '#e74c3c',

    background: '#ffffff',
    surface: '#f8f9fa',
    text: '#333333',
    muted: '#777777',
    border: '#e0e0e0',
  },

  text: {
    heading: {
      fontSize: 24,
      fontWeight: 'bold',
      color: 'text',
      fontFamily: 'Inter-Bold',
    },
    subheading: {
      fontSize: 20,
      fontWeight: '600',
      color: 'text',
      fontFamily: 'Inter-Bold',
    },
    body: {
      fontSize: 16,
      color: 'text',
      fontFamily: 'Inter-Bold',
    },
    small: {
      fontSize: 14,
      color: 'muted',
    },
    caption: {
      fontSize: 12,
      color: 'muted',
    },
    button: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center',
    },
  },

  space: {
    xs: 4,
    s: 8,
    m: 16,
    l: 24,
    xl: 32,
    xxl: 48,
  },

  radii: {
    s: 4,
    m: 8,
    l: 16,
    xl: 24,
    round: 9999,
  },

  shadows: {
    light: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.1,
      shadowRadius: 2,
      elevation: 2,
    },
    medium: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 3 },
      shadowOpacity: 0.15,
      shadowRadius: 4,
      elevation: 4,
    },
    heavy: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 5 },
      shadowOpacity: 0.2,
      shadowRadius: 8,
      elevation: 8,
    },
  },

  buttons: {
    primary: {
      backgroundColor: 'primary',
      borderRadius: 'm',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    secondary: {
      backgroundColor: 'secondary',
      borderRadius: 'm',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1,
      borderColor: 'primary',
      borderRadius: 'm',
      paddingVertical: 12,
      paddingHorizontal: 16,
    },
  },

  inputs: {
    default: {
      borderWidth: 1,
      borderColor: 'border',
      borderRadius: 'm',
      padding: 12,
      color: 'text',
      fontSize: 16,
      backgroundColor: 'surface',
    },
    focused: {
      borderColor: 'primary',
    },
    error: {
      borderColor: 'error',
    },
  },
});

export default theme;
