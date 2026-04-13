import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Search, Users, ShieldAlert } from "lucide-react";
import { Input } from "@/components/ui/input";

import { userService } from '../services/userService';
import { locationService } from '../../location/services/locationService'; 

import CreateUserSheet from './CreateUserSheet';
import EditUserSheet from './EditUserSheet';

const UsersTable = () => {
  const [usuarios, setUsuarios] = useState([]);
  const [roles, setRoles] = useState([]);
  const [sedes, setSedes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');

  const [userToEdit, setUserToEdit] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const fetchDatos = async () => {
    try {
      setLoading(true);
      // 🔥 Disparamos las 3 peticiones a la vez para máxima velocidad
      const [dataUsuarios, dataRoles, dataSedes] = await Promise.all([
        userService.getUsuarios(),
        userService.getRoles(),
        locationService.getSedes() // Reciclamos el servicio que hicimos en la otra pantalla
      ]);
      setUsuarios(dataUsuarios);
      setRoles(dataRoles);
      setSedes(dataSedes);
    } catch (error) {
      console.error("Error cargando directorio de usuarios:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDatos(); }, []);

  const filtrados = usuarios.filter(u => 
    u.nombre_completo?.toLowerCase().includes(buscar.toLowerCase()) || 
    u.email?.toLowerCase().includes(buscar.toLowerCase()) ||
    u.rol?.toLowerCase().includes(buscar.toLowerCase())
  );

  return (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center bg-white p-4 rounded-lg border shadow-sm">
        <div className="relative w-80">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <Input 
            placeholder="Buscar por nombre, correo o rol..." 
            className="pl-9 bg-zinc-50" 
            value={buscar} 
            onChange={(e) => setBuscar(e.target.value)} 
          />
        </div>
        
        <CreateUserSheet onCreated={fetchDatos} roles={roles} sedes={sedes} />
      </div>

      <div className="border rounded-lg bg-white overflow-hidden shadow-sm">
        {loading ? (
          <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div>
        ) : (
          <Table>
            <TableHeader className="bg-zinc-50">
              <TableRow>
                <TableHead className="font-bold">Usuario</TableHead>
                <TableHead className="font-bold">Rol de Acceso</TableHead>
                <TableHead className="font-bold">Sede Base</TableHead>
                <TableHead className="font-bold text-center">Estado</TableHead>
                <TableHead className="text-right font-bold">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtrados.map((u) => (
                <TableRow key={u.id} className="hover:bg-zinc-50/50">
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-semibold text-zinc-900">{u.nombre_completo}</span>
                      <span className="text-xs text-zinc-500">{u.email}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={`font-mono text-xs ${u.rol === 'ADMIN' ? 'border-red-200 text-red-700 bg-red-50' : 'border-blue-200 text-blue-700 bg-blue-50'}`}>
                      {u.rol === 'ADMIN' && <ShieldAlert className="w-3 h-3 mr-1" />}
                      {u.rol}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-zinc-600 text-sm">
                    {u.sede}
                  </TableCell>
                  <TableCell className="text-center">
                    <Badge variant="outline" className="border-green-200 text-green-700 bg-green-50">
                      {u.estado}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-zinc-500 hover:text-blue-600 hover:bg-blue-50"
                        onClick={() => {
                        setUserToEdit(u);
                        setIsEditOpen(true);
                        }}
                    >
                        Gestionar
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>
      <EditUserSheet 
        user={userToEdit}
        roles={roles}
        sedes={sedes}
        isOpen={isEditOpen}
        setIsOpen={setIsEditOpen}
        onUpdated={fetchDatos}
      />
    </div>
  );
};

export default UsersTable;