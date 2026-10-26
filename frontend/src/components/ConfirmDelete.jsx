// For delete popup dialog. //
import { useEffect, useRef } from 'react';
export default function ConfirmDelete({ item, busy, onConfirm, onCancel }) {
  const ref = useRef(null);
  useEffect(() => {
    const dlg = ref.current;
    if (item && !dlg.open) dlg.showModal();
    if (!item && dlg.open) dlg.close();
  }, [item]);
  return (
    <dialog
      ref={ref}
      className="confirm"
      aria-labelledby="confirm-title"
      onCancel={(e) => {
        e.preventDefault();
        onCancel();
      }}
    >
      {item && (
        <>
          <div className="confirm-icon" aria-hidden="true">
            <svg width="22" height="22" viewBox="0 0 24 24">
              <path d="M5 7h14M10 7V5h4v2M7 7l1 13h8l1-13M10 11v6M14 11v6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <h2 id="confirm-title">Delete this feedback?</h2>
          <p>
            The feedback for <strong>{item.courseName}</strong> ({item.courseId}) will be removed permanently and wont be recovered again.
          </p>
          <div className="confirm-actions">
            <button type="button" className="btn btn-ghost" onClick={onCancel} disabled={busy}>
              Keep it
            </button>
            <button type="button" className="btn btn-danger" onClick={onConfirm} disabled={busy}>
              {busy ? 'Deleting…' : 'Delete'}
            </button>
          </div>
        </>
      )}
    </dialog>
  );
}
