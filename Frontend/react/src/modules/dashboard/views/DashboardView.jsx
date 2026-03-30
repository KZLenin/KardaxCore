import React from 'react';

const DashboardView = () => {
  return (
    <>
      {/* Tarjetas de Resumen (Widgets) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Movimientos de Hoy</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">14</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Stock Bajo</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">3</p>
        </div>
        <div className="bg-white rounded-lg shadow p-6 border-l-4 border-purple-500">
          <h3 className="text-gray-500 text-sm font-medium uppercase">Equipos Asignados</h3>
          <p className="text-3xl font-bold text-gray-800 mt-2">42</p>
        </div>
      </div>

      {/* Área principal de trabajo */}
      <div className="bg-white rounded-lg shadow p-6 h-96 flex flex-col items-center justify-center text-gray-400 border-2 border-dashed border-gray-200">
        <span className="block text-4xl mb-4">👋</span>
        <p className="text-center text-lg">
          ¡Bienvenido al sistema KardaxCore!
        </p>
        <p className="text-center text-sm mt-2">
          Selecciona un módulo en el menú lateral para comenzar a operar.
        </p>
      </div>
    </>
  );
};

export default DashboardView;