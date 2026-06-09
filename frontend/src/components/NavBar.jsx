import { Link, useLocation, useNavigate } from "react-router-dom";
import "./NavBar.css";

export default function Navbar({ session,onLogout }) {
  // const location = useLocation();
  const navigate = useNavigate();
  // const onDashboard = location.pathname.toLowerCase() === "/dashboard";

  const handleLogout = () => {
    onLogout();          
    navigate("/home");
  };

  return (
    <nav className="navbar">
      <div className="navbar-links">
        <Link to="/home">Home</Link>
        {session && <Link to="/dashboard">Dashboard</Link>}
      </div>

      <div className="navbar-right">
        {session ? (
          <>
            <Link to={`/profile`} className="user-profile">
              Profile
            </Link>
            <button className="navbar-link logout-btn" onClick={handleLogout}>
              Logout
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-signin">
              Sign In
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
