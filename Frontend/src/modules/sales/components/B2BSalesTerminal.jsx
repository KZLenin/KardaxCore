import React, { useState, useEffect } from 'react';
import { ShoppingCart, FileText, Tag, Trash2, CheckCircle, ShieldCheck, DollarSign, ScanBarcode, Building2, MapPin } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

import { salesService } from '../services/salesService'; 
import { inventoryService } from '../../inventory/services/inventoryService'; 
import { clientService } from '../../clients/services/clientService'; // 🔥 Importamos el servicio de clientes

const B2BSalesTerminal = () => {
  const { toast } = useToast();
  
  // 1. Estados de la Cabecera Comercial (NUEVOS: Empresa y Sucursal)
  const [empresas, setEmpresas] = useState([]);
  const [sucursales, setSucursales] = useState([]);
  const [empresaId, setEmpresaId] = useState("");
  const [sucursalId, setSucursalId] = useState("");
  
  const [numeroComprobante, setNumeroComprobante] = useState('');
  const [poCliente, setPoCliente] = useState('');
  const [notas, setNotas] = useState('');

  // 2. Estados del Inventario y Carrito
  const [codigoEscaneado, setCodigoEscaneado] = useState('');
  const [inventario, setInventario] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔥 3. Cargar inventario y empresas al montar el componente
  useEffect(() => {
    const cargarDatosIniciales = async () => {
      try {
        // Ejecutamos ambas peticiones al mismo tiempo para que cargue más rápido
        const [invData, empData] = await Promise.all([
          inventoryService.getAll({}),
          clientService.obtenerEmpresas()
        ]);
        
        setInventario(invData.filter(item => item.stock > 0));
        setEmpresas(empData);
      } catch (error) {
        console.error("Error al cargar datos iniciales:", error);
        toast({ title: "Error", description: "No se pudieron cargar los catálogos.", variant: "destructive" });
      }
    };
    cargarDatosIniciales();
  }, []);

  // 🔥 4. Cargar sucursales cada vez que se selecciona una empresa
  useEffect(() => {
    if (empresaId) {
      const cargarSucursales = async () => {
        try {
          const data = await clientService.obtenerSucursalesPorEmpresa(empresaId);
          setSucursales(data);
          
          // Auto-seleccionar la matriz si existe
          const matriz = data.find(s => s.es_matriz);
          if (matriz) {
            setSucursalId(matriz.id);
          } else if (data.length > 0) {
            setSucursalId(data[0].id); // Si no hay matriz, selecciona la primera
          } else {
            setSucursalId("");
          }
        } catch (error) {
          console.error("Error al cargar sedes:", error);
        }
      };
      cargarSucursales();
    } else {
      setSucursales([]);
      setSucursalId("");
    }
  }, [empresaId]);

  // --- FUNCIONES DEL ESCÁNER Y CARRITO ---
  const procesarBusquedaManual = (e) => {
    if (e && e.type === 'keydown' && e.key !== 'Enter') return;
    if (e) e.preventDefault(); 

    const codigoRaw = codigoEscaneado || (e.currentTarget ? e.currentTarget.value : '');
    const codigoBuscado = String(codigoRaw).trim().toLowerCase();

    if (!codigoBuscado) return;

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
    setCarrito(prevCarrito => {
      const itemExistente = prevCarrito.find(item => item.itemId === producto.id);
      
      // BLINDAJE RESTAURADO: Detectamos si es unidad desde la base de datos
      const esUnidad = String(producto.unidad_medida || producto.unidad || '').toUpperCase() === 'UNIDAD';

      if (itemExistente) {
        // Si ya existe y es unidad, no dejamos sumar más
        if (esUnidad) {
          toast({ title: "Acción Bloqueada", description: `No puedes vender más de 1 unidad del mismo equipo (${producto.nombre}).`, variant: "destructive" });
          return prevCarrito;
        }

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
        toast({ title: "Escaneado", description: `${producto.nombre} listo para vender.` });
        return [...prevCarrito, {
          itemId: producto.id,
          nombre: producto.nombre,
          codigo: producto.codigo,
          stockMaximo: producto.stock,
          cantidad: 1,
          precioUnitario: 0,
          garantiaDias: 0,
          unidad: esUnidad ? 'UNIDAD' : 'OTRO' 
        }];
      }
    });
  };

  const actualizarItemCarrito = (itemId, campo, valor) => {
    setCarrito(carrito.map(item => {
      if (item.itemId === itemId) {
        if (campo === 'cantidad') {
          if (item.unidad === 'UNIDAD' && valor > 1) {
            toast({ title: "Acción Bloqueada", description: "Los equipos individuales están bloqueados a 1.", variant: "destructive" });
            return { ...item, cantidad: 1 };
          }
          if (valor > item.stockMaximo) {
            toast({ title: "Stock Insuficiente", description: `Solo hay ${item.stockMaximo} disponibles.`, variant: "destructive" });
            return { ...item, cantidad: item.stockMaximo };
          }
        }
        return { ...item, [campo]: valor };
      }
      return item;
    }));
  };

  const eliminarDelCarrito = (itemId) => {
    setCarrito(carrito.filter(item => item.itemId !== itemId));
  };

  const calcularTotal = carrito.reduce ((total, item) => {
    const cantidad = Number(item.cantidad) || 0; // Si está vacío, asume 0 para no romper la suma
    const precio = Number(item.precioUnitario) || 0;
    return total + (cantidad * precio);
  }, 0);

  // --- ENVÍO AL BACKEND ---
  const procesarVenta = async () => {
    // 🚨 Validaciones
    if (!empresaId || !sucursalId) {
      return toast({ title: "Error", description: "Debes seleccionar la Empresa y la Sede de entrega.", variant: "destructive" });
    }
    
    if (carrito.length === 0) {
      return toast({ title: "Error", description: "El carrito está vacío.", variant: "destructive" });
    }

    const preciosEnCero = carrito.some(item => item.precioUnitario <= 0);
    if (preciosEnCero) {
      return toast({ title: "Error", description: "Hay equipos con precio $0 en el carrito.", variant: "destructive" });
    }

    setIsSubmitting(true);
    
    try {
      const payload = {
        empresaId,   // 🔥 Enviamos el ID de la empresa
        sucursalId,  // 🔥 Enviamos el ID de la sede
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

      await salesService.registrarVenta(payload);
      
      toast({ title: "¡Venta Exitosa!", description: "Stock descontado e historial de Kardex guardado." });
      
      // Limpiar terminal
      setEmpresaId(''); setSucursalId(''); setNumeroComprobante(''); setPoCliente(''); setNotas(''); setCarrito([]);
      
    } catch (error) {
      console.error("Error en Venta:", error);
      toast({ title: "Error en Venta", description: error.message, variant: "destructive" });
    } finally {
      setIsSubmitting(false);
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
          <h3 className="font-semibold text-zinc-800 border-b pb-2 flex items-center gap-2">
            Datos Comerciales
          </h3>
          
          <div className="space-y-4">
            
            {/* 🔥 NUEVO: SELECTOR DE EMPRESA */}
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase flex items-center gap-1 mb-1">
                <Building2 className="w-3 h-3"/> Empresa (RUC) *
              </label>
              <Select value={empresaId} onValueChange={setEmpresaId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Seleccionar empresa..." />
                </SelectTrigger>
                <SelectContent>
                  {empresas.length === 0 ? (
                    <SelectItem value="none" disabled>No hay empresas</SelectItem>
                  ) : (
                    empresas.map(emp => (
                      <SelectItem key={emp.id} value={emp.id}>{emp.nombre_comercial}</SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* 🔥 NUEVO: SELECTOR DE SUCURSAL */}
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase flex items-center gap-1 mb-1">
                <MapPin className="w-3 h-3"/> Sede de Entrega *
              </label>
              <Select value={sucursalId} onValueChange={setSucursalId} disabled={!empresaId}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="¿A qué sede enviamos?" />
                </SelectTrigger>
                <SelectContent>
                  {sucursales.length === 0 ? (
                    <SelectItem value="none" disabled>Esta empresa no tiene sedes</SelectItem>
                  ) : (
                    sucursales.map(suc => (
                      <SelectItem key={suc.id} value={suc.id}>
                        {suc.nombre_sucursal} {suc.es_matriz && " (Matriz)"}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase flex items-center gap-1 mb-1">
                <FileText className="w-3 h-3"/> Nro. Factura / Recibo
              </label>
              <Input placeholder="Ej. FAC-00123" value={numeroComprobante} onChange={(e) => setNumeroComprobante(e.target.value)} />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-500 uppercase flex items-center gap-1 mb-1">
                <Tag className="w-3 h-3"/> PO del Cliente
              </label>
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
          
          <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm flex items-end gap-4">
            <div className="flex-1">
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
                    carrito.map((item) => {
                      const esUnidad = item.unidad === 'UNIDAD';
                      return (
                        <tr key={item.itemId} className="border-b last:border-0 hover:bg-zinc-50/50">
                          <td className="px-4 py-3">
                            <p className="font-semibold text-zinc-900">{item.nombre}</p>
                            <p className="text-xs text-zinc-500">{item.codigo}</p>
                          </td>
                          <td className="px-4 py-3">
                            <Input 
                              type="number" 
                              min="1" 
                              max={esUnidad ? 1 : item.stockMaximo} 
                              value={item.cantidad === 0 ? '' : item.cantidadd} 
                              onChange={(e) => {const valor = e.target.value;  actualizarItemCarrito(item.itemId, 'cantidad', valor === '' ? '' : Number(valor))}} 
                              className={`h-8 w-full text-center ${esUnidad ? 'bg-zinc-100 text-zinc-400 cursor-not-allowed focus-visible:ring-0' : ''}`}
                              readOnly={esUnidad}
                            />
                          </td>
                          <td className="px-4 py-3">
                            <div className="relative">
                              <DollarSign className="w-3 h-3 absolute left-2 top-2.5 text-zinc-400" />
                              <Input type="number" min="0" step="0.01" value={item.precioUnitario === 0 ? '' : item.precioUnitario} 
                              onChange={(e) => {const valor = e.target.value;  actualizarItemCarrito(item.itemId, 'precioUnitario', valor === '' ? '' : Number(valor))}} className="h-8 w-full pl-6" />
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="relative">
                              <ShieldCheck className="w-3 h-3 absolute left-2 top-2.5 text-zinc-400" />
                              <Input type="number" min="0" placeholder="Días" value={item.garantiaDias === 0 ? '' : item.garantiaDias} onChange={(e) => {const valor = e.target.value;  actualizarItemCarrito(item.itemId, 'garantiaDias', valor === '' ? '' : Number(valor))}} className="h-8 w-full pl-6" />
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
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
            
            <div className="bg-zinc-900 text-white p-4 flex items-center justify-between">
              <div className="text-zinc-400 text-sm">
                Total ítems: <span className="text-white font-bold">{carrito.length}</span>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-zinc-400 text-xs uppercase font-bold tracking-wider mb-1">Total a Cobrar</p>
                  <p className="text-2xl font-mono font-bold">${calcularTotal.toFixed(2)}</p>
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