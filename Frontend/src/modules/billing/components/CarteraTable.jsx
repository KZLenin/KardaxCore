import React, { useState, useEffect } from 'react';
import { 
  DollarSign, AlertCircle, Clock, Search, MessageCircle, 
  CreditCard, FileText, CheckCircle2, Loader2 
} from 'lucide-react';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
// 🔥 IMPORTAMOS EL SHEET DE SHADCN EN LUGAR DEL DIALOG
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";

import { billingService } from '../services/billingService';

const CarteraTable = () => {
  const [cartera, setCartera] = useState([]);
  const [loading, setLoading] = useState(true);
  const [buscar, setBuscar] = useState('');
  
  // Estados para el Sheet de Pago
  const [pagoModalOpen, setPagoModalOpen] = useState(false);
  const [facturaSeleccionada, setFacturaSeleccionada] = useState(null);
  const [pagoForm, setPagoForm] = useState({ monto: '', metodo_pago: 'TRANSFERENCIA', comprobante_referencia: '', notas: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const cargarCartera = async () => {
    try {
      setLoading(true);
      const data = await billingService.getCartera();
      setCartera(data || []);
    } catch (error) {
      toast({ title: "Error", description: "No se pudo cargar la cartera.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarCartera();
  }, []);

  // --- LÓGICA DE KPIs Y ESTADOS ---
  const hoy = new Date();
  
  const metricas = cartera.reduce((acc, factura) => {
    const saldo = Number(factura.saldo_pendiente);
    const estaVencida = new Date(factura.fecha_vencimiento) < hoy && factura.estado_pago !== 'PAGADO';
    
    acc.totalCobrar += saldo;
    if (estaVencida) acc.totalVencido += saldo;
    else if (factura.estado_pago !== 'PAGADO') acc.totalAlDia += saldo;
    
    return acc;
  }, { totalCobrar: 0, totalVencido: 0, totalAlDia: 0 });

  const getEstadoVisual = (factura) => {
    if (factura.estado_pago === 'PAGADO') return { label: 'Pagado', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    
    const estaVencida = new Date(factura.fecha_vencimiento) < hoy;
    if (estaVencida) return { label: 'Vencido', color: 'bg-red-100 text-red-800 border-red-200' };
    
    if (factura.estado_pago === 'PARCIAL') return { label: 'Abonado', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    return { label: 'Pendiente', color: 'bg-blue-100 text-blue-800 border-blue-200' };
  };

  // --- ACCIONES ---
  const handleWhatsApp = (factura) => {
    const telefono = factura.empresa?.telefono || '';
    const numeroLimpio = telefono.replace(/\D/g, ''); 
    
    if (!numeroLimpio) {
      toast({ title: "Sin teléfono", description: "El cliente no tiene un teléfono registrado.", variant: "destructive" });
      return;
    }

    const mensaje = `Hola, te saludamos de SOI Soluciones. Te recordamos cordialmente que la factura ${factura.numero_factura || 'pendiente'} por un saldo de $${factura.saldo_pendiente} vence el ${new Date(factura.fecha_vencimiento).toLocaleDateString('es-ES')}. ¡Quedamos a las órdenes!`;
    const url = `https://wa.me/593${numeroLimpio.startsWith('0') ? numeroLimpio.substring(1) : numeroLimpio}?text=${encodeURIComponent(mensaje)}`;
    window.open(url, '_blank');
  };

  const handleAbrirPago = (factura) => {
    setFacturaSeleccionada(factura);
    setPagoForm({ monto: factura.saldo_pendiente, metodo_pago: 'TRANSFERENCIA', comprobante_referencia: '', notas: '' });
    setPagoModalOpen(true);
  };

  const procesarPago = async () => {
    setIsSubmitting(true);
    try {
      await billingService.registrarAbono(facturaSeleccionada.id, pagoForm);
      toast({ title: "¡Pago Registrado!", description: "El abono ha sido guardado con éxito." });
      setPagoModalOpen(false);
      cargarCartera(); // Recargamos para actualizar saldos
    } catch (error) {
      toast({ title: "Error", description: error.message || error.response?.data?.error || "Error al procesar", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  const filtradas = cartera.filter(f => 
    f.empresa?.nombre_comercial?.toLowerCase().includes(buscar.toLowerCase()) ||
    f.numero_factura?.toLowerCase().includes(buscar.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {/* 1. KPIs FINANCIEROS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-zinc-200 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-zinc-500">Total por Cobrar</p>
            <h3 className="text-3xl font-black text-zinc-900">${metricas.totalCobrar.toFixed(2)}</h3>
          </div>
          <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center">
            <DollarSign className="w-6 h-6 text-blue-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
          <div>
            <p className="text-sm font-medium text-red-600">Cartera Vencida</p>
            <h3 className="text-3xl font-black text-red-700">${metricas.totalVencido.toFixed(2)}</h3>
          </div>
          <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center">
            <AlertCircle className="w-6 h-6 text-red-600" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-emerald-200 shadow-sm flex items-center justify-between relative overflow-hidden">
          <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
          <div>
            <p className="text-sm font-medium text-emerald-600">Por Vencer (Al día)</p>
            <h3 className="text-3xl font-black text-emerald-700">${metricas.totalAlDia.toFixed(2)}</h3>
          </div>
          <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center">
            <Clock className="w-6 h-6 text-emerald-600" />
          </div>
        </div>
      </div>

      {/* 2. TABLA Y BUSCADOR */}
      <div className="border border-zinc-200 rounded-xl bg-white overflow-hidden shadow-sm">
        <div className="p-4 border-b border-zinc-200 flex bg-zinc-50/50">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
            <Input 
              placeholder="Buscar factura o cliente..." 
              className="pl-9 bg-white border-zinc-200"
              value={buscar}
              onChange={(e) => setBuscar(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center p-12 text-zinc-500">
            <Loader2 className="animate-spin w-6 h-6 mr-2 text-blue-600" /> Calculando cartera...
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-zinc-50">
                <TableRow>
                  <TableHead className="font-bold text-zinc-900">Cliente / Empresa</TableHead>
                  <TableHead className="font-bold text-zinc-900">Factura</TableHead>
                  <TableHead className="font-bold text-zinc-900">Vence</TableHead>
                  <TableHead className="font-bold text-zinc-900">Estado</TableHead>
                  <TableHead className="font-bold text-zinc-900">Progreso</TableHead>
                  <TableHead className="text-right font-bold text-zinc-900">Saldo Pendiente</TableHead>
                  <TableHead className="text-center font-bold text-zinc-900">Gestión</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtradas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="h-32 text-center text-zinc-500">No hay facturas registradas en la cartera.</TableCell>
                  </TableRow>
                ) : (
                  filtradas.map((factura) => {
                    const total = Number(factura.total_facturado);
                    const saldo = Number(factura.saldo_pendiente);
                    const pagado = total - saldo;
                    const porcentaje = total > 0 ? (pagado / total) * 100 : 0;
                    const estado = getEstadoVisual(factura);

                    return (
                      <TableRow key={factura.id} className="hover:bg-zinc-50/50 transition-colors">
                        <TableCell className="font-semibold text-zinc-900">{factura.empresa?.nombre_comercial}</TableCell>
                        <TableCell className="text-zinc-600 font-mono text-xs">
                          <div className="flex items-center gap-1.5">
                            <FileText className="w-3.5 h-3.5 text-zinc-400" />
                            {factura.numero_factura || 'S/N'}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-zinc-600">
                          {new Date(factura.fecha_vencimiento).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={`${estado.color} border uppercase text-[10px] font-bold tracking-wider`}>
                            {estado.label}
                          </Badge>
                        </TableCell>
                        <TableCell className="min-w-[140px]">
                          <div className="flex flex-col gap-1.5">
                            <div className="flex justify-between text-[10px] font-medium text-zinc-500">
                              <span>${pagado.toFixed(2)} pagado</span>
                              <span>{porcentaje.toFixed(0)}%</span>
                            </div>
                            <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full transition-all ${porcentaje === 100 ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                                style={{ width: `${porcentaje}%` }}
                              />
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-mono font-black text-zinc-900 text-base">
                          ${saldo.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center gap-2">
                            {saldo > 0 ? (
                              <>
                                <Button size="icon" variant="ghost" className="h-8 w-8 text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50" title="Recordatorio WhatsApp" onClick={() => handleWhatsApp(factura)}>
                                  <MessageCircle className="w-4 h-4" />
                                </Button>
                                <Button size="sm" className="h-8 bg-zinc-900 text-white hover:bg-zinc-800" onClick={() => handleAbrirPago(factura)}>
                                  Abonar
                                </Button>
                              </>
                            ) : (
                              <span className="text-xs font-bold text-emerald-600 flex items-center gap-1 bg-emerald-50 px-2 py-1 rounded">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Liquidada
                              </span>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* 3. SHEET DE PAGO (ABONOS) */}
      <Sheet open={pagoModalOpen} onOpenChange={setPagoModalOpen}>
        <SheetContent className="w-full sm:max-w-md overflow-y-auto bg-slate-50 border-l border-zinc-200 p-0 flex flex-col">
          
          {/* HEADER DEL SHEET PEGADO ARRIBA */}
          <div className="bg-white p-6 border-b border-zinc-200 sticky top-0 z-10 shadow-sm">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2 text-xl font-bold text-zinc-950">
                <CreditCard className="w-5 h-5 text-blue-600" />
                Registrar Abono
              </SheetTitle>
              <SheetDescription>
                Cliente: <strong className="text-zinc-900">{facturaSeleccionada?.empresa?.nombre_comercial}</strong>
              </SheetDescription>
            </SheetHeader>
          </div>

          {/* CUERPO DEL SHEET SCROLLEABLE */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-lg flex justify-between items-center shadow-sm">
              <span className="text-sm font-semibold text-blue-900">Saldo Pendiente Real:</span>
              <span className="text-3xl font-black text-blue-700 font-mono">${Number(facturaSeleccionada?.saldo_pendiente).toFixed(2)}</span>
            </div>

            <div className="space-y-4">
              <div className="grid gap-1.5">
                <label className="text-sm font-semibold text-zinc-700">Monto a abonar ($)</label>
                <Input 
                  type="number" 
                  max={facturaSeleccionada?.saldo_pendiente}
                  value={pagoForm.monto}
                  onChange={(e) => setPagoForm({...pagoForm, monto: e.target.value})}
                  className="font-mono text-xl font-bold h-12 bg-white"
                  placeholder="0.00"
                />
              </div>
              
              <div className="grid gap-1.5">
                <label className="text-sm font-semibold text-zinc-700">Método de Pago</label>
                <Select value={pagoForm.metodo_pago} onValueChange={(v) => setPagoForm({...pagoForm, metodo_pago: v})}>
                  <SelectTrigger className="h-11 bg-white"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="TRANSFERENCIA">Transferencia Bancaria</SelectItem>
                    <SelectItem value="EFECTIVO">Efectivo</SelectItem>
                    <SelectItem value="TARJETA">Tarjeta de Crédito / Débito</SelectItem>
                    <SelectItem value="CHEQUE">Cheque</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-semibold text-zinc-700">Ref. Comprobante (Opcional)</label>
                <Input 
                  placeholder="Ej. TRANS-092384"
                  value={pagoForm.comprobante_referencia}
                  onChange={(e) => setPagoForm({...pagoForm, comprobante_referencia: e.target.value})}
                  className="h-11 bg-white"
                />
              </div>

              <div className="grid gap-1.5">
                <label className="text-sm font-semibold text-zinc-700">Notas Adicionales</label>
                <Textarea 
                  placeholder="Escribe alguna observación sobre el pago..."
                  value={pagoForm.notas}
                  onChange={(e) => setPagoForm({...pagoForm, notas: e.target.value})}
                  className="bg-white resize-none min-h-[100px]"
                />
              </div>
            </div>
          </div>

          {/* FOOTER DEL SHEET PEGADO ABAJO */}
          <div className="bg-white p-6 border-t border-zinc-200 mt-auto">
            <SheetFooter className="flex gap-3 sm:justify-end">
              <Button variant="outline" onClick={() => setPagoModalOpen(false)} className="flex-1 sm:flex-none h-11">Cancelar</Button>
              <Button onClick={procesarPago} disabled={!pagoForm.monto || Number(pagoForm.monto) <= 0 || isSubmitting} className="flex-1 sm:flex-none h-11 bg-blue-600 hover:bg-blue-700 text-white shadow-md">
                {isSubmitting ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Procesando...</> : "Confirmar Pago"}
              </Button>
            </SheetFooter>
          </div>

        </SheetContent>
      </Sheet>
    </div>
  );
};

export default CarteraTable;