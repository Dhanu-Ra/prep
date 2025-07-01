import { Link } from 'react-router-dom';
import { supabase } from '../App';

export default function Navbar() {
  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) console.error('Error logging out:', error);
    else window.location.href = '/'; // Redirect to home after logout
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/">🍳 FoodPrep</Link>
      </div>
      <div className="navbar-links">
        <Link to="/">Home</Link>
        <Link to="/dashboard">Dashboard</Link>
        {supabase.auth.user() ? (
          <button onClick={handleLogout} className="logout-btn">
            Logout
          </button>
        ) : (
          <Link to="/auth">Login</Link>
        )}
      </div>
    </nav>
  );
}