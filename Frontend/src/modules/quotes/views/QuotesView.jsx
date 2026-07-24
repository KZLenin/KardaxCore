import React from 'react';
import { FileSignature, History } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import QuotesHistoryTable from '../components/QuotesHistoryTable';
import QuoteGeneratorTerminal from '../components/QuoteGeneratorTerminal'; // Lo haremos en el paso 2

const QuotesView = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-950">Proformas y Cotizaciones</h1>
        <p className="text-zinc-500 mt-1">
          Genera cotizaciones, espera la aprobación del cliente y conviértelas en ventas automáticamente.
        </p>
      </div>

      <Tabs defaultValue="historial" className="flex flex-col w-full space-y-6">
        
        <div className="w-full overflow-x-auto pb-2">
          <TabsList className="inline-flex h-11 items-center justify-start rounded-lg bg-zinc-100 p-1 text-zinc-500 w-fit">
            
            <TabsTrigger 
              value="generador" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm"
            >
              <FileSignature className="w-4 h-4 mr-2" />
              Generar Proforma
            </TabsTrigger>
            
            <TabsTrigger 
              value="historial" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm"
            >
              <History className="w-4 h-4 mr-2" />
              Historial y Aprobaciones
            </TabsTrigger>
            
          </TabsList>
        </div>

        <TabsContent value="generador" className="m-0 border-none outline-none">
            <QuoteGeneratorTerminal />
        </TabsContent>

        <TabsContent value="historial" className="m-0 border-none outline-none">
          <QuotesHistoryTable />
        </TabsContent>
        
      </Tabs>
    </div>
  );
};

export default QuotesView;