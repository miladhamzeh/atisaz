import Header from './Header';
import { useAuth } from '../context/AuthContext';

export default function TechnicianLayout({ children }) {
  const { setUser } = useAuth();
  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  const links = [
    { label: 'پیشخوان', path: '/technician/dashboard' },
    { label: 'خرابی‌ها', path: '/technician/issues' },
    { label: 'اخبار', path: '/technician/news' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <Header title="مسئول فنی" links={links} onLogout={logout} />
      <main className="p-6">{children}</main>
    </div>
  );
}
