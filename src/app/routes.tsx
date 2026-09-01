import { createBrowserRouter } from 'react-router';
import { RootLayout } from './layouts/RootLayout';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './pages/LoginPage';
import { OnboardingPage } from './pages/OnboardingPage';
import { DashboardPage } from './pages/DashboardPage';
import { MarketplacePage } from './pages/MarketplacePage';
import { ApplicationsPage } from './pages/ApplicationsPage';
import { DocumentsPage } from './pages/DocumentsPage';
import { ProfilePage } from './pages/ProfilePage';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: RootLayout,
    children: [
      { index: true, Component: LoginPage },
      {
        Component: ProtectedRoute,
        children: [
          { path: 'onboarding', Component: OnboardingPage },
          { path: 'dashboard', Component: DashboardPage },
          { path: 'marketplace', Component: MarketplacePage },
          { path: 'applications', Component: ApplicationsPage },
          { path: 'documents', Component: DocumentsPage },
          { path: 'profile', Component: ProfilePage },
        ],
      },
    ],
  },
]);
