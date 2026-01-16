'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, BookOpen } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-background text-charcoal font-sans">
      {/* Skip to main content link for keyboard users */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-lg focus:outline-none"
      >
        Skip to main content
      </a>

      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">
              Centre404 Community Magazine
            </span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-background"
            aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileMenuOpen}
            aria-controls="mobile-menu"
          >
            <Menu className="h-6 w-6" aria-hidden="true" />
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="/" current={pathname === '/'}>
              Share Your Story
            </NavLink>
            <NavLink href="/my-submissions" current={pathname === '/my-submissions'}>
              My Submissions
            </NavLink>
            <NavLink href="/magazines" current={pathname === '/magazines'}>
              Archive
            </NavLink>
            <NavLink href="/magazines/latest" current={pathname?.includes('/magazines/') && pathname !== '/magazines'}>
              Latest Edition
            </NavLink>
            <NavLink href="/admin" current={pathname === '/admin' || pathname?.startsWith('/admin/')}>
              Admin
            </NavLink>
          </nav>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <nav id="mobile-menu" className="md:hidden bg-white border-t border-light-gray" role="navigation" aria-label="Mobile navigation">
            <div className="max-w-5xl mx-auto px-4 py-2 flex flex-col">
              <NavLink href="/" current={pathname === '/'}>
                Share Your Story
              </NavLink>
              <NavLink href="/my-submissions" current={pathname === '/my-submissions'}>
                My Submissions
              </NavLink>
              <NavLink href="/magazines" current={pathname === '/magazines'}>
                Archive
              </NavLink>
              <NavLink href="/magazines/latest" current={pathname?.includes('/magazines/') && pathname !== '/magazines'}>
                Latest Edition
              </NavLink>
              <NavLink href="/admin" current={pathname === '/admin' || pathname?.startsWith('/admin/')}>
                Admin
              </NavLink>
            </div>
          </nav>
        )}
      </header>

      {/* Main content */}
      <main id="main-content" className="max-w-5xl mx-auto px-4 py-8" tabIndex={-1}>
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-light-gray py-8 mt-12">
        <div className="max-w-5xl mx-auto px-4 text-center">
          <p className="text-dark-gray">
            © {new Date().getFullYear()} Centre404 Community Magazine
          </p>
        </div>
      </footer>
    </div>
  );
};

const NavLink = ({
  href,
  current,
  children
}: {
  href: string;
  current?: boolean;
  children: React.ReactNode;
}) => (
  <Link
    href={href}
    className={`py-2 px-1 border-b-2 transition-colors ${
      current
        ? 'border-primary text-primary font-medium'
        : 'border-transparent hover:text-primary hover:border-primary/30'
    }`}
  >
    {children}
  </Link>
);

export default Layout;
