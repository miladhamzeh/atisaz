import Header from './Header';
import { useAuth } from '../context/AuthContext';

export default function AccountantLayout({ children }) {
  const { setUser } = useAuth();
  const logout = () => {
    localStorage.clear();
    setUser(null);
    window.location.href = '/login';
  };

  const links = [
    { label: 'پیشخوان', path: '/accountant/dashboard' },
    { label: 'ورود شارژ جدید', path: '/accountant/add-charge' },
    { label: 'گزارش بدهی‌ها', path: '/accountant/reports' },
    { label: 'تاریخچه پرداخت‌ها', path: '/accountant/payments' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-16">
      <Header title="حسابدار" links={links} onLogout={logout} />
      <main className="p-6">{children}</main>
    </div>
  );
}
