'use client';

import { useEffect } from 'react';
import { LayoutDashboard, ClipboardList, Users, CheckSquare, FileText, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function SucursalAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    // Inyectar CSS personalizado para el sidebar
    const style = document.createElement('style');
    style.textContent = `
      /* Ocultar el sidebar principal del dashboard */
      aside {
        display: none !important;
      }
      
      .sucursal-admin-sidebar {
        background: white;
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
        display: flex !important;
      }
      
      .sucursal-admin-sidebar nav {
        padding: 1rem;
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        width: 100%;
      }
      
      .sucursal-admin-sidebar a,
      .sucursal-admin-sidebar button {
        display: flex;
        align-items: center;
        gap: 0.75rem;
        padding: 0.75rem 1rem;
        border-radius: 0.5rem;
        transition: all 0.3s;
        color: #1a1a1a;
        font-weight: 500;
        text-decoration: none;
        border: none;
        cursor: pointer;
        width: 100%;
        justify-content: flex-start;
        background: transparent;
      }
      
      .sucursal-admin-sidebar a:hover,
      .sucursal-admin-sidebar button:hover {
        background-color: #f3f4f6;
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
      }
      
      .sucursal-admin-sidebar svg {
        width: 1.25rem;
        height: 1.25rem;
        flex-shrink: 0;
        color: #0066cc;
      }
      
      .sucursal-admin-menu-title {
        font-size: 0.875rem;
        font-weight: 600;
        color: #6b7280;
        text-transform: uppercase;
        padding: 1rem 1rem 0.5rem;
        margin-top: 1rem;
        margin-bottom: 0.5rem;
        border-top: 1px solid #e5e7eb;
      }
      
      .sucursal-admin-menu-title:first-child {
        margin-top: 0;
        border-top: none;
      }
    `;
    document.head.appendChild(style);

    return () => {
      document.head.removeChild(style);
    };
  }, []);

  const menuItems = [
    { label: 'Dashboard Sucursal', href: '#', icon: LayoutDashboard },
    { label: 'Pedidos', href: '#pedidos', icon: ClipboardList },
    { label: 'Meseros', href: '#meseros', icon: Users },
    { label: 'Colaboradores', href: '#colaboradores', icon: Users },
    { label: 'Check Lists', href: '#checklists', icon: CheckSquare },
    { label: 'Reportes', href: '#reportes', icon: FileText },
  ];

  return (
    <div className="flex flex-col lg:flex-row min-h-screen">
      {/* Sidebar Personalizado para Administración de Sucursal */}
      <aside className="sucursal-admin-sidebar fixed lg:relative z-30 w-64 bg-white shadow-lg min-h-screen transform transition-transform duration-300 -translate-x-full lg:translate-x-0">
        <nav>
          {/* Botón Volver en el Sidebar */}
          <button
            onClick={() => router.back()}
            className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 text-dark hover:bg-light hover:shadow-md bg-blue-50 border border-blue-200 text-blue-700 hover:bg-blue-100 mb-2"
          >
            <ArrowLeft className="h-5 w-5 flex-shrink-0" />
            <span className="font-medium">Volver</span>
          </button>

          {/* Divider */}
          <div className="my-2 border-t border-gray-200"></div>

          {/* Menu Items */}
          {menuItems.map((item) => {
            const IconComponent = item.icon;
            return (
              <a
                key={item.label}
                href={item.href}
                className="flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-300 text-dark hover:bg-light hover:shadow-md"
              >
                <IconComponent className="h-5 w-5 flex-shrink-0 text-primary" />
                <span className="font-medium">{item.label}</span>
              </a>
            );
          })}
        </nav>
      </aside>

      {/* Contenido Principal */}
      <div className="flex-1 w-full lg:w-auto">
        <div className="p-4 lg:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}
