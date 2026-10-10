import { AuthProvider, useAuth } from '@/context/AuthContext';
import { NavProvider, useNav } from '@/context/NavContext';
import { Navbar } from '@/components/Navbar';
import { HomePage } from '@/pages/HomePage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { DiscountDashboardPage } from '@/pages/DiscountDashboardPage';
import { StarvingStudentHubPage } from '@/pages/StarvingStudentHubPage';
import { FreeFoodPage } from '@/pages/FreeFoodPage';
import { CalendarPage } from '@/pages/CalendarPage';
import { MapPage } from '@/pages/MapPage';

function PageRouter() {
  const { currentPage } = useNav();

  switch (currentPage) {
    case 'home':
      return <HomePage />;
    case 'login':
      return <LoginPage />;
    case 'signup':
      return <SignupPage />;
    case 'profile':
      return <ProfilePage />;
    case 'discount-dashboard':
      return <DiscountDashboardPage />;
    case 'starving-student-hub':
      return <StarvingStudentHubPage />;
    case 'free-food':
      return <FreeFoodPage />;
    case 'calendar':
      return <CalendarPage />;
    case 'map':
      return <MapPage />;
    default:
      return <HomePage />;
  }
}

function AppContent() {
  const { currentPage } = useNav();
  const { loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-3 border-teal-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const showNavbar = currentPage !== 'login' && currentPage !== 'signup';

  return (
    <div className="min-h-screen bg-gray-50">
      {showNavbar && <Navbar />}
      <main>
        <PageRouter />
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <NavProvider>
        <AppContent />
      </NavProvider>
    </AuthProvider>
  );
}
