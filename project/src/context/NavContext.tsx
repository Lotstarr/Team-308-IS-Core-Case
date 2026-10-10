import { createContext, useContext, useState, ReactNode } from 'react';
import type { PageName } from '@/types';

interface NavContextValue {
  currentPage: PageName;
  navigate: (page: PageName) => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  selectedDate: string | null;
  setSelectedDate: (d: string | null) => void;
}

const NavContext = createContext<NavContextValue | undefined>(undefined);

export function NavProvider({ children }: { children: ReactNode }) {
  const [currentPage, setCurrentPage] = useState<PageName>('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const navigate = (page: PageName) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <NavContext.Provider value={{ currentPage, navigate, searchQuery, setSearchQuery, selectedDate, setSelectedDate }}>
      {children}
    </NavContext.Provider>
  );
}

export function useNav() {
  const ctx = useContext(NavContext);
  if (!ctx) throw new Error('useNav must be used within NavProvider');
  return ctx;
}
