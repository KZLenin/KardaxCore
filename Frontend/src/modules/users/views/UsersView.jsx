import React from 'react';
import { Users, ShieldCheck } from 'lucide-react';
import UsersTable from '../components/UsersTable';

const UsersView = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-zinc-950 flex items-center gap-3">
            <Users className="w-8 h-8 text-blue-600" />
            Control de Usuarios
          </h1>
          <p className="text-zinc-500 mt-1">
            Administra los perfiles de acceso, roles y asignaciones de sede del personal.
          </p>
        </div>
      </div>

      {/* CONTENIDO PRINCIPAL */}
      <div className="mt-6">
        <UsersTable />
      </div>

    </div>
  );
};

export default UsersView;