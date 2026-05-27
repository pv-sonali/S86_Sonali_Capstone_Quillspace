import { useEffect } from 'react';
import AppRoutes from './routes/AppRoutes';

function App() {
  useEffect(() => {
    // Clean up any corrupted localStorage data on app startup
    const userData = localStorage.getItem('user');
    if (userData === 'undefined' || userData === undefined) {
      localStorage.removeItem('user');
    }
  }, []);

  return <AppRoutes />;
}

export default App;
