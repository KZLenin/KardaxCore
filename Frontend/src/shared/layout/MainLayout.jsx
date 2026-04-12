import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/core/store/authStore';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { LayoutDashboard, Package, ArrowLeftRight, Settings, Menu, LogOut, Wrench, Users, MapPin, ShoppingCart } from 'lucide-react';

const MainLayout = () => {
  const { user, clearAuth } = useAuthStore();
  const location = useLocation();

  const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Inventario', href: '/inventory', icon: Package },
    { name: 'Movimientos', href: '/movements', icon: ArrowLeftRight },
    { name: 'Ventas', href: '/sales', icon: ShoppingCart },
    { name: 'Mantenimiento', href: '/maintenance', icon: Wrench },
    { name: 'Usuarios', href: '/users', icon: Users },
    { name: 'Ubicaciones', href: '/locations', icon: MapPin },
    { name: 'Configuración', href: '/settings', icon: Settings },
    
  ];

  // Componente interno para no repetir el código de los links
  const NavLinks = () => (
    <nav className="space-y-1">
      {navigation.map((item) => {
        const isActive = location.pathname.includes(item.href);
        return (
          <Link
            key={item.name}
            to={item.href}
            className={`flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
              isActive 
                ? 'bg-zinc-900 text-white' 
                : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900'
            }`}
          >
            <item.icon className="w-4 h-4" />
            {item.name}
          </Link>
        )
      })}
    </nav>
  );

  return (
    <div className="flex min-h-screen bg-slate-50">
      
      {/* 1. SIDEBAR (Escritorio) */}
      <aside className="hidden w-64 border-r border-zinc-200 bg-white md:block">
        <div className="flex h-16 items-center border-b border-zinc-200 px-6">
          <span className="text-xl font-bold tracking-tight text-zinc-900">SOI Core</span>
        </div>
        <div className="p-4">
          <NavLinks />
        </div>
      </aside>

      {/* 2. CONTENIDO PRINCIPAL */}
      <main className="flex-1 flex flex-col min-w-0">
        
        {/* HEADER (Barra superior) */}
        <header className="flex h-16 items-center justify-between border-b border-zinc-200 bg-white px-4 md:px-6">
          
          {/* Menú Hamburguesa (Solo Móvil) */}
          <div className="md:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="text-zinc-500">
                  <Menu className="w-5 h-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-64 p-0">
                <div className="flex h-16 items-center border-b border-zinc-200 px-6">
                  <span className="text-xl font-bold text-zinc-900">SOI Core</span>
                </div>
                <div className="p-4">
                  <NavLinks />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex-1" /> {/* Espaciador */}

          {/* Menú de Usuario */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="relative w-8 h-8 rounded-full">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="https://github.com/shadcn.png" alt="Usuario" />
                  <AvatarFallback>LS</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56" align="end" forceMount>
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user?.nombre || 'Usuario'}</p>
                  <p className="text-xs leading-none text-zinc-500">{user?.email || 'admin@soisoluciones.com'}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={clearAuth} className="text-red-600 cursor-pointer">
                <LogOut className="w-4 h-4 mr-2" />
                <span>Cerrar Sesión</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* ÁREA DINÁMICA (Aquí se inyectan las vistas) */}
        <div className="flex-1 p-4 md:p-6 overflow-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default MainLayout;