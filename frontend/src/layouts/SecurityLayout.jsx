import Header from './Header';
import { useAuth } from '../context/AuthContext';

export default function SecurityLayout({ children }) {
  const { setUser } = useAuth();
  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  const links = [
    { label: 'پیشخوان', path: '/security/dashboard' },
    { label: 'اعلام ورود/خروج', path: '/security/entries' },
    { label: 'درخواست‌ها', path: '/security/requests' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 pt-16">
      <Header title="نگهبانی" links={links} onLogout={logout} />
      <main className="p-6">{children}</main>
    </div>
  );
}
