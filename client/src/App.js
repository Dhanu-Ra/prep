import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { createClient } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';
import Dashboard from './components/Dashboard';
import RecipeList from './components/RecipeList';
import Auth from './components/Auth';
import Navbar from './components/Navbar';

// Verify environment variables before creating client
if (!process.env.REACT_APP_SUPABASE_URL || !process.env.REACT_APP_SUPABASE_KEY) {
  console.error(
    'Missing Supabase credentials!',
    'URL:', process.env.REACT_APP_SUPABASE_URL,
    'Key:', process.env.REACT_APP_SUPABASE_KEY ? '***exists***' : 'missing'
  );
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_KEY
);

function App() {
  const [supabaseReady, setSupabaseReady] = useState(false);

  // Verify Supabase connection on mount
  useEffect(() => {
    const verifyConnection = async () => {
      try {
        const { error } = await supabase
          .from('recipes')
          .select('*')
          .limit(1);
        
        if (error) throw error;
        setSupabaseReady(true);
        console.log('Supabase connected successfully');
      } catch (error) {
        console.error('Supabase connection failed:', error);
      }
    };

    verifyConnection();
  }, []);

  if (!supabaseReady) {
    return (
      <div className="loading-screen">
        <h2>Connecting to database...</h2>
        <p>Please wait while we establish the connection.</p>
      </div>
    );
  }

  return (
    <Router>
      <Navbar />
      <div className="container">
        <Routes>
          <Route path="/" element={<RecipeList />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/auth" element={<Auth />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;