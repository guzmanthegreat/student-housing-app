import { Link, useLocation, useNavigate } from "react-router-dom";
import "./NavBar.css";

export default function Navbar({ session, onLogout }) {
  // const location = useLocation();
  const navigate = useNavigate();
  // const onDashboard = location.pathname.toLowerCase() === "/dashboard";

  const handleLogout = () => {
    onLogout();
    navigate("/home");
  };

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Link to="/home">Roomies</Link>
      </div>
      <div className="navbar-links">
        {session && <Link to="/home">Home</Link>}
        {session && <Link to="/dashboard">Overview</Link>}
      </div>

      <div className="navbar-right">
        {session ? (
          <>
            <Link to={`/profile`} className="user-profile">
              Profile
            </Link>
            <button className="navbar-link logout-btn" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <Link to="/login" className="navbar-login secondary-action">
              Login
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}
