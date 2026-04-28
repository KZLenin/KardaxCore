import React, { useState } from 'react';
import { 
  FileSpreadsheet, Download, X, Loader2, Filter, Info, CalendarRange, MapPin
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { inventoryService } from '../services/inventoryService';

const ExportInventorySheet = ({ isOpen, setIsOpen, categorias, sedes, proveedores }) => {
  const { toast } = useToast();
  const [isExporting, setIsExporting] = useState(false);

  // --- ESTADO DE LOS FILTROS ---
  const [filtros, setFiltros] = useState({
    sedes: [],
    estados: [],
    stockStatus: 'todos', // 'todos', 'con_stock', 'sin_stock'
    fechaInicio: '',
    fechaFin: '',
  });

  // Función para manejar selecciones múltiples (Sedes o Estados)
  const handleArrayToggle = (campo, valor) => {
    setFiltros(prev => {
      const arrayActual = prev[campo];
      const nuevoArray = arrayActual.includes(valor)
        ? arrayActual.filter(item => item !== valor)
        : [...arrayActual, valor];
      return { ...prev, [campo]: nuevoArray };
    });
  };

  const handleExportar = async () => {
    setIsExporting(true);
    try {
      // Mandamos TODAS las columnas por defecto para que el Excel salga completo
      const payload = {
        columnas: ['codigo', 'nombre', 'categoria', 'sede', 'stock', 'unidad', 'estado', 'proveedor', 'fecha'],
        ...filtros
      };

      const blob = await inventoryService.exportarExcel(payload);
      
      const url = window.URL.createObjectURL(new Blob([blob]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Reporte_Kardex_${new Date().getTime()}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();

      toast({ title: "¡Éxito!", description: "El reporte se generó y descargó correctamente." });
      setIsOpen(false);
    } catch (error) {
      toast({ title: "Error al exportar", description: error.message || "Error desconocido", variant: "destructive" });
    } finally {
      setIsExporting(false);
    }
  };

  // Limpiar filtros al cerrar o abrir
  const resetearFiltros = () => {
    setFiltros({ sedes: [], estados: [], stockStatus: 'todos', fechaInicio: '', fechaFin: '' });
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && resetearFiltros()}>
      <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-slate-50 border-l border-zinc-200 p-0 flex flex-col">
        
        {/* HEADER */}
        <div className="bg-white p-6 border-b border-zinc-200 sticky top-0 z-10 shadow-sm">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-blue-600" />
              Generar Reporte
            </SheetTitle>
            <SheetDescription className="text-zinc-600">
              Aplica filtros para descargar exactamente lo que necesitas.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 p-6 space-y-6">
          
          {/* SECCIÓN 1: SEDES (BODEGAS) */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <MapPin className="w-4 h-4" /> Ubicación
            </h3>
            <div className="bg-white p-4 border border-zinc-200 rounded-lg shadow-sm">
              <p className="text-xs font-semibold text-zinc-700 mb-3">¿De qué bodegas quieres el reporte?</p>
              <div className="flex flex-wrap gap-2">
                {sedes && sedes.length > 0 ? (
                  sedes.map((sede) => (
                    <Button 
                      key={sede.id} type="button" variant="outline" size="sm"
                      className={`text-[11px] h-8 px-3 transition-colors ${filtros.sedes.includes(sede.id) ? 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700 hover:text-white' : 'text-zinc-600 hover:bg-zinc-100'}`}
                      onClick={() => handleArrayToggle('sedes', sede.id)}
                    >
                      {sede.nombre}
                    </Button>
                  ))
                ) : (
                  <p className="text-xs text-zinc-400 italic">No hay sedes disponibles.</p>
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: INTERVALO DE TIEMPO */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <CalendarRange className="w-4 h-4" /> Intervalo de Tiempo
            </h3>
            <div className="bg-white p-4 border border-zinc-200 rounded-lg shadow-sm">
              <p className="text-xs font-semibold text-zinc-700 mb-3">Filtrar por fecha de registro en el sistema:</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Desde</label>
                  <Input 
                    type="date" 
                    value={filtros.fechaInicio} 
                    onChange={e => setFiltros({...filtros, fechaInicio: e.target.value})} 
                    className="mt-1 text-xs h-9 bg-slate-50 cursor-pointer" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Hasta</label>
                  <Input 
                    type="date" 
                    value={filtros.fechaFin} 
                    onChange={e => setFiltros({...filtros, fechaFin: e.target.value})} 
                    className="mt-1 text-xs h-9 bg-slate-50 cursor-pointer" 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECCIÓN 3: ESTADO Y STOCK */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4" /> Operatividad y Stock
            </h3>
            
            <div className="bg-white p-4 border border-zinc-200 rounded-lg shadow-sm space-y-4">
              {/* Disponibilidad */}
              <div>
                <p className="text-xs font-semibold text-zinc-700 mb-2">Disponibilidad en Bodega</p>
                <div className="flex gap-2">
                  {['todos', 'con_stock', 'sin_stock'].map((status) => (
                    <Button 
                      key={status} type="button" variant="outline" size="sm"
                      className={`text-xs h-8 ${filtros.stockStatus === status ? 'bg-zinc-800 text-white border-zinc-800 hover:bg-zinc-700 hover:text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}
                      onClick={() => setFiltros({...filtros, stockStatus: status})}
                    >
                      {status === 'todos' ? 'Todos' : status === 'con_stock' ? 'Con Stock' : 'Agotados'}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Estados */}
              <div className="pt-3 border-t border-zinc-100">
                <p className="text-xs font-semibold text-zinc-700 mb-2">Estado Físico</p>
                <div className="flex flex-wrap gap-2">
                  {['Operativo', 'En Reparación', 'Vendido', 'Agotado/Baja'].map((estado) => (
                    <Button 
                      key={estado} type="button" variant="outline" size="sm"
                      className={`text-[10px] h-7 px-2 transition-colors ${filtros.estados.includes(estado) ? 'bg-zinc-800 text-white border-zinc-800 hover:bg-zinc-700 hover:text-white' : 'text-zinc-500 hover:bg-zinc-100'}`}
                      onClick={() => handleArrayToggle('estados', estado)}
                    >
                      {estado}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* MENSAJE DE AYUDA */}
          <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
            <Info className="w-5 h-5 text-blue-500 shrink-0" />
            <div className="space-y-1">
              <p className="text-xs font-bold text-blue-900 uppercase tracking-tight">Nota sobre Filtros</p>
              <p className="text-[11px] text-blue-700 leading-relaxed">
                Si dejas los filtros en blanco (sin sedes ni fechas específicas), el reporte exportará <strong>TODO</strong> el inventario de la base de datos.
              </p>
            </div>
          </div>

        </div>

        {/* ACCIONES FOOTER */}
        <div className="p-6 bg-white border-t border-zinc-200 flex gap-3 sticky bottom-0">
          <Button 
            variant="outline" 
            className="flex-1 h-11" 
            onClick={resetearFiltros}
            disabled={isExporting}
          >
            <X className="w-4 h-4 mr-2" /> Cancelar
          </Button>
          
          <Button 
            className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            onClick={handleExportar}
            disabled={isExporting}
          >
            {isExporting ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Generando...</>
            ) : (
              <><Download className="w-4 h-4 mr-2" /> Descargar Excel</>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ExportInventorySheet;