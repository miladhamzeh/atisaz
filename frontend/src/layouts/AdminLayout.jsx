import Header from './Header';
import { useAuth } from '../context/AuthContext';

export default function AdminLayout({ children }) {
  const { setUser } = useAuth();
  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  const links = [
    { label: 'پنل مدیریت', path: '/admin/dashboard' },
    { label: 'کاربران', path: '/admin/users' },
    { label: 'درخواست‌ها', path: '/admin/requests' },
    { label: 'نظرسنجی‌ها', path: '/admin/voting' },
    { label: 'اخبار', path: '/admin/news' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <Header title="مدیر سیستم" links={links} onLogout={logout} />
      <main className="p-6">{children}</main>
    </div>
  );
}
