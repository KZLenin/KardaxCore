import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScanBarcode, TableProperties } from 'lucide-react';

import ScannerTerminal from '../components/ScannerTerminal';
import GlobalHistory from '../components/GlobalHistory'; // Tu tabla general

const MovementView = () => {
  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4 animate-in fade-in duration-500">
      
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-zinc-900 tracking-tight">Centro Logístico</h1>
          <p className="text-zinc-500">Terminal de escaneo y auditoría de movimientos del Kardex.</p>
        </div>
      </div>

      <Tabs defaultValue="terminal" className="w-full flex flex-col">
        <TabsList className="grid w-full max-w-md grid-cols-2 h-12 bg-zinc-100/80 p-1 mb-6">
          <TabsTrigger value="terminal" className="text-sm font-semibold h-full data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">
            <ScanBarcode className="w-4 h-4 mr-2" />
            Terminal POS
          </TabsTrigger>
          <TabsTrigger value="historial" className="text-sm font-semibold h-full data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-sm">
            <TableProperties className="w-4 h-4 mr-2" />
            Auditoría Global
          </TabsTrigger>
        </TabsList>

        <TabsContent value="terminal" className="m-0 focus-visible:outline-none">
          <ScannerTerminal />
        </TabsContent>

        <TabsContent value="historial" className="m-0 focus-visible:outline-none">
          <GlobalHistory />
        </TabsContent>
      </Tabs>
      
    </div>
  );
};

export default MovementView;