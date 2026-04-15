import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowRightLeft, ShieldCheck, ShoppingCart, ArrowDownToLine, ArrowUpFromLine, Wrench, X, History, ScanBarcode } from "lucide-react";

import ScannerInput from './ScannerInput';
import MovementActionModal from './MovementActionModal';
import { movementsService } from '../services/movementsService';

const ScannerTerminal = () => {
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [accionActiva, setAccionActiva] = useState('INGRESO');

  // Callback cuando el ScannerInput detecta algo exitosamente
  const handleItemDetected = (item) => {
    setSelectedItem(item);
  };

  const abrirModal = (tipo) => {
    setAccionActiva(tipo);
    setModalOpen(true);
  };

  const handleMovimientoExitoso = async () => {
    try {
      // Recargamos el "Súper Objeto" para ver el nuevo stock y el nuevo historial en pantalla
      const itemActualizado = await movementsService.buscarPorCodigo(selectedItem.codigo_barras);
      setSelectedItem(itemActualizado);
    } catch (e) {
      setSelectedItem(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      
      {/* PANEL IZQUIERDO: Escáner y Botones */}
      <div className="md:col-span-1 space-y-4">
        <Card className="border-2 border-blue-100 shadow-lg">
          <CardHeader className="bg-blue-50/50 pb-4">
            <CardTitle className="text-sm font-bold flex items-center justify-between">
              <span className="flex items-center gap-2"><ArrowRightLeft className="w-4 h-4 text-blue-600" /> ESCÁNER LÁSER</span>
              {selectedItem && (
                <Button variant="ghost" size="sm" className="h-6 text-zinc-500 hover:text-red-600 px-2" onClick={() => setSelectedItem(null)}>
                  <X className="w-4 h-4 mr-1" /> Limpiar
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-6 space-y-6">
            
            <ScannerInput onScanSuccess={handleItemDetected} disabled={modalOpen} />
            
            {selectedItem && (
              <div className="animate-in slide-in-from-bottom-2 space-y-4">
                <div className="p-4 bg-zinc-900 rounded-lg text-white">
                  <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">{selectedItem.categoria}</p>
                  <h3 className="font-bold text-lg leading-tight mt-1">{selectedItem.nombre}</h3>
                  <div className="flex justify-between items-center mt-3 pt-3 border-t border-zinc-700">
                    <span className="font-mono text-xs text-zinc-400">{selectedItem.codigo_barras}</span>
                    <Badge className="bg-blue-500 text-sm px-2">{selectedItem.stock} {selectedItem.unidad}</Badge>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Acciones Operativas</p>
                  <Button onClick={() => abrirModal('INGRESO')} className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold">
                    <ArrowDownToLine className="w-4 h-4 mr-2" /> 1. Ingresar a Bodega
                  </Button>
                  <Button onClick={() => abrirModal('BAJA')} className="w-full h-11 bg-rose-600 hover:bg-rose-700 text-white font-semibold">
                    <ArrowUpFromLine className="w-4 h-4 mr-2" /> 2. Dar de Baja (Descarte)
                  </Button>
                  <Button onClick={() => abrirModal('MANTENIMIENTO')} className="w-full h-11 bg-amber-500 hover:bg-amber-600 text-white font-semibold">
                    <Wrench className="w-4 h-4 mr-2" /> 3. Enviar a Taller
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* PANEL DERECHO: El ADN del Equipo */}
      <div className="md:col-span-2">
        {selectedItem ? (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            
            
            {/* Garantía Comercial (Diseño Corporativo Limpio) */}
            {selectedItem.ventaInfo ? (
              <Card className="shadow-sm border-zinc-200 bg-white">
                <CardHeader className="pb-3 border-b border-zinc-100 flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold text-zinc-800 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-blue-600" />
                    Póliza de Garantía Comercial
                  </CardTitle>
                  {selectedItem.ventaInfo.diasRestantes > 0 ? (
                    <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50 shadow-sm">
                      Activa
                    </Badge>
                  ) : (
                    <Badge className="bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-50 shadow-sm">
                      Expirada
                    </Badge>
                  )}
                </CardHeader>
                <CardContent className="pt-5 grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Info del Cliente */}
                  <div className="space-y-1">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                      <ShoppingCart className="w-3.5 h-3.5" /> Adquirido Por
                    </p>
                    <p className="font-semibold text-zinc-900">{selectedItem.ventaInfo.cliente}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-zinc-500 font-mono bg-zinc-100 px-2 py-0.5 rounded border border-zinc-200">
                        {selectedItem.ventaInfo.comprobante || 'S/N'}
                      </span>
                      <span className="text-xs text-zinc-400">
                        {new Date(selectedItem.ventaInfo.fechaVenta).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Info de Tiempos */}
                  <div className="space-y-1 sm:border-l sm:border-zinc-100 sm:pl-6">
                    <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">
                      Vigencia Restante
                    </p>
                    <div className="flex items-baseline gap-1.5">
                      <span className={`text-3xl font-black leading-none ${selectedItem.ventaInfo.diasRestantes > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {selectedItem.ventaInfo.diasRestantes}
                      </span>
                      <span className="text-sm font-medium text-zinc-500">
                        / {selectedItem.ventaInfo.garantiaDias} días
                      </span>
                    </div>
                    {/* Barra de progreso visual sutil */}
                    <div className="w-full h-1.5 bg-zinc-100 rounded-full mt-3 overflow-hidden">
                       <div 
                         className={`h-full rounded-full transition-all duration-1000 ${selectedItem.ventaInfo.diasRestantes > 0 ? 'bg-emerald-500' : 'bg-rose-500'}`} 
                         style={{ width: `${Math.min(100, Math.max(0, (selectedItem.ventaInfo.diasRestantes / selectedItem.ventaInfo.garantiaDias) * 100))}%` }}
                       />
                    </div>
                  </div>

                </CardContent>
              </Card>
            ) : (
              <div className="bg-white p-4 rounded-xl border border-zinc-200 text-center text-zinc-500 shadow-sm">
                <p className="text-sm font-medium">Equipo Interno - Sin registro de venta a cliente.</p>
              </div>
            )}

            {/* Historia de Vida Específica */}
            <Card className="shadow-sm border-zinc-200">
              <CardHeader className="pb-2 bg-zinc-50/50 border-b border-zinc-100">
                <CardTitle className="text-sm font-bold text-zinc-500 uppercase tracking-wider flex items-center gap-2">
                  <History className="w-4 h-4" /> Historial de este Equipo
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4">
                <ul className="divide-y divide-zinc-100 max-h-[300px] overflow-y-auto pr-2">
                  {selectedItem.historial?.length > 0 ? selectedItem.historial.map((h, idx) => (
                    <li key={idx} className="py-3 flex items-start gap-3">
                      <div className={`mt-0.5 w-2 h-2 rounded-full ${h.tipo === 'ENTRADA' ? 'bg-emerald-500' : 'bg-rose-500'}`} />
                      <div>
                        <p className="text-sm text-zinc-900 font-medium">{h.descripcion}</p>
                        <p className="text-xs text-zinc-500 mt-1">{new Date(h.fecha).toLocaleString()}</p>
                      </div>
                    </li>
                  )) : (
                    <p className="text-sm text-zinc-500 text-center py-4">No hay movimientos registrados.</p>
                  )}
                </ul>
              </CardContent>
            </Card>

          </div>
        ) : (
          <div className="h-full border-2 border-dashed border-zinc-200 rounded-xl flex flex-col items-center justify-center p-12 text-zinc-400 bg-zinc-50/50">
            <ScanBarcode className="w-16 h-16 mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-zinc-600">Esperando escaneo...</h3>
            <p className="text-sm text-center max-w-sm mt-2">Pistolee un código de barras para ver el estado, garantía y opciones operativas del equipo.</p>
          </div>
        )}
      </div>

      <MovementActionModal 
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        tipoAccion={accionActiva}
        equipo={selectedItem}
        onSuccess={handleMovimientoExitoso}
      />
    </div>
  );
};

export default ScannerTerminal;