import { Outlet, useLocation } from 'react-router';
import { LanguageProvider } from '../contexts/LanguageContext';
import { AuthProvider, useAuth } from '../contexts/AuthContext';
import { Navigation } from '../components/Navigation';

/**
 * Inside the providers, so it can ask whether anyone is signed in.
 * The guides page is public, so the chrome is decided by the session rather
 * than by the path alone.
 */
const Shell = () => {
  const location = useLocation();
  const { session } = useAuth();

  const isEntryPage = location.pathname === '/' || location.pathname === '/onboarding';
  const showNav = Boolean(session) && !isEntryPage;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {showNav && <Navigation />}
      <main className={showNav ? 'pt-16' : ''}>
        <Outlet />
      </main>
    </div>
  );
};

export const RootLayout = () => (
  <AuthProvider>
    <LanguageProvider>
      <Shell />
    </LanguageProvider>
  </AuthProvider>
);
