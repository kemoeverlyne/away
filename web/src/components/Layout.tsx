import { ReactNode, useState } from 'react';
import { Header } from './Header';
import { Sidebar } from './common/Sidebar';
import { ThemeProvider } from '../contexts/ThemeContext';
import '../styles/Navbar.css';

interface LayoutProps {
  children: ReactNode;
  onOpenCalculator: () => void;
}

export const Layout = ({ children, onOpenCalculator }: LayoutProps) => {
  const [activeNav, setActiveNav] = useState('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <ThemeProvider>
      <div className="app-layout">
        <Sidebar 
          activeNav={activeNav} 
          setActiveNav={setActiveNav} 
          isMobileOpen={isMobileMenuOpen}
          onCloseMobile={() => setIsMobileMenuOpen(false)}
        />
        <div className="main-wrapper">
          <Header 
            onOpenCalculator={onOpenCalculator} 
            onToggleMobileMenu={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          />
          <main className="content-area">
            {children}
          </main>
        </div>
        {/* Overlay for mobile */}
        {isMobileMenuOpen && (
          <div 
            className="mobile-overlay" 
            onClick={() => setIsMobileMenuOpen(false)}
          />
        )}
      </div>
    </ThemeProvider>
  );
};
