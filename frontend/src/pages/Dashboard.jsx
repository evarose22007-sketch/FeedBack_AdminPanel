import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { fetchAllFeedback, removeFeedback } from '../services/feedbackApi';
import Stars from '../components/Stars';
import ConfirmDelete from '../components/ConfirmDelete';

const SORTS = {
  newest: { label: 'Newest first', fn: (a, b) => new Date(b.createdAt) - new Date(a.createdAt) },
  highest: { label: 'Highest rated', fn: (a, b) => b.rating - a.rating },
  lowest: { label: 'Lowest rated', fn: (a, b) => a.rating - b.rating },
  course: { label: 'Course ID (A–Z)', fn: (a, b) => a.courseId.localeCompare(b.courseId) },
};
export default function Dashboard({ notify }) {
  const navigate = useNavigate();
  const [rows, setRows] = useState(null);
  const [loadError, setLoadError] = useState('');
  const [search, setSearch] = useState('');
  const [sortKey, setSortKey] = useState('newest');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const load = useCallback(async () => {
    setLoadError('');
    try {
      setRows(await fetchAllFeedback());
    } catch (err) {
      setLoadError(err.message);
    }
  }, []);
  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    if (!rows || rows.length === 0) return null;
    const avg = rows.reduce((sum, r) => sum + r.rating, 0) / rows.length;
    const perCourse = {};
    rows.forEach((r) => {
      perCourse[r.courseId] ??= { name: r.courseName, total: 0, count: 0 };
      perCourse[r.courseId].total += r.rating;
      perCourse[r.courseId].count += 1;
    });
    const best = Object.values(perCourse).sort((a, b) => b.total / b.count - a.total / a.count || b.count - a.count)[0];
    return {
      count: rows.length,
      average: Math.round(avg * 10) / 10,
      courses: Object.keys(perCourse).length,
      best: { name: best.name, average: Math.round((best.total / best.count) * 10) / 10 },
    };
  }, [rows]);
  const visible = useMemo(() => {
    if (!rows) return [];
    const q = search.trim().toLowerCase();
    return rows
      .filter((r) => !q || `${r.courseId} ${r.courseName} ${r.comments}`.toLowerCase().includes(q))
      .sort(SORTS[sortKey].fn);
  }, [rows, search, sortKey]);

  async function confirmDelete() {
    setDeleting(true);
    try {
      await removeFeedback(pendingDelete.id);
      setRows((list) => list.filter((r) => r.id !== pendingDelete.id));
      notify(`Feedback for ${pendingDelete.courseId} deleted`);
      setPendingDelete(null);
    } catch (err) {
      notify(err.message, 'error');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <section>
      <div className="page-head">
        <div>
          <h1>Course feedback</h1>
          <p className="lede">Every rating students have submitted, in one place.</p>
        </div>
        <Link to="/add-feedback" className="btn btn-primary">
          + Add Feedback
        </Link>
      </div>
      {stats && (
        <dl className="stat-strip">
          <div className="stat">
            <dt>Total feedback</dt>
            <dd>{stats.count}</dd>
          </div>
          <div className="stat">
            <dt>Average rating</dt>
            <dd>
              {stats.average.toFixed(1)} <Stars value={stats.average} size={18} />
            </dd>
          </div>
          <div className="stat">
            <dt>Courses reviewed</dt>
            <dd>{stats.courses}</dd>
          </div>
          <div className="stat stat-wide">
            <dt>Top rated course</dt>
            <dd className="stat-text">
              {stats.best.name} <span>{stats.best.average.toFixed(1)} ★</span>
            </dd>
          </div>
        </dl>
      )}
      <div className="panel">
        {rows && rows.length > 0 && (
          <div className="toolbar">
            <label className="search">
              <span className="sr-only">Search feedback</span>
              <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
                <circle cx="11" cy="11" r="6.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
                <path d="M16 16l4 4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <input type="search" placeholder="Search by course ID, name or comment" value={search} onChange={(e) => setSearch(e.target.value)} />
            </label>
            <label className="sort">
              <span>Sort</span>
              <select value={sortKey} onChange={(e) => setSortKey(e.target.value)}>
                {Object.entries(SORTS).map(([key, s]) => (
                  <option key={key} value={key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
          </div>
        )}

        {loadError && (
          <div className="state state-error" role="alert">
            <p>{loadError}</p>
            <button type="button" className="btn btn-ghost" onClick={load}>
              Retry
            </button>
          </div>
        )}

        {!rows && !loadError && (
          <div className="state" role="status">
            <span className="spinner" aria-hidden="true" /> Loading feedback…
          </div>
        )}

        {rows && rows.length === 0 && (
          <div className="state state-empty">
            <EmptyArt />
            <h2>No feedback yet</h2>
            <p>When feedback is added it will be listed here with its course, duration and rating.</p>
            <Link to="/add-feedback" className="btn btn-primary">
              Add the first feedback
            </Link>
          </div>
        )}

        {rows && rows.length > 0 && visible.length === 0 && (
          <div className="state">
            <p>Nothing matches “{search}”.</p>
            <button type="button" className="btn btn-ghost" onClick={() => setSearch('')}>
              Clear search
            </button>
          </div>
        )}

        {visible.length > 0 && (
          <table className="fb-table">
            <thead>
              <tr>
                <th scope="col">Course ID</th>
                <th scope="col">Course Name</th>
                <th scope="col">Duration</th>
                <th scope="col">Overall Rating</th>
                <th scope="col">Comments</th>
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {visible.map((r) => (
                <tr key={r.id}>
                  <td data-label="Course ID">
                    <span className="code">{r.courseId}</span>
                  </td>
                  <td data-label="Course Name" className="cell-name">
                    {r.courseName}
                  </td>
                  <td data-label="Duration">{r.courseDuration}</td>
                  <td data-label="Overall Rating">
                    <span className="rating-cell">
                      <Stars value={r.rating} />
                      <b>{r.rating}.0</b>
                    </span>
                  </td>
                  <td data-label="Comments" className="cell-comment">
                    <p title={r.comments}>{r.comments}</p>
                  </td>
                  <td className="cell-actions">
                    <button type="button" className="btn btn-sm btn-outline" onClick={() => navigate(`/feedback/${r.id}/edit`)}>
                      Update
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={() => setPendingDelete(r)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <ConfirmDelete item={pendingDelete} busy={deleting} onConfirm={confirmDelete} onCancel={() => setPendingDelete(null)} />
    </section>
  );
}

function EmptyArt() {
  return (
    <svg className="empty-art" viewBox="0 0 160 110" aria-hidden="true">
      <rect x="18" y="20" width="96" height="62" rx="10" fill="#e3eeec" />
      <path d="M40 82l-8 16 22-16" fill="#e3eeec" />
      <rect x="46" y="10" width="96" height="62" rx="10" fill="#fff" stroke="#0e5e63" strokeWidth="2" />
      <path d="M70 72l-6 14 18-14" fill="#fff" stroke="#0e5e63" strokeWidth="2" strokeLinejoin="round" />
      {[0, 1, 2, 3, 4].map((i) => (
        <path
          key={i}
          transform={`translate(${60 + i * 15} 33)`}
          d="M6 0l1.8 3.7 4.1.6-3 2.9.7 4.1L6 9.3 2.4 11.3l.7-4.1-3-2.9 4.1-.6z"
          fill={i < 3 ? '#e8a317' : '#d9dfdd'}
        />
      ))}
      <rect x="62" y="52" width="52" height="5" rx="2.5" fill="#d9dfdd" />
    </svg>
  );
}
