import { Link } from 'react-router-dom';
export default function NotFound() {
  return (
    <div className="state state-empty">
      <h1>Page not found</h1>
      <p>This address isn't part of the admin panel.</p>
      <Link to="/dashboard" className="btn btn-primary">
        Go to dashboard
      </Link>
    </div>
  );
}
