import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Package, Tags, Truck } from "lucide-react";

// Importamos los sub-módulos limpios
import InventoryTable from '../components/InventoryTable';
import CategoriesTable from '../components/CategoriesTable';
import ProvidersTable from '../components/ProvidersTable';

const InventoryView = () => {
  return (
    <div className="space-y-6 max-w-[1400px] mx-auto p-4 md:p-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Kardex y Catálogos</h1>
        <p className="text-zinc-500">Administra los activos, categorías y proveedores de SOI Soluciones.</p>
      </div>

      <Tabs defaultValue="articulos" className="w-full flex flex-col">
        <TabsList className="grid w-full grid-cols-3 mb-6 bg-zinc-100 p-1 max-w-[600px] rounded-lg">
          <TabsTrigger value="articulos" className="flex items-center gap-2 data-[state=active]:shadow-sm">
            <Package className="w-4 h-4" /> Artículos en Bodega
          </TabsTrigger>
          <TabsTrigger value="categorias" className="flex items-center gap-2 data-[state=active]:shadow-sm">
            <Tags className="w-4 h-4" /> Categorías
          </TabsTrigger>
          <TabsTrigger value="proveedores" className="flex items-center gap-2 data-[state=active]:shadow-sm">
            <Truck className="w-4 h-4" /> Proveedores
          </TabsTrigger>
        </TabsList>

        {/* Los hijos se renderizan aquí de forma aislada */}
        <TabsContent value="articulos" className="m-0 focus-visible:outline-none">
          <InventoryTable />
        </TabsContent>

        <TabsContent value="categorias" className="m-0 focus-visible:outline-none">
          <CategoriesTable />
        </TabsContent>

        <TabsContent value="proveedores" className="m-0 focus-visible:outline-none">
          <ProvidersTable />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default InventoryView;