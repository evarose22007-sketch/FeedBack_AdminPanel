import { useEffect } from 'react';
export default function Toast({ toast, onDone }) {
  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(onDone, 3000);
    return () => clearTimeout(timer);
  }, [toast, onDone]);
  return (
    <div className="toast-holder" role="status" aria-live="polite">
      {toast && (
        <div key={toast.at} className={`toast toast-${toast.kind}`}>
          {toast.text}
        </div>
      )}
    </div>
  );
}