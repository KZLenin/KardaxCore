import React, { useState, useEffect } from 'react';
import { Loader2, Activity, History, PenTool, ArrowRightLeft } from 'lucide-react';
import { inventoryService } from '../services/inventoryService';

const ItemTimeline = ({ itemId }) => {
  const [historial, setHistorial] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!itemId) return;

    const cargarHistorial = async () => {
      setLoading(true);
      try {
        const data = await inventoryService.getHistorial(itemId);
        setHistorial(data);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    cargarHistorial();
  }, [itemId]);

  // Función para darle un ícono y color bonito dependiendo de qué pasó
  const getIcono = (tipo) => {
    switch (tipo) {
      case 'INGRESO_MANTENIMIENTO': 
        return <PenTool className="w-4 h-4 text-amber-600" />;
      case 'SALIDA_MANTENIMIENTO': 
        return <Activity className="w-4 h-4 text-emerald-600" />;
      case 'MOVIMIENTO': 
        return <ArrowRightLeft className="w-4 h-4 text-blue-600" />;
      default: 
        return <History className="w-4 h-4 text-zinc-500" />;
    }
  };

  if (loading) return <div className="flex justify-center p-6"><Loader2 className="w-6 h-6 animate-spin text-zinc-400" /></div>;
  if (error) return <div className="p-4 text-sm text-red-500 bg-red-50 rounded-md">Error cargando historial</div>;
  if (historial.length === 0) return <div className="text-sm text-zinc-500 italic p-4 text-center border rounded-md bg-zinc-50">No hay registros para este equipo aún.</div>;

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-200 before:to-transparent">
      {historial.map((evento) => (
        <div key={evento.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
          
          {/* El puntito de la línea de tiempo */}
          <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white bg-zinc-100 text-zinc-500 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
            {getIcono(evento.tipo_accion)}
          </div>
          
          {/* La tarjeta de información */}
          <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-lg border border-zinc-200 bg-white shadow-sm">
            <div className="flex justify-between items-start mb-1">
              <span className="font-bold text-zinc-900 text-sm">{evento.tipo_accion.replace(/_/g, ' ')}</span>
              <span className="text-[10px] font-mono font-medium text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-full">{evento.fecha_formateada}</span>
            </div>
            <p className="text-sm text-zinc-600 mt-2">{evento.descripcion}</p>
            
            {evento.usuario_responsable && (
              <p className="text-xs text-zinc-400 mt-3 pt-2 border-t border-zinc-100">
                Usuario: <span className="font-medium text-zinc-600">{evento.usuario_responsable}</span>
              </p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ItemTimeline;