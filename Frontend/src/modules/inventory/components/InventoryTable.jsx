import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Plus, Loader2, PackageX, FilterX, FileSpreadsheet } from "lucide-react";


import { inventoryService } from '../services/inventoryService';
import CreateItemSheet from './CreateItemSheet';
import EditItemSheet from './EditItemSheet';
import BulkImportSheet from './BulkImportSheet';

const InventoryView = () => {
  const [items, setItems] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [itemToEdit, setItemToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  // Estado para los filtros activos
  const [filtros, setFiltros] = useState({
    buscar: '',
    categoriaId: 'todas',
  });

  const [isBulkImportOpen, setIsBulkImportOpen] = useState(false);

  // Cargar categorías iniciales
  useEffect(() => {
    const fetchCatalogos = async () => {
      try {
        const catData = await inventoryService.getCategorias();
        const provData = await inventoryService.getProveedores();
        setCategorias(catData);
        setProveedores(provData);
      } catch (error) {
        console.error("Error cargando catálogos", error);
      }
    };
    fetchCatalogos();
  }, []);

  // Cargar inventario cada vez que cambien los filtros
  useEffect(() => {
    const fetchInventory = async () => {
      try {
        setLoading(true);
        // Preparamos los parámetros limpios para Axios
        const params = {};
        if (filtros.buscar) params.buscar = filtros.buscar;
        if (filtros.categoriaId !== 'todas') params.categoriaId = filtros.categoriaId;

        const data = await inventoryService.getAll(params);
        setItems(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    // Un pequeño "debounce" manual para que no dispare peticiones a lo loco mientras escribes
    const delayDebounceFn = setTimeout(() => {
      fetchInventory();
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [filtros]);

  const getStatusBadge = (stock) => {
    // Lógica dinámica: Si el stock es bajo, mostrar alerta
    if (stock <= 2) return <Badge variant="destructive">Crítico</Badge>;
    if (stock <= 5) return <Badge className="bg-amber-500 hover:bg-amber-600">Bajo</Badge>;
    return <Badge className="bg-emerald-500 hover:bg-emerald-600 text-white border-none">Óptimo</Badge>;
  };

  const limpiarFiltros = () => {
    setFiltros({ buscar: '', categoriaId: 'todas' });
  };

  return (
    <div className="space-y-6">

      {/* BARRA DE FILTROS */}
      <div className="flex flex-wrap items-center gap-3 bg-white p-4 rounded-md border shadow-sm">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
          <Input 
            placeholder="Buscar equipo o serie..." 
            className="pl-8"
            value={filtros.buscar}
            onChange={(e) => setFiltros({ ...filtros, buscar: e.target.value })}
          />
        </div>

        <Select 
          value={filtros.categoriaId} 
          onValueChange={(value) => setFiltros({ ...filtros, categoriaId: value })}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Categoría" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todas">Todas las categorías</SelectItem>
            {categorias.map((cat) => (
              <SelectItem key={cat.id} value={cat.id.toString()}>
                {cat.nombre}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {(filtros.buscar !== '' || filtros.categoriaId !== 'todas') && (
          <Button variant="ghost" onClick={limpiarFiltros} className="text-zinc-500">
            <FilterX className="w-4 h-4 mr-2" /> Limpiar
          </Button>
        )}

        <Button 
                variant="outline" 
                onClick={() => setIsBulkImportOpen(true)}
                className="border-green-600 text-green-600 hover:bg-green-50 hover:text-green-700"
            >
                <FileSpreadsheet className="w-4 h-4 mr-2" />
                Importar
            </Button>

        <CreateItemSheet 
          categorias={categorias} 
          proveedores={proveedores} 
          onCreated={() => setFiltros({ ...filtros })} // Este truco hace que el useEffect vuelva a consultar los datos para actualizar la tabla
        />  
      </div>

      

      {/* TABLA DE RESULTADOS */}
      <div className="border rounded-md bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
            <Loader2 className="h-8 w-8 animate-spin mb-4 text-blue-600" />
            <p>Cargando kardex...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-zinc-500">
            <PackageX className="h-12 w-12 mb-4 text-zinc-300" />
            <p className="text-lg font-medium text-zinc-900">No hay equipos encontrados</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-zinc-50">
                {/* Ajustamos los encabezados a tu realidad */}
                <TableHead className="w-[150px] font-semibold text-zinc-900">Código/Barras</TableHead>
                <TableHead className="font-semibold text-zinc-900">Nombre del Artículo</TableHead>
                <TableHead className="font-semibold text-zinc-900">Categoría</TableHead>
                <TableHead className="text-right font-semibold text-zinc-900">Stock Actual</TableHead>
                <TableHead className="text-center font-semibold text-zinc-900">Estado</TableHead>
                <TableHead className="text-right font-semibold text-zinc-900">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
    {items.map((item) => (
    <TableRow key={item.id} className="hover:bg-zinc-50/50 transition-colors">
      
      {/* 1. CAMBIO: En el Service lo mapeamos como 'item.codigo' */}
      <TableCell className="font-mono text-xs text-zinc-600">
        {item.codigo} 
      </TableCell>
      
      <TableCell className="font-medium text-zinc-900">
        {item.nombre}
      </TableCell>
      
      <TableCell>
        <span className="text-zinc-600 text-sm">{item.categoria}</span>
      </TableCell>
      
      {/* 2. CAMBIO: En el Service lo mapeamos como 'item.stock' y 'item.unidad' */}
      <TableCell className="text-right font-semibold text-zinc-900">
        {item.stock} <span className="text-[10px] text-zinc-400 font-normal uppercase">{item.unidad}</span>
      </TableCell>
      
      <TableCell className="text-center">
        {/* 3. CAMBIO: Usamos 'item.stock' para que la lógica del badge funcione */}
        {getStatusBadge(item.stock)}
      </TableCell>
      
      <TableCell className="text-right">
        <Button variant="ghost" size="sm" className="h-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50 " onClick={() => {
            setItemToEdit(item); // item es el objeto de la fila actual del map
            setIsEditModalOpen(true);
          }}>
          Detalles
        </Button>
      </TableCell>
    </TableRow>
  ))}
</TableBody>
          </Table>
        )}
      </div>
      <EditItemSheet 
        isOpen={isEditModalOpen}
        setIsOpen={setIsEditModalOpen}
        item={itemToEdit}
        categorias={categorias}
        proveedores={proveedores}
        onUpdated={() => setFiltros({ ...filtros })} 
      />

      <BulkImportSheet 
        isOpen={isBulkImportOpen}
        setIsOpen={setIsBulkImportOpen}
        onImportSuccess={() => setFiltros({ ...filtros })} 
      />
    </div>
    
  );

  
};

export default InventoryView;