import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Scan, 
  Users, 
  UserCog,
  Store,
  TrendingUp, 
  Gift, 
  FileText, 
  Settings, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { logout, getCurrentBusinessUser } from '@/lib/store';
import { Button } from '../ui/button';

const allNavItems = [
  { path: '/business/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['OWNER', 'BRANCH_MANAGER', 'STAFF'] },
  { path: '/business/scanner', icon: Scan, label: 'QR Tarama', roles: ['OWNER', 'BRANCH_MANAGER', 'STAFF'] },
  { path: '/business/customers', icon: Users, label: 'Müşteriler', roles: ['OWNER', 'BRANCH_MANAGER'] },
  { path: '/business/staff', icon: UserCog, label: 'Personel', roles: ['OWNER', 'BRANCH_MANAGER'] },
  { path: '/business/branches', icon: Store, label: 'Şubeler', roles: ['OWNER'] },
  { path: '/business/statistics', icon: TrendingUp, label: 'İstatistikler', roles: ['OWNER', 'BRANCH_MANAGER'] },
  { path: '/business/loyalty', icon: Gift, label: 'Sadakat', roles: ['OWNER'] },
  { path: '/business/transactions', icon: FileText, label: 'İşlemler', roles: ['OWNER', 'BRANCH_MANAGER'] },
  { path: '/business/settings', icon: Settings, label: 'Ayarlar', roles: ['OWNER', 'BRANCH_MANAGER'] },
];

export function BusinessSidebar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const businessUser = getCurrentBusinessUser();
  const userRole = businessUser?.role || 'STAFF';
  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

  const handleLogout = () => {
    if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      logout();
    }
  };

  return (
    <>
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-800"
      >
        {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
      </button>

      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40" onClick={() => setIsMobileMenuOpen(false)} />
      )}

      <aside className={`w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen fixed left-0 top-0 z-40 transition-transform duration-300 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}>
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-2xl">☕</div>
            <div className="min-w-0 flex-1">
              <h1 className="font-bold text-base sm:text-lg text-gray-900 dark:text-white">KahveQR</h1>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{businessUser?.brand?.name || 'İşletme'}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink key={item.path} to={item.path} onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg transition-all ${isActive ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-semibold' : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className="text-sm truncate">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-3 sm:p-4 border-t border-gray-200 dark:border-gray-800">
          <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Giriş Yapan</p>
            <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{businessUser?.name || 'Personel'}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{businessUser?.email}</p>
            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2 font-medium">
              {userRole === 'OWNER' && '👑 Ana Yönetici'}
              {userRole === 'BRANCH_MANAGER' && '🔑 Şube Yöneticisi'}
              {userRole === 'STAFF' && '👤 Personel'}
            </p>
          </div>
          <Button variant="outline" className="w-full justify-start gap-2 text-sm text-red-600 border-red-200 hover:bg-red-50" onClick={handleLogout}>
            <LogOut className="w-4 h-4" />
            Çıkış Yap
          </Button>
        </div>
      </aside>
    </>
  );
}
