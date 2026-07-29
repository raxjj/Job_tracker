import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import StatusBadge from "../components/StatusBadge";
import { STATUS_OPTIONS, STATUS_META } from "../statusConfig";

const PAGE_SIZE = 8;

export default function Applications() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    const timeout = setTimeout(() => {
      fetchApplications();
    }, 300); // debounce search typing
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search, status, page]);

  const fetchApplications = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await api.get("/applications", {
        params: {
          page,
          size: PAGE_SIZE,
          search: search || undefined,
          status: status || undefined,
        },
      });
      setData(data);
    } catch (err) {
      setError("Couldn't load your applications.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setPage(0);
    setSearch(e.target.value);
  };

  const handleStatusChange = (e) => {
    setPage(0);
    setStatus(e.target.value);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return "No date";
    return new Date(dateStr).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
  };

  return (
    <div>
      <p className="eyebrow">Applications</p>
      <h1 className="page-title">All applications</h1>
      <p className="page-subtitle">Search, filter, and manage everything you've applied to.</p>

      <div className="toolbar">
        <div className="toolbar-filters">
          <input
            type="text"
            placeholder="Search company or position..."
            value={search}
            onChange={handleSearchChange}
          />
          <select value={status} onChange={handleStatusChange}>
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {STATUS_META[s].label}
              </option>
            ))}
          </select>
        </div>
        <Link to="/applications/new" className="fab-add">
          + Add application
        </Link>
      </div>

      {error && <div className="form-error">{error}</div>}
      {loading && <p>Loading...</p>}

      {!loading && data && data.content.length === 0 && (
        <div className="empty-state">
          <h3>No applications found</h3>
          <p>Try a different search, or add a new application to get started.</p>
        </div>
      )}

      {!loading && data && data.content.length > 0 && (
        <>
          <div className="app-list">
            {data.content.map((app) => (
              <Link to={`/applications/${app.id}`} key={app.id} className="app-row">
                <div className="app-row-main">
                  <div className="app-row-company">{app.companyName}</div>
                  <div className="app-row-position">{app.position}</div>
                </div>
                <span className="app-row-meta">{formatDate(app.appliedDate)}</span>
                <StatusBadge status={app.status} />
              </Link>
            ))}
          </div>

          <div className="pagination">
            <button disabled={page === 0} onClick={() => setPage((p) => p - 1)}>
              &larr; Previous
            </button>
            <span>
              Page {data.pageNumber + 1} of {Math.max(data.totalPages, 1)}
            </span>
            <button disabled={data.last} onClick={() => setPage((p) => p + 1)}>
              Next &rarr;
            </button>
          </div>
        </>
      )}
    </div>
  );
}
