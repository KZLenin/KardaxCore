import React from 'react';
import { ShoppingCart, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import B2BSalesTerminal from '../components/B2BSalesTerminal';
import SalesHistoryTable from '../components/SalesHistoryTable';

const SalesView = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-950">Despachos y Ventas B2B</h1>
        <p className="text-zinc-500 mt-1">
          Administra las facturas, despachos a clientes y el historial comercial de SOI Soluciones.
        </p>
      </div>

      {/* 🔥 EL TRUCO ESTÁ AQUÍ: flex flex-col obliga a que se apile hacia abajo 🔥 */}
      <Tabs defaultValue="terminal" className="flex flex-col w-full space-y-6">
        
        {/* LA BARRA DE NAVEGACIÓN */}
        <div>
          <TabsList className="inline-flex h-11 items-center justify-start rounded-lg bg-zinc-100 p-1 text-zinc-500 w-fit">
            
            <TabsTrigger 
              value="terminal" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm"
            >
              <ShoppingCart className="w-4 h-4 mr-2" />
              Terminal de Ventas
            </TabsTrigger>
            
            <TabsTrigger 
              value="historial" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm"
            >
              <History className="w-4 h-4 mr-2" />
              Historial de Facturas
            </TabsTrigger>
            
          </TabsList>
        </div>

        {/* CONTENEDORES */}
        <TabsContent value="terminal" className="m-0 border-none outline-none">
          <B2BSalesTerminal />
        </TabsContent>

        <TabsContent value="historial" className="m-0 border-none outline-none">
          <SalesHistoryTable />
        </TabsContent>
        
      </Tabs>
    </div>
  );
};

export default SalesView;