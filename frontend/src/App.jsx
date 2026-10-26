import { useCallback, useState } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import Toast from './components/Toast';
import Dashboard from './pages/Dashboard';
import FeedbackFormPage from './pages/FeedbackFormPage';
import NotFound from './pages/NotFound';
export default function App() {
  const [toast, setToast] = useState(null);
  const notify = useCallback((text, kind = 'success') => setToast({ text, kind, at: Date.now() }), []);
  return (
    <div className="app">
      <Navbar />
      <main className="page-wrap">
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard notify={notify} />} />
          <Route path="/add-feedback" element={<FeedbackFormPage mode="add" notify={notify} />} />
          <Route path="/feedback/:id/edit" element={<FeedbackFormPage mode="edit" notify={notify} />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Toast toast={toast} onDone={() => setToast(null)} />
    </div>
  );
}