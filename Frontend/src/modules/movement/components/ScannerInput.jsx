import React, { useState, useRef, useEffect } from 'react';
import { Input } from "@/components/ui/input";
import { ScanBarcode, Loader2, AlertCircle } from "lucide-react";
import { movementsService } from '../services/movementsService';
import { toast } from 'sonner'; // O tu sistema de alertas

const ScannerInput = ({ onScanSuccess, disabled }) => {
  const [codigo, setCodigo] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  // Mantenemos el foco infinito: si el técnico hace clic fuera, el foco vuelve al input
  // para que el siguiente escaneo no se pierda.
  useEffect(() => {
    // Si ya escaneamos algo, apagamos el "ladrón de focos"
    if (disabled) return;

    const focusInput = (e) => {
      // Si el usuario hace clic específicamente en otro input o botón, lo dejamos en paz
      if (e && (e.target.tagName === 'INPUT' || e.target.tagName === 'BUTTON' || e.target.tagName === 'SELECT')) {
        return;
      }
      inputRef.current?.focus();
    };

    focusInput();
    window.addEventListener('click', focusInput);
    
    return () => window.removeEventListener('click', focusInput);
  }, [disabled]); // <-- Importante que 'disabled' esté en el arreglo

  const handleKeyDown = async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const val = codigo.trim();
      if (!val) return;

      setLoading(true);
      try {
        const item = await movementsService.buscarPorCodigo(val);
        
        // Si lo encuentra, ejecutamos el callback que le pasamos desde el padre
        onScanSuccess(item);
        setCodigo(''); 
        toast.success(`Detectado: ${item.nombre}`);
      } catch (err) {
        toast.error(err);
        setCodigo('');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="relative group">
      <div className="absolute left-3 top-3 flex items-center gap-2 pointer-events-none">
        <ScanBarcode className={`h-5 w-5 ${loading ? 'text-zinc-300' : 'text-blue-600 animate-pulse'}`} />
      </div>
      
      <Input
        ref={inputRef}
        placeholder="DISPARE EL LÁSER O ESCRIBA EL CÓDIGO..."
        className="pl-12 h-14 text-lg font-mono border-2 border-blue-100 focus:border-blue-500 bg-white shadow-sm uppercase"
        value={codigo}
        onChange={(e) => setCodigo(e.target.value)}
        onKeyDown={handleKeyDown}
        disabled={loading || disabled}
        autoComplete="off"
      />

      <div className="absolute right-3 top-4 flex items-center gap-2">
        {loading ? (
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        ) : (
          <span className="text-[10px] font-bold text-zinc-400 bg-zinc-100 px-2 py-1 rounded">ESPERANDO SCANNER</span>
        )}
      </div>
    </div>
  );
};

export default ScannerInput;