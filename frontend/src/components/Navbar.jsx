import { NavLink } from 'react-router-dom';
const tabs = [
  { to: '/dashboard', label: 'Dashboard', icon: GridIcon },
  { to: '/add-feedback', label: 'Add Feedback', icon: PlusIcon },
];
export default function Navbar() {
  return (
    <header className="topbar">
      <div className="topbar-inner">
        <NavLink to="/dashboard" className="logo" aria-label="Feedback Desk, go to dashboard">
          <img src="/favicon.svg" alt="" width="30" height="30" />
          <span>
            Feedback Desk <small>Admin</small>
          </span>
        </NavLink>
        <nav className="tabs" aria-label="Main">
          {tabs.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} className={({ isActive }) => `tab${isActive ? ' tab-active' : ''}`}>
              <Icon />
              {label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}
function GridIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 4h7v7H4zM13 4h7v4h-7zM13 10h7v10h-7zM4 13h7v7H4z" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="M12 8v8M8 12h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}