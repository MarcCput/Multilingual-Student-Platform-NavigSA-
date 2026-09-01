import { Outlet, useLocation } from 'react-router';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider } from '../contexts/AuthContext';
import { Navigation } from '../components/Navigation';

export const RootLayout = () => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/' || location.pathname === '/onboarding';

  return (
    <AuthProvider>
      <LanguageProvider>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
          {!isAuthPage && <Navigation />}
          <main className={isAuthPage ? '' : 'pt-16'}>
            <Outlet />
          </main>
        </div>
      </LanguageProvider>
    </AuthProvider>
  );
};
