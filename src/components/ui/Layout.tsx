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
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <BookOpen className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold">
              Centre404 Community Magazine
            </span>
          </Link>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl hover:bg-background"
            aria-label="Toggle mobile menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          {/* Desktop navigation */}
          <nav className="hidden md:flex items-center gap-6">
            <NavLink href="/" current={pathname === '/'}>
              Share Your Story
            </NavLink>
            <NavLink href="/magazines" current={pathname?.includes('/magazines')}>
              Archive
            </NavLink>
            <NavLink href="/admin" current={pathname?.includes('/admin')}>
              Admin
            </NavLink>
          </nav>
        </div>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-light-gray">
            <div className="max-w-5xl mx-auto px-4 py-2 flex flex-col">
              <NavLink href="/" current={pathname === '/'}>
                Share Your Story
              </NavLink>
              <NavLink href="/magazines" current={pathname?.includes('/magazines')}>
                Archive
              </NavLink>
              <NavLink href="/admin" current={pathname?.includes('/admin')}>
                Admin
              </NavLink>
            </div>
          </div>
        )}
      </header>

      {/* Main content */}
      <main className="max-w-5xl mx-auto px-4 py-8">{children}</main>

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
