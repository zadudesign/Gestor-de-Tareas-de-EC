import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import Projects from './pages/Projects';
import Settings from './pages/Settings';
import Login from './pages/Login';

function DashboardFallback() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4 pt-20">
      <h2 className="text-2xl font-semibold text-slate-700">Bienvenido al Dashboard</h2>
      <p>Navega a la sección de Proyectos para continuar.</p>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<DashboardFallback />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}
