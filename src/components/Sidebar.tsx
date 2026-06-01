import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, FolderGit2, Calendar, Settings, LogOut } from 'lucide-react';

const navItems = [
  { icon: LayoutDashboard, label: 'Dashboard', to: '/' },
  { icon: CheckSquare, label: 'Tareas', to: '/tasks' },
  { icon: FolderGit2, label: 'Proyectos', to: '/projects' },
  { icon: Calendar, label: 'Calendario', to: '/calendar' },
];

export function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen overflow-y-auto">
      <div className="p-6 border-b border-slate-800">
        <h1 className="text-xl font-bold text-white tracking-tight">Educación Continua</h1>
        <p className="text-xs text-slate-500 mt-1 uppercase font-semibold">Workspace</p>
      </div>

      <nav className="flex-1 px-4 py-6 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-colors font-medium ${
                isActive
                  ? 'bg-blue-600 text-white'
                  : 'hover:bg-slate-800 hover:text-white'
              }`
            }
          >
            <item.icon className="w-5 h-5" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-800">
        <button className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg transition-colors hover:bg-slate-800 hover:text-white font-medium text-left">
          <Settings className="w-5 h-5" />
          <span>Configuración</span>
        </button>
        <button className="flex items-center space-x-3 px-3 py-2.5 w-full rounded-lg transition-colors text-red-400 hover:bg-red-500/10 hover:text-red-300 font-medium text-left mt-2">
          <LogOut className="w-5 h-5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
