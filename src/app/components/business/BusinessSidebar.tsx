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
  LogOut
} from 'lucide-react';
import { logout, getCurrentBusinessUser } from '@/lib/store';
import { Button } from '../ui/button';

const allNavItems = [
  { path: '/business/dashboard', icon: LayoutDashboard, label: 'Dashboard', roles: ['OWNER', 'BRANCH_MANAGER', 'STAFF'] },
  { path: '/business/scanner', icon: Scan, label: 'QR Tarama', roles: ['OWNER', 'BRANCH_MANAGER', 'STAFF'] },
  { path: '/business/customers', icon: Users, label: 'Müşteriler', roles: ['OWNER', 'BRANCH_MANAGER'] },
  { path: '/business/staff', icon: UserCog, label: 'Personel Yönetimi', roles: ['OWNER', 'BRANCH_MANAGER'] },
  { path: '/business/branches', icon: Store, label: 'Şube Yönetimi', roles: ['OWNER'] },
  { path: '/business/statistics', icon: TrendingUp, label: 'İstatistikler', roles: ['OWNER', 'BRANCH_MANAGER'] },
  { path: '/business/loyalty', icon: Gift, label: 'Sadakat Programı', roles: ['OWNER'] },
  { path: '/business/transactions', icon: FileText, label: 'İşlem Geçmişi', roles: ['OWNER', 'BRANCH_MANAGER'] },
  { path: '/business/settings', icon: Settings, label: 'Ayarlar', roles: ['OWNER', 'BRANCH_MANAGER'] },
];

export function BusinessSidebar() {
  const businessUser = getCurrentBusinessUser();
  const cafeName = businessUser?.cafe?.name || 'İşletme';
  const userRole = businessUser?.role || 'STAFF';

  // Filter nav items based on user role
  const navItems = allNavItems.filter(item => item.roles.includes(userRole));

  const handleLogout = () => {
    if (confirm('Çıkış yapmak istediğinize emin misiniz?')) {
      logout();
    }
  };

  return (
    <aside className="w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col h-screen fixed left-0 top-0">
      {/* Logo & Brand */}
      <div className="p-6 border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center text-2xl">
            ☕
          </div>
          <div>
            <h1 className="font-bold text-lg text-gray-900 dark:text-white">
              KahveQR
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[140px]">
              {businessUser?.brand?.name || 'İşletme'}
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-orange-50 dark:bg-orange-950/30 text-orange-600 dark:text-orange-400 font-semibold'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span className="text-sm">{item.label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User & Logout */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-800">
        <div className="mb-3 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Giriş Yapan
          </p>
          <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
            {businessUser?.name || 'Personel'}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {businessUser?.email}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
            {userRole === 'OWNER' && '👑 Ana Yönetici'}
            {userRole === 'BRANCH_MANAGER' && '🔑 Şube Yöneticisi'}
            {userRole === 'STAFF' && '👤 Personel'}
          </p>
        </div>
        <Button
          variant="outline"
          className="w-full justify-start gap-2 text-red-600 border-red-200 hover:bg-red-50 dark:text-red-400 dark:border-red-800 dark:hover:bg-red-950/30"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4" />
          Çıkış Yap
        </Button>
      </div>
    </aside>
  );
}

