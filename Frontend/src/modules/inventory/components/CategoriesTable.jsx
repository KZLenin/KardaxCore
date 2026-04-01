import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, Plus, Tags } from "lucide-react";
import { inventoryService } from '../services/inventoryService';

const CategoriesTable = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await inventoryService.listarCategorias();
        setCategories(data);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <div className="border rounded-lg bg-white shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="p-4 border-b flex justify-between items-center bg-zinc-50">
        <div className="flex items-center gap-2">
          <Tags className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-zinc-900">Gestión de Categorías</h3>
        </div>
        <Button size="sm" className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm">
          <Plus className="w-4 h-4 mr-2" /> Nueva Categoría
        </Button>
      </div>
      
      {loading ? (
        <div className="flex justify-center p-12"><Loader2 className="animate-spin text-blue-600" /></div>
      ) : (
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent">
              <TableHead className="w-[300px] font-semibold">Nombre de Categoría</TableHead>
              <TableHead className="font-semibold">Prefijo Sistema</TableHead>
              <TableHead className="text-right font-semibold">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories.map((cat) => (
              <TableRow key={cat.id}>
                <TableCell className="font-medium text-zinc-900">{cat.nombre}</TableCell>
                <TableCell>
                  <code className="bg-zinc-100 text-zinc-600 px-2.5 py-1 rounded text-xs font-mono border border-zinc-200">
                    {cat.prefijo || 'N/A'}
                  </code>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-zinc-900">Editar</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
};

export default CategoriesTable;