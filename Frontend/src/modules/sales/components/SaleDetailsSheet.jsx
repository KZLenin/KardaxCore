import React, { useState, useEffect } from 'react';
import { Loader2, ReceiptText, Calendar, Building2, MapPin, Tag } from 'lucide-react';
import { Sheet, SheetContent, SheetDescription, SheetTitle, SheetHeader } from "@/components/ui/sheet";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { salesService } from '../services/salesService';

const SaleDetailsSheet = ({ ventaId, isOpen, setIsOpen }) => {
  const [detalle, setDetalle] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (ventaId && isOpen) {
      const cargarDetalles = async () => {
        setLoading(true);
        try {
          const data = await salesService.getVentaDetalle(ventaId);
          setDetalle(data);
        } catch (error) {
          console.error("Error cargando detalle:", error);
        } finally {
          setLoading(false);
        }
      };
      cargarDetalles();
    } else {
      setDetalle(null);
    }
  }, [ventaId, isOpen]);

  return (
    <Sheet open={isOpen} onOpenChange={setIsOpen}>
      <SheetContent className="w-full sm:max-w-xl overflow-y-auto bg-slate-50 border-l border-zinc-200 p-0">
        <SheetHeader className="bg-white p-6 border-b border-zinc-200 sticky top-0 z-10 shadow-sm">
          <SheetTitle className="text-2xl font-bold flex items-center gap-2">
            <ReceiptText className="w-5 h-5 text-blue-600" /> Detalle de Venta
          </SheetTitle>
          <SheetDescription>
            {detalle ? `Comprobante: ${detalle.numero_comprobante || 'S/N'}` : 'Cargando información...'}
          </SheetDescription>
        </SheetHeader>

        {loading || !detalle ? (
          <div className="flex justify-center p-12 text-zinc-500">
            <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
          </div>
        ) : (
          <div className="p-6 space-y-6">
            {/* Tarjeta de Info Comercial */}
            <div className="bg-white p-4 rounded-xl border border-zinc-200 shadow-sm grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-zinc-500 font-semibold uppercase text-[10px] flex items-center gap-1"><Building2 className="w-3 h-3"/> Empresa</span>
                <p className="font-medium text-zinc-900">{detalle.empresa_nombre || detalle.cliente_nombre}</p>
              </div>
              <div>
                <span className="text-zinc-500 font-semibold uppercase text-[10px] flex items-center gap-1"><MapPin className="w-3 h-3"/> Sede Entrega</span>
                <p className="font-medium text-zinc-900">{detalle.sucursal_nombre || 'No especificada'}</p>
              </div>
              <div>
                <span className="text-zinc-500 font-semibold uppercase text-[10px] flex items-center gap-1"><Calendar className="w-3 h-3"/> Fecha</span>
                <p className="font-medium text-zinc-900">{new Date(detalle.fecha_venta).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-zinc-500 font-semibold uppercase text-[10px] flex items-center gap-1"><Tag className="w-3 h-3"/> PO Cliente</span>
                <p className="font-medium text-zinc-900">{detalle.po_cliente || '-'}</p>
              </div>
            </div>

            {/* Tabla de Ítems */}
            <div className="border border-zinc-200 rounded-xl bg-white overflow-hidden shadow-sm">
              <Table>
                <TableHeader className="bg-zinc-50">
                  <TableRow>
                    <TableHead className="font-bold text-zinc-900">Equipo / Repuesto</TableHead>
                    <TableHead className="text-center font-bold text-zinc-900">Cant.</TableHead>
                    <TableHead className="text-right font-bold text-zinc-900">P. Unit</TableHead>
                    <TableHead className="text-right font-bold text-zinc-900">Subtotal</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detalle.items?.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>
                        <p className="font-semibold text-zinc-900">{item.item_nombre}</p>
                        {item.garantia_dias > 0 && (
                          <Badge variant="outline" className="text-[10px] mt-1 bg-blue-50 text-blue-700">Garantía: {item.garantia_dias} días</Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center">{item.cantidad}</TableCell>
                      <TableCell className="text-right">${Number(item.precio_unitario).toFixed(2)}</TableCell>
                      <TableCell className="text-right font-medium">${(item.cantidad * item.precio_unitario).toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <div className="bg-zinc-900 text-white p-4 flex justify-between items-center rounded-b-xl">
                <span className="text-zinc-400 font-semibold text-sm uppercase tracking-wider">Total Cobrado</span>
                <span className="text-2xl font-mono font-bold">${Number(detalle.total_venta).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default SaleDetailsSheet;