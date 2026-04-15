import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Package, Wrench, AlertTriangle, ShieldAlert, ArrowUpRight, Loader2 } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { dashboardService } from '../services/dashboardService';
import { toast } from 'sonner'; // O tu librería de notificaciones

const DashboardView = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    kpis: { stockOperativo: 0, equiposEnTaller: 0, stockCriticoCount: 0, garantiasPorVencer: 0 },
    dataFlujo: [],
    dataEstados: [],
    stockCriticoList: []
  });

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        setLoading(true);
        const dashboardData = await dashboardService.getDashboardData();
        setData(dashboardData);
      } catch (error) {
        toast.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh]">
        <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
        <p className="text-zinc-500 font-medium animate-pulse">Cargando métricas de la empresa...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500 max-w-7xl mx-auto p-4">
      
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Centro de Mando</h1>
          <p className="text-zinc-500">Indicadores clave de inventario, logística y taller técnico.</p>
        </div>
      </div>

      {/* NIVEL 1: SIGNOS VITALES (KPIs) */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        
        <Card className="border-l-4 border-l-emerald-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-zinc-600">Stock Operativo</CardTitle>
            <div className="p-2 bg-emerald-50 rounded-lg"><Package className="w-4 h-4 text-emerald-600" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-zinc-900">{data.kpis.stockOperativo}</div>
            <p className="text-xs text-emerald-600 flex items-center mt-1 font-medium">
              Equipos listos para venta
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-amber-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-zinc-600">Equipos en Taller</CardTitle>
            <div className="p-2 bg-amber-50 rounded-lg"><Wrench className="w-4 h-4 text-amber-600" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-zinc-900">{data.kpis.equiposEnTaller}</div>
            <p className="text-xs text-amber-600 flex items-center mt-1 font-medium">
              Esperando reparación
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-rose-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-zinc-600">Stock Crítico</CardTitle>
            <div className="p-2 bg-rose-50 rounded-lg"><AlertTriangle className="w-4 h-4 text-rose-600" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-zinc-900">{data.kpis.stockCriticoCount}</div>
            <p className="text-xs text-rose-600 flex items-center mt-1 font-medium">
              SKUs en mínimo (≤ 2 uds)
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
            <CardTitle className="text-sm font-semibold text-zinc-600">Garantías por Vencer</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg"><ShieldAlert className="w-4 h-4 text-blue-600" /></div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-black text-zinc-900">{data.kpis.garantiasPorVencer}</div>
            <p className="text-xs text-zinc-500 flex items-center mt-1 font-medium">
              Vencen en los próximos 15 días
            </p>
          </CardContent>
        </Card>

      </div>

      {/* NIVEL 2: GRÁFICOS Y LISTAS */}
      <div className="grid gap-6 md:grid-cols-7">
        
        {/* Gráfico Principal */}
        <Card className="col-span-1 md:col-span-4 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg text-zinc-800">Flujo Logístico (Últimos 7 días)</CardTitle>
            <CardDescription>Comparativa de entradas a bodega vs salidas y ventas.</CardDescription>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.dataFlujo} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e4e4e7" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#71717a', fontSize: 12}} />
                  <Tooltip 
                    cursor={{fill: '#f4f4f5'}}
                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                  />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                  <Bar dataKey="entradas" name="Entradas" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  <Bar dataKey="salidas" name="Salidas/Ventas" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Panel Lateral: Pastel y Lista */}
        <div className="col-span-1 md:col-span-3 space-y-6">
          
          <Card className="shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg text-zinc-800">Salud del Inventario</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-[180px] w-full flex justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.dataEstados}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      stroke="none"
                    >
                      {data.dataEstados.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {data.dataEstados.map((estado) => (
                  <div key={estado.name} className="text-center">
                    <div className="text-xl font-bold text-zinc-900">{estado.value}</div>
                    <div className="text-[10px] uppercase font-semibold text-zinc-500" style={{color: estado.color}}>{estado.name}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-rose-200">
            <CardHeader className="bg-rose-50/50 pb-3 border-b border-rose-100">
              <CardTitle className="text-sm font-bold text-rose-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4" /> Alerta de Stock
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-zinc-100 max-h-[220px] overflow-y-auto">
                {data.stockCriticoList.length > 0 ? (
                  data.stockCriticoList.map((item) => (
                    <div key={item.id} className="flex items-center justify-between p-4 hover:bg-zinc-50 transition-colors">
                      <div className="overflow-hidden pr-4">
                        <p className="text-sm font-semibold text-zinc-900 truncate">{item.nombre}</p>
                        <p className="text-xs text-zinc-500">Mínimo sugerido: {item.min}</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${item.stock === 0 ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-700'}`}>
                        {item.stock} uds
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-zinc-500 text-sm">
                    Todo el inventario está en niveles óptimos.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  );
};

export default DashboardView;