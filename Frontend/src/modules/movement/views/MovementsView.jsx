import React, { useState, useEffect } from 'react';
import { movementsService } from '../services/movementsService';
import ScannerInput from '../components/ScannerInput';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Loader2, Package, ArrowRightLeft } from "lucide-react";


const MovementsView = () => {
  const [historial, setHistorial] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [movData, setMovData] = useState({ tipo: 'SALIDA', cantidad: 1, destino: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 1. Cargar historial al inicio
  const loadHistorial = async () => {
    try {
      setLoading(true);
      const data = await movementsService.getAll();
      setHistorial(data);
    } catch (err) {
      toast.error("Error al cargar historial");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadHistorial(); }, []);

  // 2. ¿Qué pasa cuando el láser detecta algo?
  const handleItemDetected = (item) => {
    setSelectedItem(item);
    toast.info(`Equipo detectado: ${item.nombre}`, {
      description: `Stock actual: ${item.cantidad_stock} ${item.unidad_medida}`,
    });
    // Aquí podrías abrir automáticamente un modal o scrollar al formulario
  };

  const handleRegistrarMovimiento = async () => {
    // Validaciones rápidas de UX
    if (!movData.destino.trim()) {
      return toast.error("Debes especificar el origen o destino");
    }
    if (movData.tipo === 'SALIDA' && movData.cantidad > selectedItem.cantidad_stock) {
      return toast.error(`¡Stock insuficiente! Solo tienes ${selectedItem.cantidad_stock} en bodega.`);
    }

    setIsSubmitting(true);
    try {
      // Llamamos a tu Service (que llama a tu Backend)
      await movementsService.registrar({
        itemId: selectedItem.id,
        tipoMovimiento: movData.tipo,
        cantidad: Number(movData.cantidad),
        destinoNombre: movData.destino
      });

      toast.success(`${movData.tipo} registrada con éxito`);
      
      // Limpiamos la pantalla para el siguiente escaneo
      setSelectedItem(null);
      setMovData({ tipo: 'SALIDA', cantidad: 1, destino: '' });
      
      // ¡Recargamos la tabla de la derecha para ver la magia!
      loadHistorial(); 
    } catch (error) {
      toast.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto p-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* PANEL DE CONTROL (IZQUIERDA) */}
        <div className="md:col-span-1 space-y-4">
          <Card className="border-2 border-blue-100 shadow-lg">
            <CardHeader className="bg-blue-50/50">
              <CardTitle className="text-sm font-bold flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-blue-600" />
                REGISTRO RÁPIDO
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <p className="text-xs text-zinc-500 mb-4 uppercase font-bold tracking-wider">
                Paso 1: Escanee el Activo
              </p>
              {/* Aquí usamos tu Scanner que ahora sí recibirá el item */}
              <ScannerInput onScanSuccess={handleItemDetected} />
              
              {selectedItem && (
                <div className="mt-6 p-4 bg-zinc-900 rounded-lg text-white animate-in fade-in slide-in-from-bottom-2">
                  <p className="text-[10px] text-zinc-400 uppercase font-bold">Equipo Seleccionado</p>
                  <h3 className="font-bold truncate">{selectedItem.nombre}</h3>
                  <div className="flex justify-between mt-2 text-xs">
                    <span>S/N: {selectedItem.serie_fabricante || 'N/A'}</span>
                    <Badge className="bg-blue-500">{selectedItem.cantidad_stock} en stock</Badge>
                  </div>
                  {/* FORMULARIO DINÁMICO */}
                  <div className="mt-5 space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      {/* Selector de Acción */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Acción a realizar</label>
                        <Select value={movData.tipo} onValueChange={(val) => setMovData({ ...movData, tipo: val })}>
                          <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white h-10">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="SALIDA" className="font-semibold text-red-600">Sacar de Bodega</SelectItem>
                            <SelectItem value="INGRESO" className="font-semibold text-emerald-600">Ingresar a Bodega</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {/* Input de Cantidad */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">Cantidad</label>
                        <Input
                          type="number"
                          min="1"
                          className="bg-zinc-800 border-zinc-700 text-white h-10"
                          value={movData.cantidad}
                          onChange={(e) => setMovData({ ...movData, cantidad: e.target.value })}
                        />
                      </div>
                    </div>

                    {/* Input Dinámico de Destino/Origen */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
                        {movData.tipo === 'SALIDA' ? '¿A qué Sede o Cliente va?' : '¿De qué Proveedor o Sede viene?'}
                      </label>
                      <Input
                        placeholder={movData.tipo === 'SALIDA' ? "Ej. Sede Norte / Instalación..." : "Ej. Compra / Devolución Técnico..."}
                        className="bg-zinc-800 border-zinc-700 text-white h-10 placeholder:text-zinc-600"
                        value={movData.destino}
                        onChange={(e) => setMovData({ ...movData, destino: e.target.value })}
                      />
                    </div>

                    {/* Botones de Acción */}
                    <div className="pt-2 space-y-2">
                      <Button 
                        className={`w-full h-11 font-bold ${
                          movData.tipo === 'SALIDA' 
                            ? 'bg-red-600 hover:bg-red-700 text-white' 
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                        onClick={handleRegistrarMovimiento}
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? <Loader2 className="animate-spin w-5 h-5 mr-2" /> : null}
                        Confirmar {movData.tipo}
                      </Button>
                      
                      <Button 
                        variant="ghost" 
                        className="w-full text-zinc-400 hover:text-white hover:bg-zinc-800 h-9" 
                        onClick={() => setSelectedItem(null)}
                      >
                        Cancelar Escaneo
                      </Button>
                    </div>
                  </div>
                  <Button className="w-full mt-4 bg-white text-zinc-900 hover:bg-zinc-200">
                    Continuar Despacho
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* TABLA DE HISTORIAL (DERECHA) */}
        <div className="md:col-span-2">
          <Card className="shadow-md">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-lg">Trazabilidad Reciente</CardTitle>
              <Badge variant="outline">{historial.length} registros</Badge>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Fecha</TableHead>
                      <TableHead>Acción</TableHead>
                      <TableHead>Artículo</TableHead>
                      <TableHead>Ubicación / Destino</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {historial.map((h) => (
                      <TableRow key={h.id} className="text-xs">
                        <TableCell className="text-zinc-500">
                          {new Date(h.fecha_registro).toLocaleDateString()}
                        </TableCell>
                        <TableCell>
                          <Badge className={h.tipo_accion === 'INGRESO' ? 'bg-emerald-500' : 'bg-red-500'}>
                            {h.tipo_accion}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{h.inventario?.nombre}</TableCell>
                        <TableCell className="text-zinc-600 italic">{h.ubicacion_actual || 'Bodega Central'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MovementsView;