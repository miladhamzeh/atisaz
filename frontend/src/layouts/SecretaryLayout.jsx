import Header from './Header';
import { useAuth } from '../context/AuthContext';

export default function SecretaryLayout({ children }) {
  const { setUser } = useAuth();

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  const links = [
    { label: 'پیشخوان', path: '/secretary/dashboard' },
    { label: 'درخواست‌ها', path: '/secretary/requests' },
    { label: 'مدیریت اخبار', path: '/secretary/news' },
    { label: 'نظرسنجی‌ها', path: '/secretary/voting' },
    { label: 'تیکت‌ها', path: '/secretary/tickets' },
  ];

  return (
    <div className="min-h-screen bg-slate-100 pt-16">
      <Header title="منشی" links={links} onLogout={logout} />
      <main className="p-6">{children}</main>
    </div>
  );
}
