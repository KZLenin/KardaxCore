import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge"; 
import { Loader2, Search, Building2, Mail, Phone, Tag } from "lucide-react"; 
import { Input } from "@/components/ui/input";

import { clientService } from '../services/clientService';
import CreateEmpresaSheet from './CreateEmpresaSheet';
import EditEmpresaSheet from './EditEmpresaSheet';

const EmpresasTable = () => {
  const [empresas, setEmpresas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');

  const [empresaToEdit, setEmpresaToEdit] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchEmpresas = async () => {
    try {
      setLoading(true);
      const data = await clientService.obtenerEmpresas();
      setEmpresas(data);
    } catch (error) {
      console.error("Error cargando empresas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmpresas();
  }, []);

  // 🔥 Filtro mejorado: busca por nombre comercial, razón social o identificación
  const filtrados = empresas.filter(e => 
    e.nombre_comercial?.toLowerCase().includes(buscar.toLowerCase()) || 
    e.identificacion?.toLowerCase().includes(buscar.toLowerCase()) ||
    e.razon_social?.toLowerCase().includes(buscar.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 rounded-xl border border-zinc-200 shadow-sm gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Buscar por cliente, ID o Razón Social..." 
            className="pl-9 bg-zinc-50 border-zinc-200" 
            value={buscar} 
            onChange={(e) => setBuscar(e.target.value)} 
          />
        </div>
        <CreateEmpresaSheet onCreated={fetchEmpresas} />
      </div>

      <div className="border border-zinc-200 rounded-xl bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center p-12 text-zinc-500">
            <Loader2 className="animate-spin w-6 h-6 mr-2 text-blue-600" /> Cargando clientes...
          </div>
        ) : (
          <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow>
                <TableHead className="font-bold text-zinc-900">Cliente / Empresa</TableHead>
                <TableHead className="font-bold text-zinc-900">Identificación</TableHead>
                <TableHead className="font-bold text-zinc-900">Perfil Comercial</TableHead>
                <TableHead className="font-bold text-zinc-900">Contacto Matriz</TableHead>
                <TableHead className="text-right font-bold text-zinc-900">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-32 text-center text-zinc-500">No hay clientes registrados.</TableCell>
                </TableRow>
              ) : (
                filtrados.map((empresa) => (
                  <TableRow key={empresa.id} className="hover:bg-zinc-50/50">
                    
                    {/* Columna 1: Cliente / Empresa */}
                    <TableCell>
                      <div className="flex items-start gap-3">
                        <div className="mt-0.5 w-8 h-8 rounded-md bg-blue-50 flex justify-center items-center border border-blue-100 shrink-0">
                          <Building2 className="w-4 h-4 text-blue-600" />
                        </div>
                        <div className="flex flex-col">
                          <span className="font-bold text-zinc-900">{empresa.nombre_comercial}</span>
                          {empresa.razon_social && (
                            <span className="text-xs text-zinc-500 truncate max-w-[200px]">{empresa.razon_social}</span>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* Columna 2: Identificación */}
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        <Badge variant="outline" className="text-[10px] uppercase bg-zinc-100 text-zinc-600 border-zinc-200">
                          {empresa.tipo_identificacion || 'RUC'}
                        </Badge>
                        <span className="font-mono text-sm font-semibold text-zinc-800">
                          {empresa.identificacion || empresa.ruc || 'S/N'}
                        </span>
                      </div>
                    </TableCell>

                    {/* Columna 3: Perfil Comercial */}
                    <TableCell>
                      <div className="flex flex-col items-start gap-1">
                        <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200 text-xs font-semibold">
                          {empresa.categoria || 'Cliente Final'}
                        </Badge>
                        <span className="text-xs text-zinc-500 flex items-center gap-1">
                          <Tag className="w-3 h-3" /> {empresa.tipo_contribuyente || 'Régimen General'}
                        </span>
                      </div>
                    </TableCell>

                    {/* Columna 4: Contacto */}
                    <TableCell>
                      <div className="flex flex-col gap-1 text-xs text-zinc-600">
                        {empresa.email_facturacion ? (
                          <div className="flex items-center gap-2">
                            <Mail className="w-3 h-3 text-zinc-400" /> {empresa.email_facturacion}
                          </div>
                        ) : (
                          <span className="text-zinc-400 italic">Sin correo</span>
                        )}
                        {empresa.telefono ? (
                          <div className="flex items-center gap-2">
                            <Phone className="w-3 h-3 text-zinc-400" /> {empresa.telefono}
                          </div>
                        ) : null}
                      </div>
                    </TableCell>

                    {/* Columna 5: Acciones */}
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-zinc-500 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => {
                          setEmpresaToEdit(empresa);
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

      <EditEmpresaSheet 
        empresa={empresaToEdit}
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        onUpdated={fetchEmpresas}
      />
    </div>
  );
};

export default EmpresasTable;