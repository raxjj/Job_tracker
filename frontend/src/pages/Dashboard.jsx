import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import { STATUS_OPTIONS, STATUS_META } from "../statusConfig";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get("/applications/stats");
        setStats(data);
      } catch (err) {
        setError("Couldn't load your stats right now.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  const activeCount = stats
    ? (stats.countByStatus.APPLIED || 0) +
      (stats.countByStatus.OA_ASSESSMENT || 0) +
      (stats.countByStatus.INTERVIEW || 0)
    : 0;

  const offerCount = stats ? stats.countByStatus.OFFER || 0 : 0;

  return (
    <div>
      <p className="eyebrow">Dashboard</p>
      <h1 className="page-title">Welcome back, {user.fullName.split(" ")[0]}</h1>
      <p className="page-subtitle">Here's where your search stands right now.</p>

      {loading && <p>Loading your pipeline...</p>}
      {error && <div className="form-error">{error}</div>}

      {stats && (
        <>
          <div className="dashboard-summary">
            <div className="summary-card">
              <h3>{stats.totalApplications}</h3>
              <p>Total applications tracked</p>
            </div>
            <div className="summary-card">
              <h3>{activeCount}</h3>
              <p>Currently active in a process</p>
            </div>
            <div className="summary-card">
              <h3>{offerCount}</h3>
              <p>Offers received</p>
            </div>
          </div>

          <div className="section-heading">
            <h2>Your pipeline</h2>
            <Link to="/applications" className="nav-link">
              View all &rarr;
            </Link>
          </div>

          <div className="pipeline">
            {STATUS_OPTIONS.map((status) => (
              <div key={status} className="pipeline-stage" style={{ "--stage-color": STATUS_META[status].color }}>
                <span className="pipeline-count">{stats.countByStatus[status] || 0}</span>
                <span className="pipeline-label">{STATUS_META[status].label}</span>
              </div>
            ))}
          </div>

          {stats.totalApplications === 0 && (
            <div className="empty-state">
              <h3>Nothing tracked yet</h3>
              <p>Add your first application to see your pipeline take shape.</p>
              <div style={{ marginTop: 16 }}>
                <Link to="/applications/new" className="fab-add">
                  + Add application
                </Link>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
