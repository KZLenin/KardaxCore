import React, { useState, useEffect } from 'react';
import CreateCategorySheet from './CreateCategoriesSheet';
import EditCategorySheet from './EditCategorySheet';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";

import { Loader2, Plus, Tags } from "lucide-react";
import { toast } from 'sonner';
import { categoryService } from '../services/categoryService';

const CategoriesTable = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [categoryToEdit, setCategoryToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const data = await categoryService.getCategorias();
      setCategories(data);
    } catch (error) {
      toast.error("Error al cargar categorías");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

 

  return (
    <div className="border rounded-lg bg-white shadow-sm overflow-hidden animate-in fade-in duration-500">
      <div className="p-4 border-b flex justify-between items-center bg-zinc-50">
        <div className="flex items-center gap-2">
          <Tags className="w-5 h-5 text-blue-600" />
          <h3 className="font-semibold text-zinc-900">Gestión de Categorías</h3>
        </div>

        <CreateCategorySheet onCreated={fetchCategories} />
      </div>
      
      {/* ... (Aquí va tu tabla que ya tenías sin cambios) ... */}
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
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => {
                      setCategoryToEdit(cat);
                      setIsEditModalOpen(true);
                    }}
                  >
                    Detalles
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
      <EditCategorySheet 
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        category={categoryToEdit}
        onUpdated={fetchCategories}
      />
    </div>
  );
};

export default CategoriesTable;