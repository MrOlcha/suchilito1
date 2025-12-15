'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import type { User } from '../lib/auth';
import {
  LayoutDashboard,
  ClipboardList,
  DollarSign,
  Tag,
  ChefHat,
  Users,
  Utensils,
  BarChart3,
  Menu,
  X,
  Heart,
  Building2
} from 'lucide-react';

interface SidebarProps {
  user: User;
}

export default function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const menuItems = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/dashboard/pedidos', label: 'Pedidos', icon: ClipboardList },
    { href: '/dashboard/caja', label: 'Caja', icon: DollarSign },
    { href: '/dashboard/clientes', label: 'Clientes', icon: Heart },
    { href: '/dashboard/sucursales', label: 'Sucursales', icon: Building2 },
    { href: '/dashboard/menu', label: 'Menú', icon: Utensils },
    { href: '/dashboard/meseros', label: 'Meseros', icon: ChefHat },
    { href: '/dashboard/usuarios', label: 'Usuarios', icon: Users },
    { href: '/dashboard/reportes', label: 'Reportes', icon: BarChart3 },
  ];

  const handleLinkClick = () => {
    setIsOpen(false);
  };

  return (
    <>
      {/* Mobile Menu Button - Mantener para compatibilidad si es necesario ocultar */}
      {/* Ahora el menú está integrado en el Navbar para mejor UX */}

      {/* Desktop + Mobile Sidebar */}
      <aside className={`fixed lg:relative z-30 w-64 bg-white shadow-lg min-h-screen transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0`}>
        <nav className="p-4 space-y-2">
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = pathname === item.href || (item.href === '/dashboard' && pathname === '/');

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={handleLinkClick}
                className={`flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-primary text-white shadow-lg transform scale-105'
                    : 'text-dark hover:bg-light hover:shadow-md'
                }`}
              >
                <IconComponent className={`h-5 w-5 flex-shrink-0 ${isActive ? 'text-white' : 'text-primary'}`} />
                <span className="font-medium">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></div>
                )}
              </Link>
            );
          })}
        </nav>
      </aside>
    </>
  );
}