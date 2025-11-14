import React, { useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { MenuIcon, BookOpenIcon, ArchiveIcon, PenToolIcon } from 'lucide-react';
const Layout = () => {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  return <div className="min-h-screen bg-background text-charcoal font-sans">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2">
            <BookOpenIcon className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">
              Centre404 Community Magazine
            </span>
          </Link>
          {/* Mobile menu button */}
          <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="md:hidden p-2 rounded-xl hover:bg-background">
            <MenuIcon className="h-6 w-6" />
          </button>
          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink to="/" current={location.pathname === '/'}>
              Share Your Story
            </NavLink>
            <NavLink to="/archive" current={location.pathname === '/archive'}>
              Archive
            </NavLink>
            <NavLink to="/edition/latest" current={location.pathname.includes('/edition')}>
              Latest Edition
            </NavLink>
          </nav>
        </div>
        {/* Mobile navigation */}
        {mobileMenuOpen && <div className="md:hidden bg-white border-t border-light-gray">
            <div className="max-w-5xl mx-auto px-4 py-2 flex flex-col">
              <NavLink to="/" current={location.pathname === '/'}>
                Share Your Story
              </NavLink>
              <NavLink to="/archive" current={location.pathname === '/archive'}>
                Archive
              </NavLink>
              <NavLink to="/edition/latest" current={location.pathname.includes('/edition')}>
                Latest Edition
              </NavLink>
            </div>
          </div>}
      </header>
      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-8">
        <Outlet />
      </main>
      {/* Footer */}
      <footer className="bg-white border-t border-light-gray py-8">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-dark-gray">
            © {new Date().getFullYear()} Centre404 Community Magazine
          </p>
        </div>
      </footer>
    </div>;
};
const NavLink = ({
  to,
  current,
  children
}) => <Link to={to} className={`py-2 px-1 border-b-2 ${current ? 'border-primary text-primary font-medium' : 'border-transparent hover:text-primary'}`}>
    {children}
  </Link>;
export default Layout;