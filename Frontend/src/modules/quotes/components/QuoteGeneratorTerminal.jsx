import React, { useState, useEffect } from 'react';
import { FileSignature, ShoppingCart, Tag, Trash2, CheckCircle, DollarSign, ScanBarcode, Building2, Calculator, Loader2 } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

import { quotesService } from '../services/quotesService'; 
import { inventoryService } from '../../inventory/services/inventoryService'; 
import { clientService } from '../../clients/services/clientService'; 

const QuoteGeneratorTerminal = () => {
  const { toast } = useToast();
  
  // 1. Estados de la Cabecera
  const [empresas, setEmpresas] = useState([]);
  const [clienteId, setClienteId] = useState("");
  const [numeroOrden, setNumeroOrden] = useState(''); // El ID de Trilogo
  const [notas, setNotas] = useState('');

  // 2. Estados del Inventario y Carrito
  const [codigoEscaneado, setCodigoEscaneado] = useState('');
  const [inventario, setInventario] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 3. Cargar inventario y clientes
  useEffect(() => {
    const cargarDatos = async () => {
      try {
        const [invData, empData] = await Promise.all([
          inventoryService.getAll({}),
          clientService.obtenerEmpresas()
        ]);
        
        // Solo traemos lo que tenga stock > 0 para poder cotizarlo
        setInventario(invData.filter(item => item.stock > 0));
        setEmpresas(empData);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        toast({ title: "Error", description: "No se pudieron cargar los catálogos.", variant: "destructive" });
      }
    };
    cargarDatos();
  }, [toast]);

  // --- FUNCIONES DEL CARRITO ---
  const procesarBusquedaManual = (e) => {
    if (e && e.type === 'keydown' && e.key !== 'Enter') return;
    if (e) e.preventDefault(); 

    const codigoBuscado = String(codigoEscaneado).trim().toLowerCase();
    if (!codigoBuscado) return;

    const producto = inventario.find(i => {
      const codigoAComparar = String(i.codigo || i.codigo_barras || '').trim().toLowerCase();
      return codigoAComparar === codigoBuscado;
    });

    if (producto) {
      procesarIngresoAlCarrito(producto);
    } else {
      toast({ title: "No Encontrado", description: `El repuesto "${codigoEscaneado}" no existe o no tiene stock.`, variant: "destructive" });
    }
    setCodigoEscaneado('');
  };

  const procesarIngresoAlCarrito = (producto) => {
    setCarrito(prev => {
      const itemExistente = prev.find(item => item.itemId === producto.id);
      
      if (itemExistente) {
        if (itemExistente.cantidad < producto.stock) {
          return prev.map(item => 
            item.itemId === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
          );
        } else {
          toast({ title: "Stock Insuficiente", description: `Solo tienes ${producto.stock} en bodega.`, variant: "destructive" });
          return prev;
        }
      } else {
        return [...prev, {
          itemId: producto.id,
          nombre: producto.nombre,
          codigo: producto.codigo || producto.codigo_barras,
          stockMaximo: producto.stock,
          cantidad: 1,
          precioUnitario: 0
        }];
      }
    });
  };

  const actualizarItemCarrito = (itemId, campo, valor) => {
    setCarrito(carrito.map(item => {
      if (item.itemId === itemId) {
        if (campo === 'cantidad' && valor > item.stockMaximo) {
          toast({ title: "Stock Máximo", description: `Solo puedes cotizar hasta ${item.stockMaximo} unidades.`, variant: "destructive" });
          return { ...item, cantidad: item.stockMaximo };
        }
        return { ...item, [campo]: valor };
      }
      return item;
    }));
  };

  const eliminarDelCarrito = (itemId) => {
    setCarrito(carrito.filter(item => item.itemId !== itemId));
  };

  const calcularTotalEstimado = carrito.reduce((total, item) => {
    return total + ((Number(item.cantidad) || 0) * (Number(item.precioUnitario) || 0));
  }, 0);

  // --- ENVÍO AL BACKEND ---
  const procesarCotizacion = async () => {
    if (!clienteId) return toast({ title: "Error", description: "Selecciona el cliente.", variant: "destructive" });
    if (carrito.length === 0) return toast({ title: "Error", description: "Agrega al menos un repuesto.", variant: "destructive" });

    setIsSubmitting(true);
    
    try {
      const payload = {
        cliente_id: clienteId,
        numero_orden: numeroOrden,
        notas: notas,
        repuestos: carrito.map(item => ({
          item_id: item.itemId,
          cantidad: Number(item.cantidad),
          precio_unitario: Number(item.precioUnitario)
        }))
      };

      await quotesService.generarCotizacion(payload);
      toast({ title: "¡Proforma Creada!", description: "La cotización está lista para revisión en el Historial." });
      
      // Limpiar terminal
      setClienteId(''); setNumeroOrden(''); setNotas(''); setCarrito([]);
    } catch (error) {
      console.error("Error al cotizar:", error);
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* === COLUMNA IZQUIERDA: DATOS === */}
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm h-fit space-y-4">
          <h3 className="font-semibold text-zinc-800 border-b pb-2 flex items-center gap-2">
            Datos de la Cotización
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase flex items-center gap-1 mb-1">
                <Building2 className="w-3 h-3"/> Empresa (Cliente) *
              </label>
              <Select value={clienteId} onValueChange={setClienteId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar empresa..." />
                </SelectTrigger>
                <SelectContent>
                  {empresas.map(emp => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.nombre_comercial}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase flex items-center gap-1 mb-1">
                <Tag className="w-3 h-3"/> Ref. Trilogo / PO Externa
              </label>
              <Input placeholder="Ej. ORDEN-998877" value={numeroOrden} onChange={(e) => setNumeroOrden(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase mb-1">Notas / Observaciones</label>
              <Input placeholder="Aclaraciones para el cliente..." value={notas} onChange={(e) => setNotas(e.target.value)} />
            </div>
          </div>
        </div>

        {/* === COLUMNA DERECHA: REPUESTOS === */}
        <div className="lg:col-span-2 space-y-4">
          
          <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex items-end gap-4">
            <div className="flex-1 bg-white p-5 rounded-xl border-2 border-blue-100 shadow-sm flex flex-col gap-2">
              <label className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                <ScanBarcode className="w-4 h-4" /> Buscar Repuesto
              </label>
              <div className="flex gap-2">
                <Input 
                  className="pl-4 h-14 text-xl font-mono border-zinc-300 focus:border-blue-500 transition-all shadow-inner bg-zinc-50 flex-1"
                  placeholder="Código del repuesto..."
                  value={codigoEscaneado}
                  onChange={(e) => setCodigoEscaneado(e.target.value)}
                  onKeyDown={procesarBusquedaManual}
                />
                <Button type="button" onClick={procesarBusquedaManual} className="h-14 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold">
                  Agregar
                </Button>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 text-zinc-500 border-b">
                  <tr>
                    <th className="px-4 py-3">Repuesto</th>
                    <th className="px-4 py-3 w-24">Cant.</th>
                    <th className="px-4 py-3 w-32">P. Unitario</th>
                    <th className="px-4 py-3 w-24 text-right">Subtotal</th>
                    <th className="px-4 py-3 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.length === 0 ? (
                    <tr><td colSpan="5" className="text-center py-8 text-zinc-400">No hay repuestos agregados a la cotización.</td></tr>
                  ) : (
                    carrito.map((item) => (
                      <tr key={item.itemId} className="border-b last:border-0 hover:bg-zinc-50/50">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-zinc-900">{item.nombre}</p>
                          <p className="text-xs text-zinc-500">{item.codigo}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Input 
                            type="number" min="1" max={item.stockMaximo} 
                            value={item.cantidad || ''} 
                            onChange={(e) => actualizarItemCarrito(item.itemId, 'cantidad', Number(e.target.value))} 
                            className="h-8 w-full text-center"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative">
                            <DollarSign className="w-3 h-3 absolute left-2 top-2.5 text-zinc-400" />
                            <Input type="number" min="0" step="0.01" value={item.precioUnitario || ''} 
                            onChange={(e) => actualizarItemCarrito(item.itemId, 'precioUnitario', Number(e.target.value))} className="h-8 w-full pl-6" />
                          </div>
                        </td>
                        <td className="px-4 py-3 text-right font-mono font-medium text-zinc-900">
                          ${(item.cantidad * item.precioUnitario).toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Button variant="ghost" size="icon" onClick={() => eliminarDelCarrito(item.itemId)} className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="bg-zinc-900 text-white p-4 flex items-center justify-between rounded-b-xl">
              <div className="text-zinc-400 text-sm flex items-center gap-2">
                <Calculator className="w-4 h-4"/>
                Total Estimado: <span className="text-white font-mono text-xl font-bold ml-2">${calcularTotalEstimado.toFixed(2)}</span>
              </div>
              <Button 
                onClick={procesarCotizacion} 
                disabled={carrito.length === 0 || isSubmitting}
                className="bg-blue-600 hover:bg-blue-500 text-white h-11 px-6 shadow-lg shadow-blue-900/20"
              >
                {isSubmitting ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Guardando...</> : <><FileSignature className="w-5 h-5 mr-2" /> Generar Proforma</>}
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default QuoteGeneratorTerminal;