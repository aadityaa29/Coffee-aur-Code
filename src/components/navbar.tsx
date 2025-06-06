'use client';

import { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';

const navItemsBase = [
  { name: 'Home', path: '/' },
  { name: 'Become an Author', path: '/blog' },
  { name: 'About', path: '/about' },
  { name: 'Contact', path: '/contact' },
];

const dashboardItems = [
  { name: 'Your Dashboard', path: '/dashboard' },
  // { name: 'Settings', path: '/settings' },
];

export default function Navbar() {
  const pathname = usePathname() || '/';
  const [hovered, setHovered] = useState<string | null>(null);
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target as Node)
      ) {
        setDropdownOpen(false);
      }
    }
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownOpen]);

  // Helper for profile avatar fallback
  const getInitial = () => {
    if (user?.displayName) return user.displayName[0].toUpperCase();
    if (user?.email) return user.email[0].toUpperCase();
    return '?';
  };

  // Combine nav items based on user login
  const navItems = user
    ? [...navItemsBase, ...dashboardItems]
    : navItemsBase;


  
  return (
    <nav className="flex justify-between items-center px-6 py-4 bg-gray-900 border-b border-gray-700 sticky top-0 z-50 shadow-lg">
      {/* Logo */}
      <div className="flex items-center space-x-2">
        <span className="text-3xl">☕</span>
        <h1 className="text-2xl font-extrabold text-purple-400 tracking-tight">
          <Link href="/">Coffee aur Code</Link>
        </h1>
      </div>
      {/* Navigation Links */}
      <div className="flex items-center space-x-2 relative">
        {navItems.map((item) => {
          const isActive = pathname === item.path;
          return (
            <Link
              key={item.path}
              href={item.path}
              className="relative px-4 py-2 rounded-md text-sm font-medium transition-colors duration-200 text-white hover:text-purple-400 focus:outline-none focus:ring-2 focus:ring-purple-400"
              onMouseOver={() => setHovered(item.path)}
              onFocus={() => setHovered(item.path)}
              onMouseLeave={() => setHovered(null)}
              onBlur={() => setHovered(null)}
            >
              <span className="relative z-10">{item.name}</span>
              {(hovered === item.path || isActive) && (
                <motion.div
                  layoutId="nav-underline"
                  className="absolute inset-0 bg-purple-700/30 rounded-md -z-10"
                  transition={{
                    type: 'spring',
                    bounce: 0.25,
                    stiffness: 130,
                    damping: 9,
                  }}
                />
              )}
            </Link>
          );
        })}
        {/* Auth/Profile Section */}
        {user ? (
          <div className="relative ml-4" ref={profileRef}>
            <button
              className="flex items-center space-x-2 focus:outline-none"
              onClick={() => setDropdownOpen((v) => !v)}
              aria-haspopup="true"
              aria-expanded={dropdownOpen}
            >
              {user.photoURL ? (
                <img
                  src={user.photoURL}
                  alt="Profile"
                  className="w-8 h-8 rounded-full border-2 border-purple-400 object-cover"
                />
              ) : (
                <span className="w-8 h-8 rounded-full bg-purple-700 flex items-center justify-center text-lg font-bold text-white border-2 border-purple-400">
                  {getInitial()}
                </span>
              )}
              <span className="hidden sm:block font-semibold text-white">
                {user.displayName || user.email}
              </span>
              <svg
                className={`w-4 h-4 ml-1 transition-transform ${
                  dropdownOpen ? 'rotate-180' : ''
                }`}
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                viewBox="0 0 24 24"
              >
                <path d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {/* Dropdown */}
            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-lg z-50 animate-fade-in">
                <div className="px-4 py-3 border-b border-gray-700">
                  <div className="font-semibold text-white truncate">{user.displayName || 'No Name'}</div>
                  <div className="text-xs text-gray-400 truncate">{user.email}</div>
                </div>
                <ul className="py-1">
                  <li>
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-sm text-gray-200 hover:bg-purple-700 hover:text-white transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Profile
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-2 text-sm text-gray-200 hover:bg-purple-700 hover:text-white transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Dashboard
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/settings"
                      className="block px-4 py-2 text-sm text-gray-200 hover:bg-purple-700 hover:text-white transition"
                      onClick={() => setDropdownOpen(false)}
                    >
                      Settings
                    </Link>
                  </li>
                  <li>
                    <button
                      onClick={() => {
                        setDropdownOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-gray-700 hover:text-red-300 transition"
                    >
                      Sign Out
                    </button>
                  </li>
                </ul>
              </div>
            )}
          </div>
        ) : (
          <Link
            href="/signin"
            className="ml-4 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg shadow transition focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            Sign In
          </Link>
        )}
      </div>
    </nav>
  );
}
