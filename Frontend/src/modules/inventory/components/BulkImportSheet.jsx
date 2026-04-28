import React, { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Check, X, AlertTriangle, Loader2, Table as TableIcon, PlusCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

// 🔥 Solo usamos tu servicio principal que sabemos que funciona 100%
import { inventoryService } from '../services/inventoryService';

const BulkImportSheet = ({ isOpen, setIsOpen, categorias, sedes, onImportSuccess }) => {
  const { toast } = useToast();
  const [datosPrevia, setDatosPrevia] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [nombreArchivo, setNombreArchivo] = useState("");

  const [catActivos, setCatActivos] = useState({ sedes: [], categorias: [] });
  const [faltantes, setFaltantes] = useState({ sedes: [], categorias: [] });
  const [isResolviendo, setIsResolviendo] = useState(false);

  // Al abrir el modal, tomamos la data fresca y segura de InventoryView
  useEffect(() => {
    if (isOpen) {
      setCatActivos({ sedes: sedes || [], categorias: categorias || [] });
      setDatosPrevia([]);
      setFaltantes({ sedes: [], categorias: [] });
      setNombreArchivo("");
    }
  }, [isOpen, sedes, categorias]);

  const validarConCatalogos = (datos, catalogosSeguros) => {
    const nombresSedesExcel = [...new Set(datos.map(d => typeof d.sedeNombre === 'string' ? d.sedeNombre.trim() : d.sedeNombre).filter(Boolean))];
    const nombresCatsExcel = [...new Set(datos.map(d => typeof d.categoriaNombre === 'string' ? d.categoriaNombre.trim() : d.categoriaNombre).filter(Boolean))];

    const sedesDB = catalogosSeguros.sedes || [];
    const categoriasDB = catalogosSeguros.categorias || [];

    const sedesFantasma = nombresSedesExcel.filter(nombreExcel => 
      !sedesDB.find(s => s.nombre.trim().toLowerCase() === nombreExcel.toLowerCase())
    );
    const catsFantasma = nombresCatsExcel.filter(nombreExcel => 
      !categoriasDB.find(c => c.nombre.trim().toLowerCase() === nombreExcel.toLowerCase())
    );

    setFaltantes({ sedes: sedesFantasma, categorias: catsFantasma });
  };

  const manejarArchivo = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setNombreArchivo(file.name);
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const bstr = event.target.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const ws = wb.Sheets[wb.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(ws);
        
        const formateados = data.map(fila => ({
          nombre: fila['ARTÍCULO'] || fila.ARTÍCULO || fila.Nombre || fila.nombre || '',
          codigo: fila['CÓDIGO/SERIE'] || fila.Codigo || fila.codigo || '',
          serie: fila.Serie || fila.serie || '',
          cantidad: fila['STOCK'] || fila.STOCK || fila.Cantidad || fila.cantidad || 0,
          sedeNombre: fila['UBICACIÓN'] || fila.UBICACIÓN || fila.Sede || fila.sede || '', 
          categoriaNombre: fila['CATEGORÍA'] || fila.CATEGORÍA || fila.Categoria || fila.categoria || ''
        }));

        setDatosPrevia(formateados);
        validarConCatalogos(formateados, catActivos); 
      } catch (err) {
        toast({ title: "Error", description: "No se pudo procesar el Excel.", variant: "destructive" });
      }
    };
    reader.readAsBinaryString(file);
  };

  const resolverFaltantes = async () => {
    setIsResolviendo(true);
    try {
      // Mandamos a crear usando inventoryService (Asegúrate de que este endpoint exista en tu React)
      for (const catNombre of faltantes.categorias) {
        await inventoryService.crearCategoria?.({ nombre: catNombre, prefijo: catNombre.substring(0,3) });
      }
      
      // Actualizamos los catálogos volviéndolos a pedir
      const [nuevasSedes, nuevasCats] = await Promise.all([
        inventoryService.getSedes(), 
        inventoryService.getCategorias()
      ]);
      
      setCatActivos({ sedes: nuevasSedes, categorias: nuevasCats });
      validarConCatalogos(datosPrevia, { sedes: nuevasSedes, categorias: nuevasCats });

      toast({ title: "¡Registros creados!", description: "Ya puedes confirmar la carga." });
    } catch (error) {
      toast({ title: "Aviso", description: "Algunos registros no se pudieron autocompletar. Revisa tu backend.", variant: "destructive" });
    } finally {
      setIsResolviendo(false);
    }
  };

  const enviarInventario = async () => {
    setIsUploading(true);
    try {
      // Le pasamos los catálogos frescos al servicio
      const itemsListos = await inventoryService.prepararCargaMasiva(datosPrevia, catActivos);
      await inventoryService.importarMasivo(itemsListos);
      
      toast({ title: "¡Carga Exitosa!", description: `Equipos importados correctamente.` });
      limpiarYSalir();
      if (onImportSuccess) onImportSuccess();
    } catch (error) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsUploading(false);
    }
  };

  const limpiarYSalir = () => {
    setDatosPrevia([]);
    setNombreArchivo("");
    setFaltantes({ sedes: [], categorias: [] });
    setIsOpen(false);
  };

  const hayConflictos = faltantes.sedes.length > 0 || faltantes.categorias.length > 0;

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto bg-slate-50 border-l border-zinc-200 p-0 flex flex-col">
        
        <div className="bg-white p-6 border-b border-zinc-200 sticky top-0 z-10 shadow-sm">
          <SheetHeader>
            <SheetTitle className="text-2xl font-bold flex items-center gap-2">
              <FileSpreadsheet className="w-6 h-6 text-green-600" /> Carga Masiva
            </SheetTitle>
            <SheetDescription>Sube un Excel para alimentar el inventario.</SheetDescription>
          </SheetHeader>
        </div>

        <div className="flex-1 p-6 space-y-6">
          <div className="relative group border-2 border-dashed rounded-xl p-8 bg-white hover:border-blue-400 flex flex-col items-center">
             <div className={`p-3 rounded-full ${datosPrevia.length > 0 ? 'bg-green-100' : 'bg-zinc-100'}`}>
               <Upload className={`w-6 h-6 ${datosPrevia.length > 0 ? 'text-green-600' : 'text-zinc-400'}`} />
             </div>
             <div className="text-center mt-3">
               <p className="text-sm font-semibold">{nombreArchivo || "Seleccionar archivo Excel"}</p>
               <p className="text-xs text-zinc-500 mt-1">Soporta .xlsx, .xls y .csv</p>
             </div>
             <input type="file" accept=".xlsx, .xls, .csv" onChange={manejarArchivo} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
          </div>

          {hayConflictos && (
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-amber-900">Nuevos registros detectados</p>
                  <p className="text-xs text-amber-700">El Excel menciona datos que no existen en el sistema. ¿Deseas crearlos ahora?</p>
                </div>
              </div>
              <ul className="text-xs text-amber-800 list-disc pl-8 font-medium">
                {faltantes.sedes.map(s => <li key={s}>Sede: <span className="underline">{s}</span></li>)}
                {faltantes.categorias.map(c => <li key={c}>Categoría: <span className="underline">{c}</span></li>)}
              </ul>
              <div className="flex gap-2 pt-2">
                <Button variant="outline" className="h-8 text-xs bg-white text-amber-700 border-amber-300" onClick={limpiarYSalir}>No, cancelar</Button>
                <Button className="h-8 text-xs bg-amber-600 hover:bg-amber-700 text-white" onClick={resolverFaltantes} disabled={isResolviendo}>
                  {isResolviendo ? <Loader2 className="w-3 h-3 mr-2 animate-spin" /> : <PlusCircle className="w-3 h-3 mr-2" />}
                  Sí, crear y continuar
                </Button>
              </div>
            </div>
          )}

          {datosPrevia.length > 0 && !hayConflictos && (
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-green-600 uppercase flex items-center gap-2">
                <Check className="w-4 h-4" /> Datos validados y listos
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
                        <tr key={idx} className="hover:bg-zinc-50/50">
                          <td className="px-3 py-2 font-medium text-zinc-900">{item.nombre}</td>
                          <td className="px-3 py-2 text-zinc-500 italic">{item.sedeNombre}</td>
                          <td className="px-3 py-2 text-center text-zinc-700">{item.cantidad}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 bg-white border-t border-zinc-200 flex gap-3 sticky bottom-0">
          <Button variant="outline" className="flex-1" onClick={limpiarYSalir} disabled={isUploading}>Cancelar</Button>
          <Button 
            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={enviarInventario}
            disabled={datosPrevia.length === 0 || hayConflictos || isUploading}
          >
            {isUploading ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</> : <><Check className="w-4 h-4 mr-2" /> Confirmar Carga</>}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default BulkImportSheet;