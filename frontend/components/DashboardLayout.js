"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout, loading, isSidebarCollapsed, toggleSidebar } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  if (loading || !user) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'fa-house' },
    { name: 'Kendaraan', href: '/vehicles', icon: 'fa-car' },
    { name: 'Sparepart', href: '/spareparts', icon: 'fa-toolbox' },
    { name: 'Riwayat Ganti', href: '/replacements', icon: 'fa-clock-rotate-left' },
    { name: 'Panduan', href: '/panduan', icon: 'fa-circle-question' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      {/* Mobile Navbar */}
      <div className="md:hidden bg-blue-900 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold"><i className="fa-solid fa-wrench mr-2"></i>Vehicle Part</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2">
          {isMobileMenuOpen ? 'Tutup' : 'Menu'}
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:flex md:flex-col md:sticky md:top-0 md:h-screen md:overflow-y-auto w-full ${
          isSidebarCollapsed ? 'md:w-20' : 'md:w-64'
        } bg-blue-900 text-white flex-shrink-0 transition-all duration-200`}
      >
        <div className={`hidden md:flex items-center ${isSidebarCollapsed ? 'justify-center px-3' : 'justify-between px-6'} py-6`}>
          {!isSidebarCollapsed && (
            <h1 className="text-2xl font-bold tracking-tight whitespace-nowrap">
              <i className="fa-solid fa-wrench mr-2"></i>Vehicle Part
            </h1>
          )}
          <button
            type="button"
            onClick={toggleSidebar}
            className="p-2 rounded-lg text-blue-200 hover:bg-blue-800 hover:text-white transition-colors"
            title={isSidebarCollapsed ? 'Perluas Sidebar' : 'Kecilkan Sidebar'}
            aria-label={isSidebarCollapsed ? 'Perluas Sidebar' : 'Kecilkan Sidebar'}
          >
            <i className={`fa-solid ${isSidebarCollapsed ? 'fa-angles-right' : 'fa-angles-left'}`}></i>
          </button>
        </div>
        <div className={`${isSidebarCollapsed ? 'md:px-2' : 'md:px-4'} px-4 py-2 flex-1`}>
          {!isSidebarCollapsed && (
            <p className="text-sm text-blue-200 mb-6 px-2 truncate">Halo, {user?.name}</p>
          )}
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  title={isSidebarCollapsed ? item.name : undefined}
                  className={`flex items-center ${isSidebarCollapsed ? 'md:justify-center md:px-2' : ''} px-4 py-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-800 text-white font-medium' 
                      : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className={`fa-solid ${item.icon} hidden md:inline-block ${isSidebarCollapsed ? 'text-lg' : 'w-6'}`}></i>
                  <span className={isSidebarCollapsed ? 'md:hidden' : ''}>{item.name}</span>
                </Link>
              );
            })}
            <button 
              onClick={logout}
              title={isSidebarCollapsed ? 'Logout' : undefined}
              className={`w-full flex items-center ${isSidebarCollapsed ? 'md:justify-center md:px-2' : ''} text-left px-4 py-2.5 mt-4 rounded-lg text-red-300 hover:bg-red-900/50 transition-colors`}
            >
              <i className={`fa-solid fa-right-from-bracket hidden md:inline-block ${isSidebarCollapsed ? 'text-lg' : 'w-6'}`}></i>
              <span className={isSidebarCollapsed ? 'md:hidden' : ''}>Logout</span>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-auto p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
