import { Inter, Poppins } from 'next/font/google';

export const inter = Inter({ subsets: ['latin'] });
export const poppins = Poppins({
  weight: ['400', '500', '600', '700'],
  subsets: ['latin'],
});

export const theme = {
  colors: {
    primary: '#0066FF',
    secondary: '#00C853',
    dark: '#1A1A1A',
    light: '#FFFFFF',
    gray: {
      100: '#F5F5F5',
      200: '#EEEEEE',
      300: '#E0E0E0',
      400: '#BDBDBD',
      500: '#9E9E9E',
    }
  },
  typography: {
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      lineHeight: 1.2,
    },
    h2: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.3,
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5,
    },
    button: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.5,
    }
  }
}; 