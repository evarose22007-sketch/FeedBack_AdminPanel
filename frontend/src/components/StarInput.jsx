// Star Rating. //
import { useState } from 'react';
const LABELS = ['', 'Poor', 'Fair', 'Good', 'Very good', 'Excellent'];
export default function StarInput({ value, onChange, invalid, describedBy }) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;
  return (
    <fieldset className={`star-input${invalid ? ' has-error' : ''}`} aria-describedby={describedBy}>
      <legend className="field-label">Feedback Rating</legend>
      <div className="star-row" onMouseLeave={() => setHover(0)}>
        {[1, 2, 3, 4, 5].map((n) => (
          <label key={n} className={`star-option${n <= shown ? ' lit' : ''}`} onMouseEnter={() => setHover(n)}>
            <input type="radio" name="rating" value={n} checked={value === n} onChange={() => onChange(n)} />
            <svg width="34" height="34" viewBox="0 0 20 20" aria-hidden="true">
              <path d="M10 1.8l2.5 5.2 5.6.8-4.1 3.9 1 5.6L10 14.6l-5 2.7 1-5.6-4.1-3.9 5.6-.8z" />
            </svg>
            <span className="sr-only">
              {n} star{n > 1 ? 's' : ''}, {LABELS[n]}
            </span>
          </label>
        ))}
        <span className="star-caption" aria-hidden="true">
          {shown ? `${shown}/5 · ${LABELS[shown]}` : 'Select a rating'}
        </span>
      </div>
    </fieldset>
  );
}