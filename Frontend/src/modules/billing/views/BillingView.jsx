import React, { useState } from 'react';
import { Wallet, FileCheck, CircleDollarSign } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import PendientesTable from '../components/PendientesTable';
import CarteraTable from '../components/CarteraTable'; // Lo haremos en el siguiente paso

const BillingView = () => {
  const [activeTab, setActiveTab] = useState("pendientes");

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* ENCABEZADO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-950 flex items-center gap-3">
            <div className="p-2.5 bg-emerald-600 rounded-xl shadow-sm">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            Facturación y Cartera
          </h1>
          <p className="text-zinc-500 mt-2">
            Emite facturas SRI agrupando órdenes de despacho y gestiona tus cuentas por cobrar.
          </p>
        </div>
      </div>

      <Tabs defaultValue="pendientes" className="w-full flex flex-col space-y-6" onValueChange={setActiveTab}>
        
        {/* CONTENEDOR BOTONES */}
        <div>
          <TabsList className="grid w-full max-w-md grid-cols-2 h-12 p-1 bg-zinc-100 border border-zinc-200 rounded-lg">
            <TabsTrigger 
              value="pendientes" 
              className="flex items-center justify-center gap-2 h-full data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <FileCheck className="w-4 h-4" />
              Por Facturar
            </TabsTrigger>
            
            <TabsTrigger 
              value="cartera"
              className="flex items-center justify-center gap-2 h-full data-[state=active]:bg-white data-[state=active]:text-emerald-700 data-[state=active]:shadow-sm rounded-md transition-all"
            >
              <CircleDollarSign className="w-4 h-4" />
              Cuentas por Cobrar
            </TabsTrigger>
          </TabsList>
        </div>

        {/* CONTENIDO PESTAÑA 1 */}
        <TabsContent value="pendientes" className="m-0 outline-none animate-in fade-in-50 duration-500">
          <PendientesTable />
        </TabsContent>

        {/* CONTENIDO PESTAÑA 2 */}
        <TabsContent value="cartera" className="m-0 outline-none animate-in fade-in-50 duration-500">
          <CarteraTable /> 
        </TabsContent>

      </Tabs>
    </div>
  );
};

export default BillingView;