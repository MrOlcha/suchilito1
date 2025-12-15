'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { User } from '../lib/auth';
import { PAGES, BASE_PATH } from '@/lib/config';
import { 
  Menu, 
  X, 
  LogOut, 
  Settings,
  LayoutDashboard,
  ClipboardList,
  DollarSign,
  Tag,
  Utensils,
  ChefHat,
  Users,
  BarChart3,
  Heart,
  Building2
} from 'lucide-react';

interface NavbarProps {
  user: User;
}

export default function Navbar({ user }: NavbarProps) {
  const router = useRouter();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
    router.push(PAGES.LOGIN);
  };

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', Icon: LayoutDashboard },
    { href: '/dashboard/pedidos', label: 'Pedidos', Icon: ClipboardList },
    { href: '/dashboard/caja', label: 'Caja', Icon: DollarSign },
    { href: '/dashboard/clientes', label: 'Clientes', Icon: Heart },
    { href: '/dashboard/sucursales', label: 'Sucursales', Icon: Building2 },
    { href: '/dashboard/precios', label: 'Precios', Icon: Tag },
    { href: '/dashboard/menu', label: 'Menú', Icon: Utensils },
    { href: '/dashboard/meseros', label: 'Meseros', Icon: ChefHat },
    { href: '/dashboard/usuarios', label: 'Usuarios', Icon: Users },
    { href: '/dashboard/reportes', label: 'Reportes', Icon: BarChart3 },
  ];

  const handleMenuClick = (href: string) => {
    router.push(href);
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="bg-white text-dark shadow-md border-b border-gray-200">
      {/* Desktop Header */}
      <div className="hidden md:flex justify-between items-center p-4 px-6">
        {/* Logo a la izquierda */}
        <div className="flex items-center">
          <Image
            src={`${BASE_PATH}/images/logo.png`}
            alt="Logo Dashboard"
            width={120}
            height={60}
            priority
          />
        </div>

        {/* Perfil a la derecha */}
        <div className="relative">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary text-white hover:shadow-lg transition-shadow duration-200"
          >
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </button>

          {/* Dropdown Menu */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
              <div className="p-4 border-b border-gray-200">
                <p className="text-sm font-medium text-dark">¡Hola {user.nombre}!</p>
              </div>
              <div className="p-2">
                <button className="w-full text-left px-4 py-2 text-sm text-dark hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center space-x-2">
                  <Settings className="w-4 h-4" />
                  <span>Preferencias de cuenta</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-2 text-sm text-error hover:bg-error/10 rounded-lg transition-colors duration-200 flex items-center space-x-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-3 px-4">
        {/* Hamburger Menu Izquierda */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0"
          title="Menú"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6 text-gray-900" />
          ) : (
            <Menu className="w-6 h-6 text-gray-900" />
          )}
        </button>

        {/* Logo Centro */}
        <div className="flex-1 flex justify-center px-2">
          <Image
            src={`${BASE_PATH}/images/logo.png`}
            alt="Logo Dashboard"
            width={100}
            height={50}
            priority
          />
        </div>

        {/* Perfil Derecha */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setIsProfileOpen(!isProfileOpen)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary text-white hover:shadow-lg transition-shadow duration-200"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </button>

          {/* Dropdown Menu Mobile */}
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
              <div className="p-3 border-b border-gray-200">
                <p className="text-xs sm:text-sm font-medium text-dark">¡Hola {user.nombre}!</p>
              </div>
              <div className="p-2">
                <button className="w-full text-left px-3 py-2 text-xs sm:text-sm text-dark hover:bg-gray-100 rounded-lg transition-colors duration-200 flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <span>Preferencias</span>
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-3 py-2 text-xs sm:text-sm text-error hover:bg-error/10 rounded-lg transition-colors duration-200 flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Cerrar Sesión</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <>
          {/* Overlay */}
          <div
            className="md:hidden fixed inset-0 bg-black/30 z-30"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          
          {/* Menu Drawer - Slide from left */}
          <div className="md:hidden fixed top-0 left-0 bottom-0 w-64 bg-white z-40 shadow-xl overflow-y-auto">
            {/* Header del Menu */}
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="font-semibold text-gray-900">Menú</h3>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-900" />
              </button>
            </div>

            {/* Menu Items */}
            <nav className="flex flex-col">
              {menuItems.map((item) => {
                const IconComponent = item.Icon;
                return (
                  <button
                    key={item.href}
                    onClick={() => handleMenuClick(item.href)}
                    className="w-full text-left px-4 py-4 text-sm font-medium text-dark hover:bg-gray-100 transition-colors flex items-center gap-3 border-b border-gray-100 last:border-b-0"
                  >
                    <IconComponent className="w-5 h-5 text-primary flex-shrink-0" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </>
      )}
    </header>
  );
}