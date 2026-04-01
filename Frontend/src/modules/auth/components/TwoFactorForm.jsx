import { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";

const TwoFactorForm = ({ onSubmit, isLoading, onBack }) => {
  const [code, setCode] = useState('');

  return (
    <form onSubmit={(e) => { e.preventDefault(); onSubmit(code); }} className="space-y-4">
      <div className="space-y-2">
        <Input
          type="text"
          placeholder="000000"
          className="text-center text-2xl tracking-[1em] font-bold h-14"
          maxLength={6}
          value={code}
          onChange={(e) => setCode(e.target.value)}
          disabled={isLoading}
          required
        />
      </div>
      <Button className="w-full h-11 text-base font-semibold" disabled={isLoading}>
        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Verificar Código"}
      </Button>
      <button 
        type="button" 
        onClick={onBack}
        className="w-full text-sm text-zinc-500 hover:text-zinc-800 transition-colors flex items-center justify-center gap-2"
      >
        <ArrowLeft className="w-3 h-3" /> Volver al inicio
      </button>
    </form>
  );
};

export default TwoFactorForm;