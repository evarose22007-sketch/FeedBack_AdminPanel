import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { createFeedback, fetchCourses, fetchFeedback, updateFeedback } from '../services/feedbackApi';
import StarInput from '../components/StarInput';
const MAX_COMMENT = 1000;
function validate({ course, comments, rating }) {
  const errs = {};
  if (!course) errs.course = 'Choose the course this feedback is about.';
  if (!comments.trim()) errs.comments = 'Write a few words of feedback.';
  else if (comments.trim().length < 5) errs.comments = 'Feedback should be at least 5 characters.';
  if (!rating) errs.rating = 'Pick a rating from 1 to 5.';
  return errs;
}

// Add and Update or Alter feedback //
export default function FeedbackFormPage({ mode, notify }) {
  const editing = mode === 'edit';
  const { id } = useParams();
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [form, setForm] = useState({ course: '', comments: '', rating: 0 });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState('loading'); // loading | ready | saving | failed
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setErrors({});
    setMessage('');

    Promise.all([fetchCourses(), editing ? fetchFeedback(id) : Promise.resolve(null)])
      .then(([courseList, existing]) => {
        if (cancelled) return;
        setCourses(courseList);
        setForm(existing ? { course: existing.courseRef || '', comments: existing.comments, rating: existing.rating } : { course: '', comments: '', rating: 0 });
        setStatus('ready');
      })
      .catch((err) => {
        if (cancelled) return;
        setMessage(err.message);
        setStatus('failed');
      });

    return () => {
      cancelled = true;
    };
  }, [editing, id]);

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    if (errors[key]) setErrors((e) => ({ ...e, [key]: undefined }));
  };

  async function submit(e) {
    e.preventDefault();
    const found = validate(form);
    setErrors(found);
    setMessage('');
    if (Object.keys(found).length) return;
    setStatus('saving');
    const payload = { course: form.course, comments: form.comments.trim(), rating: form.rating };
    try {
      const saved = editing ? await updateFeedback(id, payload) : await createFeedback(payload);
      notify(editing ? `Feedback for ${saved.courseId} updated` : `Feedback for ${saved.courseId} added`);
      navigate('/dashboard');
    } catch (err) {
      setErrors(err.fields || {});
      setMessage(err.message);
      setStatus('ready');
    }
  }

  const selected = courses.find((c) => c.id === form.course);
  if (status === 'loading') {
    return (
      <div className="state" role="status">
        <span className="spinner" aria-hidden="true" /> Loading form…
      </div>
    );
  }
  if (status === 'failed') {
    return (
      <div className="form-shell">
        <h1>{editing ? 'Update feedback' : 'Add feedback'}</h1>
        <div className="state state-error" role="alert">
          <p>{message}</p>
          <Link to="/dashboard" className="btn btn-ghost">
            Back to dashboard
          </Link>
        </div>
      </div>
    );
  }
  return (
    <div className="form-shell">
      <Link to="/dashboard" className="back-link">
        ← Dashboard
      </Link>
      <h1>{editing ? 'Update feedback' : 'Add feedback'}</h1>
      <p className="lede">{editing ? 'Change the course, comments or rating, then save.' : 'Record what a student thought about a course.'}</p>

      <form className="card form-card" onSubmit={submit} noValidate>
        {message && (
          <div className="banner-error" role="alert">
            {message}
          </div>
        )}
        <div className="field">
          <label className="field-label" htmlFor="course">
            Course Name
          </label>
          <select
            id="course"
            value={form.course}
            onChange={(e) => set('course', e.target.value)}
            className={errors.course ? 'has-error' : ''}
            aria-invalid={Boolean(errors.course)}
            aria-describedby={errors.course ? 'course-err' : 'course-help'}
          >
            <option value="">Select a course…</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
          {errors.course ? (
            <p id="course-err" className="field-error">
              {errors.course}
            </p>
          ) : (
            <p id="course-help" className="field-help">
              {selected ? (
                <>
                  <span className="code">{selected.courseId}</span> · {selected.duration}
                </>
              ) : (
                'The course ID and duration are filled in automatically.'
              )}
            </p>
          )}
        </div>
        <div className="field">
          <label className="field-label" htmlFor="comments">
            Feedback Comments
          </label>
          <textarea
            id="comments"
            rows={5}
            maxLength={MAX_COMMENT}
            placeholder="What worked well? What could be better?"
            value={form.comments}
            onChange={(e) => set('comments', e.target.value)}
            className={errors.comments ? 'has-error' : ''}
            aria-invalid={Boolean(errors.comments)}
            aria-describedby="comments-meta"
          />
          <div id="comments-meta" className="field-meta">
            {errors.comments ? <p className="field-error">{errors.comments}</p> : <span />}
            <span className="counter">
              {form.comments.length}/{MAX_COMMENT}
            </span>
          </div>
        </div>

        <div className="field">
          <StarInput value={form.rating} onChange={(n) => set('rating', n)} invalid={Boolean(errors.rating)} describedBy={errors.rating ? 'rating-err' : undefined} />
          {errors.rating && (
            <p id="rating-err" className="field-error">
              {errors.rating}
            </p>
          )}
        </div>

        <div className="form-actions">
          <Link to="/dashboard" className="btn btn-ghost">
            Cancel
          </Link>
          <button type="submit" className="btn btn-primary" disabled={status === 'saving'}>
            {status === 'saving' ? 'Saving…' : editing ? 'Save changes' : 'Submit feedback'}
          </button>
        </div>
      </form>
    </div>
  );
}
