import React, { useState } from 'react';
import { Building2, MapPin, Users } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import EmpresasTable from '../components/EmpresasTable';
import SucursalesTable from '../components/SucursalesTable';

const ClientsView = () => {
  const [activeTab, setActiveTab] = useState("empresas");

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* ENCABEZADO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-950 flex items-center gap-3">
            <div className="p-2.5 bg-blue-600 rounded-xl shadow-sm">
              <Users className="w-6 h-6 text-white" />
            </div>
            Gestión de Clientes B2B
          </h1>
          <p className="text-zinc-500 mt-2">
            Administra razones sociales para facturación y sus múltiples sedes de entrega.
          </p>
        </div>
      </div>

      {/* CONTENEDOR DE TABS (🔥 FIX: flex flex-col para forzar vista vertical) */}
      <Tabs defaultValue="empresas" className="w-full flex flex-col space-y-6" onValueChange={setActiveTab}>
        
        {/* CONTENEDOR BOTONES (🔥 FIX: h-12 para evitar el estiramiento infinito) */}
        <div>
          <TabsList className="grid w-full max-w-md grid-cols-2 h-12 p-1 bg-zinc-100 border border-zinc-200 rounded-lg">
            <TabsTrigger 
              value="empresas" 
              className="flex items-center justify-center gap-2 h-full data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <Building2 className="w-4 h-4" />
              Empresas (RUC)
            </TabsTrigger>
            
            <TabsTrigger 
              value="sucursales"
              className="flex items-center justify-center gap-2 h-full data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <MapPin className="w-4 h-4" />
              Sedes / Sucursales
            </TabsTrigger>
          </TabsList>
        </div>

        {/* CONTENIDO PESTAÑA 1 */}
        <TabsContent value="empresas" className="m-0 outline-none animate-in fade-in-50 duration-500">
          <EmpresasTable />
        </TabsContent>

        {/* CONTENIDO PESTAÑA 2 */}
        <TabsContent value="sucursales" className="m-0 outline-none animate-in fade-in-50 duration-500">
          <SucursalesTable />
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default ClientsView;