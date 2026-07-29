import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import api from "../api/axios";
import { STATUS_OPTIONS, STATUS_META } from "../statusConfig";

const emptyForm = {
  companyName: "",
  position: "",
  status: "APPLIED",
  appliedDate: "",
  jobLink: "",
  location: "",
  notes: "",
};

export default function ApplicationForm() {
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(emptyForm);
  const [loading, setLoading] = useState(isEditMode);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isEditMode) return;

    const fetchApplication = async () => {
      try {
        const { data } = await api.get(`/applications/${id}`);
        setForm({
          companyName: data.companyName || "",
          position: data.position || "",
          status: data.status || "APPLIED",
          appliedDate: data.appliedDate || "",
          jobLink: data.jobLink || "",
          location: data.location || "",
          notes: data.notes || "",
        });
      } catch (err) {
        setError("Couldn't find that application.");
      } finally {
        setLoading(false);
      }
    };
    fetchApplication();
  }, [id, isEditMode]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    try {
      const payload = { ...form, appliedDate: form.appliedDate || null };
      if (isEditMode) {
        await api.put(`/applications/${id}`, payload);
      } else {
        await api.post("/applications", payload);
      }
      navigate("/applications");
    } catch (err) {
      const details = err.response?.data?.details;
      setError((details && details.join(" ")) || err.response?.data?.message || "Couldn't save this application.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Delete this application? This can't be undone.")) return;
    setDeleting(true);
    try {
      await api.delete(`/applications/${id}`);
      navigate("/applications");
    } catch (err) {
      setError("Couldn't delete this application.");
      setDeleting(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div>
      <p className="eyebrow">{isEditMode ? "Edit application" : "New application"}</p>
      <h1 className="page-title">{isEditMode ? form.companyName || "Edit application" : "Add an application"}</h1>
      <p className="page-subtitle">
        {isEditMode ? "Update the details as your process moves forward." : "Track a new role you've applied to."}
      </p>

      {error && <div className="form-error">{error}</div>}

      <div className="form-card">
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <div className="field">
              <label htmlFor="companyName">Company</label>
              <input
                id="companyName"
                name="companyName"
                type="text"
                required
                value={form.companyName}
                onChange={handleChange}
                placeholder="Acme Corp"
              />
            </div>
            <div className="field">
              <label htmlFor="position">Position</label>
              <input
                id="position"
                name="position"
                type="text"
                required
                value={form.position}
                onChange={handleChange}
                placeholder="Backend Engineer Intern"
              />
            </div>

            <div className="field">
              <label htmlFor="status">Status</label>
              <select id="status" name="status" value={form.status} onChange={handleChange}>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_META[s].label}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label htmlFor="appliedDate">Applied date</label>
              <input
                id="appliedDate"
                name="appliedDate"
                type="date"
                value={form.appliedDate || ""}
                onChange={handleChange}
              />
            </div>

            <div className="field">
              <label htmlFor="location">Location</label>
              <input
                id="location"
                name="location"
                type="text"
                value={form.location}
                onChange={handleChange}
                placeholder="Remote / Bengaluru, IN"
              />
            </div>
            <div className="field">
              <label htmlFor="jobLink">Job posting link</label>
              <input
                id="jobLink"
                name="jobLink"
                type="url"
                value={form.jobLink}
                onChange={handleChange}
                placeholder="https://..."
              />
            </div>

            <div className="field field-full">
              <label htmlFor="notes">Notes</label>
              <textarea
                id="notes"
                name="notes"
                value={form.notes}
                onChange={handleChange}
                placeholder="Referral from Priya, recruiter call scheduled for..."
              />
            </div>
          </div>

          <div className="form-actions">
            <button className="btn btn-primary" type="submit" disabled={saving} style={{ width: "auto" }}>
              {saving ? "Saving..." : isEditMode ? "Save changes" : "Add application"}
            </button>
            <Link to="/applications" className="btn btn-secondary">
              Cancel
            </Link>
          </div>

          {isEditMode && (
            <div className="detail-actions">
              <button
                type="button"
                className="btn btn-danger-ghost"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete application"}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
