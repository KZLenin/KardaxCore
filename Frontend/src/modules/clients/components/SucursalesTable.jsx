import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Building2, User, Search, Phone, Mail } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";

import { clientService } from '../services/clientService';
import CreateSucursalSheet from './CreateSucursalSheet';
import EditSucursalSheet from './EditSucursalSheet';

const SucursalesTable = () => {
  const [empresas, setEmpresas] = useState([]);
  const [empresaSeleccionada, setEmpresaSeleccionada] = useState(""); 
  const [nombreEmpresaSeleccionada, setNombreEmpresaSeleccionada] = useState("");
  
  const [sucursales, setSucursales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [buscar, setBuscar] = useState(''); // 🔥 Nuevo estado para el buscador

  const [sucursalToEdit, setSucursalToEdit] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  useEffect(() => {
    const fetchEmpresasList = async () => {
      try {
        const data = await clientService.obtenerEmpresas();
        setEmpresas(data);
        if (data.length > 0) {
          handleEmpresaChange(data[0].id, data[0].nombre_comercial);
        }
      } catch (error) {
        console.error("Error cargando empresas:", error);
      }
    };
    fetchEmpresasList();
  }, []);

  const fetchSucursales = async (idEmpresa) => {
    if (!idEmpresa) return;
    try {
      setLoading(true);
      const data = await clientService.obtenerSucursalesPorEmpresa(idEmpresa);
      setSucursales(data);
    } catch (error) {
      console.error("Error cargando sucursales:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleEmpresaChange = (id, nombre) => {
    setEmpresaSeleccionada(id);
    if(nombre) setNombreEmpresaSeleccionada(nombre);
    setBuscar(''); // Limpiamos el buscador al cambiar de empresa
    fetchSucursales(id);
  };

  // 🔥 Filtro en tiempo real para las sucursales
  const filtrados = sucursales.filter(s => 
    s.nombre_sucursal?.toLowerCase().includes(buscar.toLowerCase()) || 
    s.contacto_nombre?.toLowerCase().includes(buscar.toLowerCase()) ||
    s.direccion?.toLowerCase().includes(buscar.toLowerCase())
  );

  return (
    <div className="space-y-4">
      
      {/* LA CABECERA MAGISTRAL */}
      <div className="flex flex-col lg:flex-row justify-between items-center bg-white p-4 rounded-xl border border-zinc-200 shadow-sm gap-4">
        
        <div className="flex-1 w-full flex flex-col sm:flex-row items-center gap-3">
          {/* Selector de Empresa */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Building2 className="w-5 h-5 text-zinc-400 hidden sm:block shrink-0" />
            <Select 
              value={empresaSeleccionada} 
              onValueChange={(val) => {
                const emp = empresas.find(e => e.id === val);
                handleEmpresaChange(val, emp?.nombre_comercial);
              }}
            >
              <SelectTrigger className="w-full sm:w-[300px] bg-zinc-50 border-zinc-200 font-semibold text-zinc-800">
                <SelectValue placeholder="Selecciona una Empresa..." />
              </SelectTrigger>
              <SelectContent>
                {empresas.length === 0 ? (
                  <SelectItem value="none" disabled>No hay empresas creadas</SelectItem>
                ) : (
                  empresas.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.nombre_comercial}</SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Buscador de Sucursales (Aparece solo si hay empresa) */}
          {empresaSeleccionada && (
            <div className="relative w-full sm:w-72">
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
              <Input 
                placeholder="Buscar sede, contacto o dirección..." 
                className="pl-9 bg-zinc-50 border-zinc-200" 
                value={buscar} 
                onChange={(e) => setBuscar(e.target.value)} 
              />
            </div>
          )}
        </div>
        
        <div className="w-full lg:w-auto flex justify-end">
          <CreateSucursalSheet 
            empresaId={empresaSeleccionada} 
            empresaNombre={nombreEmpresaSeleccionada}
            onCreated={() => fetchSucursales(empresaSeleccionada)} 
          />
        </div>
      </div>

      <div className="border border-zinc-200 rounded-xl bg-white overflow-hidden shadow-sm min-h-[300px]">
        {!empresaSeleccionada ? (
           <div className="flex justify-center p-12 text-zinc-500 flex-col items-center gap-2">
             <Building2 className="w-10 h-10 text-zinc-300" />
             <p>Selecciona una empresa en el menú superior para ver sus sedes.</p>
           </div>
        ) : loading ? (
          <div className="flex justify-center p-12 text-zinc-500">
            <Loader2 className="animate-spin w-6 h-6 mr-2 text-blue-600" /> Cargando puntos de entrega...
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow>
                <TableHead className="font-bold text-zinc-900 w-[80px] text-center">Tipo</TableHead>
                <TableHead className="font-bold text-zinc-900">Sede Física / Dirección</TableHead>
                <TableHead className="font-bold text-zinc-900">Responsable / Contacto</TableHead>
                <TableHead className="text-right font-bold text-zinc-900">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center text-zinc-500">
                    {buscar ? "No se encontraron sedes con esa búsqueda." : "Esta empresa aún no tiene sedes registradas."}
                  </TableCell>
                </TableRow>
              ) : (
                filtrados.map((sucursal) => (
                  <TableRow key={sucursal.id} className="hover:bg-zinc-50/50">
                    
                    <TableCell className="text-center align-middle">
                      {sucursal.es_matriz ? (
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] uppercase tracking-wider">Matriz</Badge>
                      ) : (
                        <Badge variant="outline" className="bg-zinc-50 text-zinc-500 border-zinc-200 text-[10px] uppercase tracking-wider">Sede</Badge>
                      )}
                    </TableCell>
                    
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 w-8 h-8 rounded-md bg-zinc-100 flex justify-center items-center border border-zinc-200 shrink-0">
                          <MapPin className="w-4 h-4 text-zinc-500" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-900">{sucursal.nombre_sucursal}</span>
                          <span className="text-xs text-zinc-500 truncate max-w-[250px]">{sucursal.direccion || 'Sin dirección física registrada'}</span>
                        </div>
                      </div>
                    </TableCell>
                    
                    <TableCell>
                       <div className="flex flex-col gap-1">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-zinc-400" />
                            <span className="text-sm font-semibold text-zinc-800">{sucursal.contacto_nombre}</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-zinc-500 ml-6">
                            {sucursal.telefono && (
                              <span className="flex items-center gap-1"><Phone className="w-3 h-3 text-zinc-400" /> {sucursal.telefono}</span>
                            )}
                            {sucursal.email && (
                              <span className="flex items-center gap-1"><Mail className="w-3 h-3 text-zinc-400" /> {sucursal.email}</span>
                            )}
                            {!sucursal.telefono && !sucursal.email && <span className="italic">Sin datos de contacto</span>}
                          </div>
                       </div>
                    </TableCell>
                    
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-zinc-500 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => {
                          setSucursalToEdit(sucursal);
                          setIsEditOpen(true);
                        }}
                      >
                        Gestionar
                      </Button>
                    </TableCell>

                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </div>

      <EditSucursalSheet 
        sucursal={sucursalToEdit}
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        onUpdated={() => fetchSucursales(empresaSeleccionada)}
      />
    </div>
  );
};

export default SucursalesTable;