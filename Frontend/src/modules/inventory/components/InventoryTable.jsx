import React, { useState, useEffect } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/components/ui/select";
import { Search, Plus, Loader2, PackageX, FilterX, FileSpreadsheet, MapPin, Printer } from "lucide-react";


import { inventoryService } from '../services/inventoryService';
import CreateItemSheet from './CreateItemSheet';
import EditItemSheet from './EditItemSheet';
import BulkImportSheet from './BulkImportSheet';

const InventoryView = () => {
  const [items, setItems] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [proveedores, setProveedores] = useState([]);
  const [sedes, setSedes] = useState([]);

  const [clientes, setClientes] = useState([]);
  const [sucursales, setSucursales] = useState([]);

  const [loading, setLoading] = useState(true);
  
  const [itemToEdit, setItemToEdit] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]); // 🔥 Estado para los checkboxes
  const [isPrinting, setIsPrinting] = useState(false); // Para el loading del botón
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
        const sedesData = await inventoryService.getSedes();
        const clientesData = await inventoryService.getClientes?.() || []; 
        const sucursalesData = await inventoryService.getSucursales?.() || [];
        setCategorias(catData);
        setProveedores(provData);
        setSedes(sedesData);
        setClientes(clientesData);
        setSucursales(sucursalesData);
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

  const getBadgeEstadoOperativo = (estado) => {
    switch(estado) {
      case 'Operativo': 
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 border-emerald-300">Operativo</Badge>;
      case 'En Reparación': 
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-200 border-amber-300">En Reparación</Badge>;
      case 'Vendido': 
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-200 border-blue-300">Vendido</Badge>;
      case 'Agotado/Baja': 
        return <Badge className="bg-rose-100 text-rose-800 hover:bg-rose-200 border-rose-300">Baja Física</Badge>;
      default: 
        return <Badge variant="outline" className="text-zinc-500">{estado || 'Desconocido'}</Badge>;
    }
  };

  const limpiarFiltros = () => {
    setFiltros({ buscar: '', categoriaId: 'todas' });
  };

  const categoriasPrincipales = categorias.filter(c => !c.categoria_padre_id);
  const getSubcategorias = (idPadre) => categorias.filter(c => c.categoria_padre_id === idPadre);


  const handleSelectAll = (e) => {
  if (e.target.checked) {
    setSelectedItems(items.map(item => item.id));
  } else {
    setSelectedItems([]);
  }
};

const handleSelectItem = (id) => {
  if (selectedItems.includes(id)) {
    setSelectedItems(selectedItems.filter(item => item !== id));
  } else {
    setSelectedItems([...selectedItems, id]);
  }
};

const handleBulkPrint = async () => {
  try {
    setIsPrinting(true);
    const blob = await inventoryService.imprimirEtiquetasMasivas(selectedItems);
    
    // Si no le ponemos el tipo, lo va a descargar igual por precaución.
    const file = new Blob([blob], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(file);
    
    // Abrimos la pestaña nueva con el PDF
    window.open(url, '_blank');
    
    // Opcional: Limpiamos los checkboxes después de mandar a imprimir
    setSelectedItems([]);
  } catch (error) {
    alert("Error al imprimir masivamente: " + error);
  } finally {
    setIsPrinting(false);
  }
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
            <SelectItem value="todas" className="font-bold text-blue-600">Todas las categorías</SelectItem>
            
            {categoriasPrincipales.map(padre => (
              <SelectGroup key={padre.id}>
                <SelectLabel className="font-bold text-blue-800 bg-blue-50/50">{padre.nombre}</SelectLabel>
                <SelectItem value={padre.id.toString()} className="pl-6 font-semibold text-zinc-700">
                  {padre.nombre} (General)
                </SelectItem>
                {getSubcategorias(padre.id).map(hijo => (
                  <SelectItem key={hijo.id} value={hijo.id.toString()} className="pl-8 text-zinc-600">
                    ↳ {hijo.nombre}
                  </SelectItem>
                ))}
              </SelectGroup>
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

        {selectedItems.length > 0 && (
          <Button 
            variant="default" 
            onClick={handleBulkPrint}
            disabled={isPrinting}
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm font-semibold animate-in fade-in zoom-in duration-200"
          >
            {isPrinting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Printer className="w-4 h-4 mr-2" />}
            Imprimir ({selectedItems.length})
          </Button>
        )}

        <CreateItemSheet 
          sedes={sedes}
          categorias={categorias} 
          proveedores={proveedores} 
          clientes={clientes} 
          sucursales={sucursales}
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
                <TableHead className="w-[40px] text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-blue-600 cursor-pointer rounded"
                    checked={selectedItems.length === items.length && items.length > 0}
                    onChange={handleSelectAll}
                  />
                </TableHead>
                <TableHead className="w-[150px] font-semibold text-zinc-900">Código/Barras</TableHead>
                <TableHead className="font-semibold text-zinc-900">Nombre del Artículo</TableHead>
                <TableHead className="font-semibold text-zinc-900">Categoría</TableHead>
                <TableHead className="font-semibold text-zinc-900">Ubicación</TableHead>
                <TableHead className="text-right font-semibold text-zinc-900">Stock Actual</TableHead>
                <TableHead className="text-center font-semibold text-zinc-900">Estado Operativo</TableHead>
                <TableHead className="text-right font-semibold text-zinc-900">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
              <TableRow key={item.id} className="hover:bg-zinc-50/50 transition-colors">
                
                {/* 1. CAMBIO: En el Service lo mapeamos como 'item.codigo' */}

                <TableCell className="text-center">
                  <input 
                    type="checkbox" 
                    className="w-4 h-4 accent-blue-600 cursor-pointer rounded"
                    checked={selectedItems.includes(item.id)}
                    onChange={() => handleSelectItem(item.id)}
                  />
                </TableCell>
                <TableCell className="font-mono text-xs text-zinc-600">
                  {item.codigo} 
                </TableCell>

                <TableCell className="font-medium text-zinc-900">
                  <div className="flex items-center gap-2">
                    {item.nombre}
                    {item.es_externo && (
                      <Badge className="bg-orange-100 text-orange-800 border-orange-300 font-bold text-[10px] uppercase">
                        Taller
                      </Badge>
                    )}
                  </div>
                  {/* Subtítulo con el origen */}
                  <span className="block text-xs font-normal text-zinc-500 mt-0.5">
                    {item.proveedor}
                  </span>
                </TableCell>
                
                <TableCell className="font-medium text-zinc-900">
                  {item.nombre}
                </TableCell>
                
                <TableCell>
                  <span className="text-zinc-600 text-sm">{item.categoria}</span>
                </TableCell>

                <TableCell>
                  <div className="flex items-center text-zinc-600 text-sm">
                    <MapPin className="w-3.5 h-3.5 mr-1 text-zinc-400" />
                    {item.sede}
                  </div>
                </TableCell>
                
                {/* 2. CAMBIO: En el Service lo mapeamos como 'item.stock' y 'item.unidad' */}
                <TableCell className="text-right font-semibold text-zinc-900">
                  {item.stock} <span className="text-[10px] text-zinc-400 font-normal uppercase">{item.unidad}</span>
                </TableCell>
                
                <TableCell className="text-center">
                  {/* 3. CAMBIO: Usamos 'item.stock' para que la lógica del badge funcione */}
                  {getBadgeEstadoOperativo(item.estado_operativo)}
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
        clientes={clientes} 
        sucursales={sucursales}
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