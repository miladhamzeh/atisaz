import Header from './Header';
import { useAuth } from '../context/AuthContext';

export default function UserLayout({ children }) {
  const { setUser } = useAuth();

  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  const links = [
    { label: 'پیشخوان', path: '/dashboard' },
    { label: 'درخواست اسباب‌کشی', path: '/move' },
    { label: 'اعلام خرابی', path: '/issues' },
    { label: 'اخبار', path: '/news' },
    { label: 'رای‌گیری', path: '/voting' },
    { label: 'اصلاح اطلاعات', path: '/data-correction' },
    { label: 'تیکت', path: '/tickets' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 pt-16">
      <Header title="Atisaz" links={links} onLogout={logout} />
      <main className="p-6">{children}</main>
    </div>
  );
}
