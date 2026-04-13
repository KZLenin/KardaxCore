import React from 'react';
import { MapPin, Building, Globe } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

// Estos componentes los vamos a crear paso a paso a continuación
// import SedesTable from './SedesTable';
// import CiudadesTable from './CiudadesTable';
// import PaisesTable from './PaisesTable';

const LocationsView = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      
      {/* HEADER */}
      <div>
        <h1 className="text-3xl font-bold text-zinc-950">Ubicaciones y Sedes</h1>
        <p className="text-zinc-500 mt-1">
          Administra las sucursales físicas, ciudades y países donde opera SOI Soluciones.
        </p>
      </div>

      {/* SISTEMA DE PESTAÑAS (Apilado hacia abajo para no romper el diseño) */}
      <Tabs defaultValue="sedes" className="flex flex-col w-full space-y-6">
        
        {/* BARRA DE NAVEGACIÓN COMPACTA */}
        <div>
          <TabsList className="inline-flex h-11 items-center justify-start rounded-lg bg-zinc-100 p-1 text-zinc-500 w-fit">
            
            <TabsTrigger 
              value="sedes" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm"
            >
              <Building className="w-4 h-4 mr-2" />
              Sedes Operativas
            </TabsTrigger>
            
            <TabsTrigger 
              value="ciudades" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm"
            >
              <MapPin className="w-4 h-4 mr-2" />
              Ciudades
            </TabsTrigger>

            <TabsTrigger 
              value="paises" 
              className="inline-flex items-center justify-center whitespace-nowrap rounded-md px-6 py-2 text-sm font-medium transition-all data-[state=active]:bg-white data-[state=active]:text-zinc-950 data-[state=active]:shadow-sm"
            >
              <Globe className="w-4 h-4 mr-2" />
              Países
            </TabsTrigger>
            
          </TabsList>
        </div>

        {/* CONTENEDORES DE LAS TABLAS */}
        <TabsContent value="sedes" className="m-0 border-none outline-none">
          <div className="p-12 border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center text-zinc-500 bg-zinc-50">
            <Building className="w-12 h-12 mb-4 text-zinc-300" />
            <p>Aquí irá la tabla de Sedes (Sucursales)</p>
          </div>
          {/* <SedesTable /> */}
        </TabsContent>

        <TabsContent value="ciudades" className="m-0 border-none outline-none">
          <div className="p-12 border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center text-zinc-500 bg-zinc-50">
            <MapPin className="w-12 h-12 mb-4 text-zinc-300" />
            <p>Aquí irá la tabla de Ciudades</p>
          </div>
          {/* <CiudadesTable /> */}
        </TabsContent>

        <TabsContent value="paises" className="m-0 border-none outline-none">
          <div className="p-12 border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center text-zinc-500 bg-zinc-50">
            <Globe className="w-12 h-12 mb-4 text-zinc-300" />
            <p>Aquí irá la tabla de Países</p>
          </div>
          {/* <PaisesTable /> */}
        </TabsContent>
        
      </Tabs>
    </div>
  );
};

export default LocationsView;