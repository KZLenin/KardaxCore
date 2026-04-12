import React, { useState, useEffect } from 'react';
import { ShoppingCart, User, FileText, Tag, Trash2, CheckCircle, ShieldCheck, DollarSign, ScanBarcode } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

import { salesService } from '../services/salesService'; // Ajusta la ruta
import { inventoryService } from '../../inventory/services/inventoryService'; // Ajusta la ruta

const B2BSalesTerminal = () => {
  const { toast } = useToast();
  
  // 1. Estados de la Cabecera Comercial
  const [clienteNombre, setClienteNombre] = useState('');
  const [numeroComprobante, setNumeroComprobante] = useState('');
  const [poCliente, setPoCliente] = useState('');
  const [notas, setNotas] = useState('');

  // 2. Estados del Inventario y Carrito
  const [codigoEscaneado, setCodigoEscaneado] = useState('');
  const [inventario, setInventario] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Cargar inventario al montar el componente
  useEffect(() => {
    const cargarInventario = async () => {
      try {
        const data = await inventoryService.getAll({});
        // Filtramos solo los que tienen stock > 0
        setInventario(data.filter(item => item.stock > 0));
      } catch (error) {
        // 🔥 FIX ESLINT: Ahora usamos la variable 'error' imprimiéndola en consola
        console.error("Error al cargar inventario:", error);
        toast({ title: "Error", description: "No se pudo cargar el inventario", variant: "destructive" });
      }
    };
    cargarInventario();
  }, []);

  // --- FUNCIONES DEL ESCÁNER Y CARRITO (ACTUALIZADAS Y BLINDADAS) ---
 const procesarBusquedaManual = (e) => {
    if (e && e.type === 'keydown' && e.key !== 'Enter') return;
    if (e) e.preventDefault(); 

    const codigoRaw = codigoEscaneado || (e.currentTarget ? e.currentTarget.value : '');
    const codigoBuscado = String(codigoRaw).trim().toLowerCase();

    if (!codigoBuscado) return;

    // 🔥 FIX: Buscamos por 'codigo' o por 'codigo_barras' por si acaso
    const producto = inventario.find(i => {
      const codigoAComparar = String(i.codigo || i.codigo_barras || '').trim().toLowerCase();
      return codigoAComparar === codigoBuscado;
    });

    if (producto) {
      procesarIngresoAlCarrito(producto);
    } else {
      toast({ title: "No Encontrado", description: `El código "${codigoRaw}" no existe o no tiene stock.`, variant: "destructive" });
    }
    
    setCodigoEscaneado('');
  };

  const procesarIngresoAlCarrito = (producto) => {
    // 🔥 FIX ESTADO CONGELADO: Usamos prevCarrito para reaccionar al instante
    setCarrito(prevCarrito => {
      const itemExistente = prevCarrito.find(item => item.itemId === producto.id);

      if (itemExistente) {
        // Si ya está, le sumamos 1
        if (itemExistente.cantidad < producto.stock) {
          toast({ title: "Suma rápida", description: `+1 ${producto.nombre} añadido.` });
          return prevCarrito.map(item => 
            item.itemId === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
          );
        } else {
          toast({ title: "Stock Insuficiente", description: `Solo tienes ${producto.stock} en bodega.`, variant: "destructive" });
          return prevCarrito;
        }
      } else {
        // Si es nuevo, lo metemos al carrito
        toast({ title: "Escaneado", description: `${producto.nombre} listo para vender.` });
        return [...prevCarrito, {
          itemId: producto.id,
          nombre: producto.nombre,
          codigo: producto.codigo,
          stockMaximo: producto.stock,
          cantidad: 1,
          precioUnitario: 0,
          garantiaDias: 0
        }];
      }
    });
  };

  const actualizarItemCarrito = (itemId, campo, valor) => {
    setCarrito(carrito.map(item => {
      if (item.itemId === itemId) {
        if (campo === 'cantidad' && valor > item.stockMaximo) {
          toast({ title: "Stock Insuficiente", description: `Solo hay ${item.stockMaximo} disponibles.`, variant: "destructive" });
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

  const calcularTotal = () => {
    return carrito.reduce((total, item) => total + (item.cantidad * item.precioUnitario), 0);
  };

  // --- ENVÍO AL BACKEND ---
 // --- ENVÍO AL BACKEND (MODO DIAGNÓSTICO) ---
  const procesarVenta = async () => {
    console.log("🚀 1. Botón clickeado. Iniciando validaciones...");

    // 🚨 Validaciones
    if (!clienteNombre) {
      console.warn("⚠️ 2. Cancelado: Falta el nombre del cliente.");
      return toast({ title: "Error", description: "El nombre del cliente es obligatorio.", variant: "destructive" });
    }
    
    if (carrito.length === 0) {
      console.warn("⚠️ 2. Cancelado: El carrito está vacío.");
      return toast({ title: "Error", description: "El carrito está vacío.", variant: "destructive" });
    }

    const preciosEnCero = carrito.some(item => item.precioUnitario <= 0);
    if (preciosEnCero) {
      console.warn("⚠️ 2. Cancelado: Hay equipos con precio $0.");
      return toast({ title: "Error", description: "Hay equipos con precio $0 en el carrito.", variant: "destructive" });
    }

    console.log("✅ 3. Validaciones aprobadas. Preparando el paquete (payload)...");
    setIsSubmitting(true);
    
    try {
      const payload = {
        clienteNombre,
        numeroComprobante,
        poCliente,
        notasAdicionales: notas,
        items: carrito.map(item => ({
          itemId: item.itemId,
          cantidad: Number(item.cantidad),
          precioUnitario: Number(item.precioUnitario),
          garantiaDias: Number(item.garantiaDias)
        }))
      };

      console.log("📦 4. Enviando este JSON al Backend:", payload);

      // Aquí ocurre la magia de red
      const respuesta = await salesService.registrarVenta(payload);
      
      console.log("🎉 5. ¡Backend respondió con ÉXITO!", respuesta);
      toast({ title: "¡Venta Exitosa!", description: "Stock descontado e historial guardado." });
      
      // Limpiar terminal
      setClienteNombre(''); setNumeroComprobante(''); setPoCliente(''); setNotas(''); setCarrito([]);
      
    } catch (error) {
      console.error("🚨 5. El Backend rechazó la petición. Motivo:", error);
      toast({ title: "Error en Venta", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
      console.log("🛑 6. Fin de la ejecución.");
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
          <ShoppingCart className="w-6 h-6 text-blue-600" /> Terminal de Ventas B2B
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* === COLUMNA IZQUIERDA: DATOS DEL CLIENTE === */}
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm h-fit space-y-4">
          <h3 className="font-semibold text-zinc-800 border-b pb-2">Datos Comerciales</h3>
          
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase flex items-center gap-1 mb-1"><User className="w-3 h-3"/> Cliente (Gimnasio / Empresa) *</label>
              <Input placeholder="Ej. SmartFit Condado" value={clienteNombre} onChange={(e) => setClienteNombre(e.target.value)} />
            </div>
            
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase flex items-center gap-1 mb-1"><FileText className="w-3 h-3"/> Nro. Factura / Recibo</label>
              <Input placeholder="Ej. FAC-00123" value={numeroComprobante} onChange={(e) => setNumeroComprobante(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase flex items-center gap-1 mb-1"><Tag className="w-3 h-3"/> PO del Cliente</label>
              <Input placeholder="Ej. PO-998877" value={poCliente} onChange={(e) => setPoCliente(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase mb-1">Notas Internas</label>
              <Input placeholder="Observaciones de entrega..." value={notas} onChange={(e) => setNotas(e.target.value)} />
            </div>
          </div>
        </div>

        {/* === COLUMNA DERECHA: EL CARRITO === */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Buscador para agregar al carrito */}
          <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex items-end gap-4">
            <div className="flex-1">
              {/* 🔥 EL NUEVO ESCÁNER CON BOTÓN AGREGAR 🔥 */}
              <div className="bg-white p-5 rounded-xl border-2 border-blue-100 shadow-sm flex flex-col gap-2">
                <label className="text-xs font-bold text-blue-600 uppercase tracking-wider flex items-center gap-2">
                  <ScanBarcode className="w-4 h-4" /> Escanear o Buscar Equipo
                </label>
                <div className="flex gap-2">
                  <Input 
                    autoFocus 
                    className="pl-4 h-14 text-xl font-mono border-zinc-300 focus:border-blue-500 focus:ring-blue-500 transition-all shadow-inner bg-zinc-50 flex-1"
                    placeholder="Código de barras..."
                    value={codigoEscaneado}
                    onChange={(e) => setCodigoEscaneado(e.target.value)}
                    onKeyDown={procesarBusquedaManual}
                  />
                  <Button 
                    type="button" 
                    onClick={procesarBusquedaManual}
                    className="h-14 px-6 bg-blue-600 hover:bg-blue-700 text-white font-bold"
                  >
                    Agregar
                  </Button>
                </div>
                <p className="text-[10px] text-zinc-400 mt-1">Dispara la pistola, presiona Enter, o haz clic en Agregar.</p>
              </div>
            </div>
          </div>

          {/* Tabla del Carrito */}
          <div className="bg-white rounded-xl border border-zinc-200 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-zinc-50 text-zinc-500 border-b">
                  <tr>
                    <th className="px-4 py-3">Equipo</th>
                    <th className="px-4 py-3 w-24">Cant.</th>
                    <th className="px-4 py-3 w-32">Precio Unit. ($)</th>
                    <th className="px-4 py-3 w-32">Garantía</th>
                    <th className="px-4 py-3 w-24 text-right">Subtotal</th>
                    <th className="px-4 py-3 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {carrito.length === 0 ? (
                    <tr><td colSpan="6" className="text-center py-8 text-zinc-400">El carrito está vacío. Busca un equipo arriba.</td></tr>
                  ) : (
                    carrito.map((item) => (
                      <tr key={item.itemId} className="border-b last:border-0 hover:bg-zinc-50/50">
                        <td className="px-4 py-3">
                          <p className="font-semibold text-zinc-900">{item.nombre}</p>
                          <p className="text-xs text-zinc-500">{item.codigo}</p>
                        </td>
                        <td className="px-4 py-3">
                          <Input type="number" min="1" max={item.stockMaximo} value={item.cantidad} onChange={(e) => actualizarItemCarrito(item.itemId, 'cantidad', Number(e.target.value))} className="h-8 w-full text-center" />
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative">
                            <DollarSign className="w-3 h-3 absolute left-2 top-2.5 text-zinc-400" />
                            <Input type="number" min="0" step="0.01" value={item.precioUnitario} onChange={(e) => actualizarItemCarrito(item.itemId, 'precioUnitario', Number(e.target.value))} className="h-8 w-full pl-6" />
                          </div>
                        </td>
                        <td className="px-4 py-3">
                          <div className="relative">
                            <ShieldCheck className="w-3 h-3 absolute left-2 top-2.5 text-zinc-400" />
                            <Input type="number" min="0" placeholder="Días" value={item.garantiaDias} onChange={(e) => actualizarItemCarrito(item.itemId, 'garantiaDias', Number(e.target.value))} className="h-8 w-full pl-6" />
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
            
            {/* FOOTER TOTALES */}
            <div className="bg-zinc-900 text-white p-4 flex items-center justify-between">
              <div className="text-zinc-400 text-sm">
                Total ítems: <span className="text-white font-bold">{carrito.length}</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-zinc-400 text-xs uppercase font-bold tracking-wider mb-1">Total a Cobrar</p>
                  <p className="text-2xl font-mono font-bold">${calcularTotal().toFixed(2)}</p>
                </div>
                <Button 
                  onClick={procesarVenta} 
                  disabled={carrito.length === 0 || isSubmitting}
                  className="bg-blue-600 hover:bg-blue-500 text-white h-12 px-6 shadow-lg shadow-blue-900/20"
                >
                  <CheckCircle className="w-5 h-5 mr-2" />
                  {isSubmitting ? 'Procesando...' : 'Completar Venta'}
                </Button>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default B2BSalesTerminal;