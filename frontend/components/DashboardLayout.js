"use client";

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function DashboardLayout({ children }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout, loading } = useAuth();

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'fa-house' },
    { name: 'Kendaraan', href: '/vehicles', icon: 'fa-car' },
    { name: 'Sparepart', href: '/spareparts', icon: 'fa-toolbox' },
    { name: 'Riwayat Ganti', href: '/replacements', icon: 'fa-clock-rotate-left' },
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
      <div className={`${isMobileMenuOpen ? 'block' : 'hidden'} md:block w-full md:w-64 bg-blue-900 text-white flex-shrink-0`}>
        <div className="p-6 hidden md:block">
          <h1 className="text-2xl font-bold tracking-tight"><i className="fa-solid fa-wrench mr-2"></i>Vehicle Part</h1>
        </div>
        <div className="px-4 py-2">
          <p className="text-sm text-blue-200 mb-6 px-2">Halo, {user?.name}</p>
          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`block px-4 py-2.5 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-blue-800 text-white font-medium' 
                      : 'text-blue-100 hover:bg-blue-800 hover:text-white'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <i className={`fa-solid ${item.icon} hidden md:inline-block w-6`}></i>
                  {item.name}
                </Link>
              );
            })}
            <button 
              onClick={logout}
              className="w-full text-left px-4 py-2.5 mt-4 rounded-lg text-red-300 hover:bg-red-900/50 transition-colors"
            >
              Logout
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
