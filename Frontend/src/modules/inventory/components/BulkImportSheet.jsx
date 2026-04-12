import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import { 
  Upload, 
  FileSpreadsheet, 
  Check, 
  X, 
  AlertTriangle, 
  Loader2, 
  Table as TableIcon,
  Info
} from 'lucide-react';

import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

import { inventoryService } from '../services/inventoryService';
import { categoryService } from '../services/categoryService';
import { locationService } from '../services/locationService';

const BulkImportSheet = ({ isOpen, setIsOpen, onImportSuccess }) => {
  const { toast } = useToast();
  const [datosPrevia, setDatosPrevia] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [nombreArchivo, setNombreArchivo] = useState("");

  const manejarArchivo = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setNombreArchivo(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const bstr = event.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data = XLSX.utils.sheet_to_json(ws);
        
        // Mapeo inicial para mostrar en la tablita de previa
        const formateados = data.map(fila => ({
          nombre: fila.Nombre || fila.nombre || '',
          codigo: fila.Codigo || fila.codigo || '',
          serie: fila.Serie || fila.serie || '',
          cantidad: fila.Cantidad || fila.cantidad || 0,
          precio: fila.Precio || 0,
          sedeNombre: fila.Sede || fila.sede || '', 
          categoriaNombre: fila.Categoria || fila.categoria || ''
        }));

        setDatosPrevia(formateados);
      } catch (err) {
        toast({ title: "Error de lectura", description: "No se pudo procesar el archivo Excel.", variant: "destructive" });
      }
    };

    reader.readAsBinaryString(file);
  };

  const enviarInventario = async () => {
    if (datosPrevia.length === 0) return;
    setIsUploading(true);

    try {
      // 1. Obtener diccionarios para el mapeador
      const [sedes, categorias] = await Promise.all([
        locationService.getSedes(),
        categoryService.getCategorias()
      ]);

      // 2. Traducir nombres a IDs usando tu service
      const itemsListos = await inventoryService.prepararCargaMasiva(datosPrevia, { 
        sedes, 
        categorias 
      });

      // 3. Petición al Backend
      await inventoryService.importarMasivo(itemsListos);
      
      toast({ title: "¡Carga Exitosa!", description: `Se importaron ${itemsListos.length} equipos.` });
      
      limpiarYSalir();
      if (onImportSuccess) onImportSuccess();

    } catch (error) {
      toast({ 
        title: "Error de validación", 
        description: typeof error === 'string' ? error : error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsUploading(false);
    }
  };

  const limpiarYSalir = () => {
    setDatosPrevia([]);
    setNombreArchivo("");
    setIsOpen(false);
  };

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-slate-50 border-l border-zinc-200 p-0 flex flex-col">
        
        {/* HEADER */}
        <div className="bg-white p-6 border-b border-zinc-200 sticky top-0 z-10 shadow-sm">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold text-zinc-950 flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-green-600" />
              Carga Masiva
            </SheetTitle>
            <SheetDescription className="text-zinc-600">
              Sube un archivo Excel para alimentar el inventario rápidamente.
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 p-6 space-y-6">
          
          {/* ZONA DE CARGA */}
          <div className={`relative group border-2 border-dashed rounded-xl p-8 transition-colors flex flex-col items-center justify-center gap-3 ${datosPrevia.length > 0 ? 'border-green-200 bg-green-50/30' : 'border-zinc-200 bg-white hover:border-blue-400'}`}>
            <div className={`p-3 rounded-full ${datosPrevia.length > 0 ? 'bg-green-100' : 'bg-zinc-100'}`}>
              <Upload className={`w-6 h-6 ${datosPrevia.length > 0 ? 'text-green-600' : 'text-zinc-400'}`} />
            </div>
            
            <div className="text-center">
              <p className="text-sm font-semibold text-zinc-900">
                {nombreArchivo ? nombreArchivo : "Seleccionar archivo Excel"}
              </p>
              <p className="text-xs text-zinc-500 mt-1">Soporta .xlsx, .xls y .csv</p>
            </div>

            <input 
              type="file" 
              accept=".xlsx, .xls, .csv" 
              onChange={manejarArchivo}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              disabled={isUploading}
            />
          </div>

          {/* INFORMACIÓN DE FORMATO */}
          {datosPrevia.length === 0 && (
            <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3">
              <Info className="w-5 h-5 text-blue-500 shrink-0" />
              <div className="space-y-1">
                <p className="text-xs font-bold text-blue-900 uppercase tracking-tight">Columnas Requeridas</p>
                <p className="text-[11px] text-blue-700 leading-relaxed">
                  Asegúrate de que tu Excel tenga los encabezados: <br/>
                  <code className="font-bold">nombre, codigo, serie, cantidad, sede, categoria</code>
                </p>
              </div>
            </div>
          )}

          {/* PREVISUALIZACIÓN */}
          {datosPrevia.length > 0 && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                <TableIcon className="w-4 h-4" /> Previsualización (Primeras 10 filas)
              </h3>
              
              <div className="border border-zinc-200 rounded-lg bg-white overflow-hidden shadow-sm">
                <div className="max-h-[300px] overflow-y-auto">
                  <table className="w-full text-left text-[11px]">
                    <thead className="bg-zinc-50 border-b border-zinc-200 sticky top-0">
                      <tr>
                        <th className="px-3 py-2 font-bold text-zinc-700">Equipo</th>
                        <th className="px-3 py-2 font-bold text-zinc-700">Sede</th>
                        <th className="px-3 py-2 font-bold text-zinc-700 text-center">Cant.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100">
                      {datosPrevia.slice(0, 10).map((item, idx) => (
                        <tr key={idx} className="hover:bg-zinc-50/50 transition-colors">
                          <td className="px-3 py-2 font-medium text-zinc-900">{item.nombre}</td>
                          <td className="px-3 py-2 text-zinc-500 italic">{item.sedeNombre}</td>
                          <td className="px-3 py-2 text-center text-zinc-700">{item.cantidad}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-[10px] text-amber-800 leading-normal">
                  Los nombres de <strong>Sede</strong> y <strong>Categoría</strong> deben ser idénticos a los registrados en el sistema para evitar errores de mapeo.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ACCIONES FOOTER */}
        <div className="p-6 bg-white border-t border-zinc-200 flex gap-3 sticky bottom-0">
          <Button 
            variant="outline" 
            className="flex-1 h-11" 
            onClick={limpiarYSalir}
            disabled={isUploading}
          >
            <X className="w-4 h-4 mr-2" /> Cancelar
          </Button>
          
          <Button 
            className="flex-1 h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-md"
            onClick={enviarInventario}
            disabled={datosPrevia.length === 0 || isUploading}
          >
            {isUploading ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</>
            ) : (
              <><Check className="w-4 h-4 mr-2" /> Confirmar Carga</>
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BulkImportSheet;