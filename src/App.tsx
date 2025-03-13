import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { AuthProvider } from './phases/phase1-auth/contexts/AuthContext';
import AppRoutes from './routes';
import { ThemeProvider, createTheme } from '@mui/material';
import { CircularProgress } from '@mui/material';

const theme = createTheme({
  // Add any theme customization here
});

function App() {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <Router>
          <React.Suspense fallback={<CircularProgress />}>
            <AppRoutes />
          </React.Suspense>
        </Router>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;
