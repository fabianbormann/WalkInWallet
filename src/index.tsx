import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import { createTheme, ThemeProvider } from '@mui/material';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

const theme = createTheme({
  palette: {
    primary: {
      light: '#27448d',
      main: '#12284b',
    },
    secondary: {
      light: '#FD7CCD',
      main: '#ef2f6d',
    },
    success: {
      light: '#82D97D',
      main: '#00B092',
    },
    info: {
      main: '#00C2D5',
    },
    warning: {
      main: '#D6A419',
    },
  },
  typography: {
    fontFamily: ['Roboto', 'sans-serif'].join(','),
  },
});

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

root.render(
  <ThemeProvider theme={theme}>
    <App />
  </ThemeProvider>
);
