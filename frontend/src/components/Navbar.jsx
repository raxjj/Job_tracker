import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user) return null;

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <header className="navbar">
      <div className="navbar-inner">
        <Link to="/dashboard" className="brand">
          <span className="brand-mark">Pathway</span>
          <span className="brand-tag">job tracker</span>
        </Link>

        <nav className="nav-links">
          <Link to="/dashboard" className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}>
            Dashboard
          </Link>
          <Link to="/applications" className={`nav-link ${isActive("/applications") ? "active" : ""}`}>
            Applications
          </Link>
        </nav>

        <div className="nav-user">
          <span className="nav-user-name">{user.fullName}</span>
          <button className="btn-logout" onClick={handleLogout}>
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
