import Header from './Header';
import { useAuth } from '../context/AuthContext';

export default function LobbymanLayout({ children }) {
  const { setUser } = useAuth();
  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  const links = [
    { label: 'پیشخوان', path: '/lobbyman/dashboard' },
    { label: 'ورود مهمان', path: '/lobbyman/guests' },
    { label: 'درخواست‌ها', path: '/lobbyman/requests' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 pt-16">
      <Header title="لابی‌من" links={links} onLogout={logout} />
      <main className="p-6">{children}</main>
    </div>
  );
}
