import { useState, useRef, useEffect } from 'react';
import {
  Home,
  Tag,
  UtensilsCrossed,
  Calendar,
  Map,
  User,
  Search,
  Menu,
  X,
  GraduationCap,
  ChevronDown,
} from 'lucide-react';
import { useNav } from '@/context/NavContext';
import { useAuth } from '@/context/AuthContext';
import type { PageName } from '@/types';

const navItems: { page: PageName; label: string; icon: typeof Home }[] = [
  { page: 'home', label: 'Home', icon: Home },
  { page: 'discount-dashboard', label: 'Discount Dashboard', icon: Tag },
  { page: 'starving-student-hub', label: 'Student Card Hub', icon: GraduationCap },
  { page: 'free-food', label: 'Free Food Near Me', icon: UtensilsCrossed },
  { page: 'calendar', label: 'Calendar', icon: Calendar },
  { page: 'map', label: 'Interactive Map', icon: Map },
];

export function Navbar() {
  const { currentPage, navigate, searchQuery, setSearchQuery } = useNav();
  const { profile, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [moreOpen, setMoreOpen] = useState(false);
  const moreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) {
        setMoreOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNav = (page: PageName) => {
    navigate(page);
    setMobileOpen(false);
    setMoreOpen(false);
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => handleNav('home')}
            className="flex items-center gap-2 shrink-0 transition-transform hover:scale-105"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center shadow-md">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg text-gray-900 hidden sm:block">StudentPerks</span>
          </button>

          {/* Desktop Nav - primary items */}
          <nav className="hidden lg:flex items-center gap-1">
            {navItems.slice(0, 4).map(({ page, label, icon: Icon }) => (
              <button
                key={page}
                onClick={() => handleNav(page)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === page
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
            {/* More dropdown */}
            <div className="relative" ref={moreRef}>
              <button
                onClick={() => setMoreOpen(!moreOpen)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  currentPage === 'calendar' || currentPage === 'map' || currentPage === 'profile'
                    ? 'bg-teal-50 text-teal-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                More
                <ChevronDown className={`w-4 h-4 transition-transform ${moreOpen ? 'rotate-180' : ''}`} />
              </button>
              {moreOpen && (
                <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-200 py-2 animate-in fade-in slide-in-from-top-2 duration-150">
                  {navItems.slice(4).map(({ page, label, icon: Icon }) => (
                    <button
                      key={page}
                      onClick={() => handleNav(page)}
                      className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                        currentPage === page ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {label}
                    </button>
                  ))}
                  <div className="border-t border-gray-100 my-1" />
                  {profile ? (
                    <>
                      <button
                        onClick={() => handleNav('profile')}
                        className={`w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                          currentPage === 'profile' ? 'bg-teal-50 text-teal-700' : 'text-gray-700 hover:bg-gray-50'
                        }`}
                      >
                        <User className="w-4 h-4" />
                        Profile
                      </button>
                      <button
                        onClick={() => {
                          signOut();
                          handleNav('home');
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                      >
                        <X className="w-4 h-4" />
                        Sign Out
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => handleNav('login')}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <User className="w-4 h-4" />
                      Sign In / Sign Up
                    </button>
                  )}
                </div>
              )}
            </div>
          </nav>

          {/* Search bar - desktop */}
          <div className="hidden md:flex items-center gap-2 flex-1 max-w-xs mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search deals, food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => navigate('discount-dashboard')}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-100 border border-transparent focus:border-teal-400 focus:bg-white focus:ring-2 focus:ring-teal-100 transition-all outline-none"
              />
            </div>
          </div>

          {/* Profile icon */}
          <button
            onClick={() => handleNav(profile ? 'profile' : 'login')}
            className="flex items-center justify-center w-9 h-9 rounded-full bg-gray-100 hover:bg-teal-100 transition-colors shrink-0"
          >
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt="" className="w-9 h-9 rounded-full object-cover" />
            ) : (
              <User className="w-5 h-5 text-gray-600" />
            )}
          </button>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="lg:hidden flex items-center justify-center w-9 h-9 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
          >
            {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-gray-200 py-3 space-y-1">
            {/* Mobile search */}
            <div className="relative px-3 pb-3">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search deals, food..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  navigate('discount-dashboard');
                  setMobileOpen(false);
                }}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg bg-gray-100 border border-transparent focus:border-teal-400 focus:bg-white outline-none"
              />
            </div>
            {navItems.map(({ page, label, icon: Icon }) => (
              <button
                key={page}
                onClick={() => handleNav(page)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  currentPage === page ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </button>
            ))}
            <div className="border-t border-gray-100 my-2" />
            {profile ? (
              <>
                <button
                  onClick={() => handleNav('profile')}
                  className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    currentPage === 'profile' ? 'bg-teal-50 text-teal-700' : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Profile
                </button>
                <button
                  onClick={() => {
                    signOut();
                    handleNav('home');
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all"
                >
                  <X className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                onClick={() => handleNav('login')}
                className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-100 transition-all"
              >
                <User className="w-4 h-4" />
                Sign In / Sign Up
              </button>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
