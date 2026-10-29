import { Link, useLocation, useNavigate } from 'react-router';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { listNotifications } from '../../lib/api';
import { useAsyncData } from '../../lib/useAsyncData';
import type { NotificationRow } from '../../lib/database.types';
import {
  Home,
  ShoppingBag,
  FileText,
  FolderOpen,
  User,
  Menu,
  Globe,
  LogOut,
  CalendarCheck,
  Bell,
  BookOpen,
  Building2,
  ShieldCheck,
} from 'lucide-react';
import { useState } from 'react';

export const Navigation = () => {
  const { t, language, setLanguage } = useLanguage();
  const { user, profile, signOut } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [langMenuOpen, setLangMenuOpen] = useState(false);

  const { data: notifications } = useAsyncData<NotificationRow[]>(
    () => (user ? listNotifications(user.id) : Promise.resolve([])),
    [],
    [user?.id, location.pathname],
  );
  const unread = notifications.filter((n) => !n.read_at).length;

  const navItems = [
    { path: '/dashboard', label: t('nav.dashboard'), icon: Home },
    { path: '/marketplace', label: t('nav.marketplace'), icon: ShoppingBag },
    { path: '/applications', label: t('nav.applications'), icon: FileText },
    { path: '/documents', label: t('nav.documents'), icon: FolderOpen },
    { path: '/bookings', label: t('nav.bookings'), icon: CalendarCheck },
    { path: '/guides', label: t('nav.guides'), icon: BookOpen },
  ];

  // Shown only to the people they apply to. The database enforces the same
  // boundary regardless of what the menu displays.
  const roleItems = [
    ...(profile?.role === 'admin'
      ? [{ path: '/admin', label: t('nav.admin'), icon: ShieldCheck }]
      : []),
    ...(profile?.role === 'provider'
      ? [{ path: '/provider', label: t('nav.provider'), icon: Building2 }]
      : []),
  ];

  const allItems = [...navItems, ...roleItems];

  const languages = [
    { code: 'en', name: 'English' },
    { code: 'pt', name: 'Português' },
    { code: 'fr', name: 'Français' },
    { code: 'es', name: 'Español' },
  ];

  const initials =
    [profile?.first_name?.[0], profile?.last_name?.[0]].filter(Boolean).join('').toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    '?';

  const handleSignOut = async () => {
    await signOut();
    navigate('/', { replace: true });
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white/80 backdrop-blur-md shadow-sm z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">N</span>
              </div>
              <span className="font-semibold text-slate-900 hidden sm:inline">
                {t('app.name')}
              </span>
            </Link>

            <div className="hidden lg:flex gap-1">
              {allItems.map((item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="text-sm">{item.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              to="/notifications"
              title={t('nav.notifications')}
              className={`relative p-2 rounded-lg transition-colors ${
                location.pathname === '/notifications'
                  ? 'bg-blue-50 text-blue-700'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Bell className="w-5 h-5" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </Link>

            <div className="relative">
              <button
                onClick={() => setLangMenuOpen(!langMenuOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg text-slate-600 hover:bg-slate-50 transition-colors"
              >
                <Globe className="w-4 h-4" />
                <span className="text-sm uppercase hidden sm:inline">{language}</span>
              </button>

              {langMenuOpen && (
                <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-lg border border-slate-200 py-1">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code as any);
                        setLangMenuOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-slate-50 ${
                        language === lang.code ? 'text-blue-700 bg-blue-50' : 'text-slate-700'
                      }`}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/profile"
              title={user?.email ?? undefined}
              className="hidden sm:flex w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-full items-center justify-center text-white text-xs font-bold"
            >
              {initials}
            </Link>

            <button
              onClick={handleSignOut}
              title="Sign out"
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-50 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-50"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white max-h-[70vh] overflow-y-auto">
          <div className="px-4 py-3 space-y-1">
            {[...allItems, { path: '/profile', label: t('nav.profile'), icon: User }].map(
              (item) => {
                const Icon = item.icon;
                const isActive = location.pathname === item.path;
                return (
                  <Link
                    key={item.path}
                    to={item.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      isActive ? 'bg-blue-50 text-blue-700' : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              },
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
