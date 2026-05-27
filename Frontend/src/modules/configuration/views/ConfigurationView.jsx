import { useState, useEffect } from 'react';
import { Settings, Image as ImageIcon, Box } from 'lucide-react';
import { configurationService } from '../services/configurationService';

// Importamos los componentes hijos
import { ProfileForm } from '../components/ProfileForm';
import { InventoryParamsForm } from '../components/InventoryParamsForm';
import { LogoForm } from '../components/LogoForm';

const ConfigurationView = () => {
  const [config, setConfig] = useState(null);
  const [activeTab, setActiveTab] = useState('perfil');
  const [isLoading, setIsLoading] = useState(true);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const data = await configurationService.obtenerGeneral();
      setConfig(data);
    } catch (error) {
      console.error("Error cargando configuración:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Carga inicial
  useEffect(() => {
    fetchConfig();
  }, []);

  if (isLoading) return <div className="p-8 text-center text-zinc-500 text-sm font-medium">Cargando cerebro del sistema...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto animate-fade-in">
      
      {/* HEADER DE LA VISTA */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-zinc-900 flex items-center gap-2">
          <Settings className="w-6 h-6 text-zinc-700" />
          Configuración del Sistema
        </h1>
        <p className="text-sm text-zinc-500 mt-1">
          Administra el perfil de la empresa, parámetros de inventario y branding.
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        
        {/* MENÚ LATERAL DE PESTAÑAS */}
        <div className="w-full md:w-64 flex flex-col gap-1">
          <button 
            onClick={() => setActiveTab('perfil')}
            className={`text-left text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 transition ${activeTab === 'perfil' ? 'bg-zinc-900 text-white font-medium' : 'text-zinc-600 hover:bg-zinc-100'}`}
          >
            <Settings className="w-4 h-4" /> Perfil de Empresa
          </button>
          <button 
            onClick={() => setActiveTab('logo')}
            className={`text-left text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 transition ${activeTab === 'logo' ? 'bg-zinc-900 text-white font-medium' : 'text-zinc-600 hover:bg-zinc-100'}`}
          >
            <ImageIcon className="w-4 h-4" /> Branding y Logo
          </button>
          <button 
            onClick={() => setActiveTab('inventario')}
            className={`text-left text-sm px-4 py-2.5 rounded-lg flex items-center gap-2 transition ${activeTab === 'inventario' ? 'bg-zinc-900 text-white font-medium' : 'text-zinc-600 hover:bg-zinc-100'}`}
          >
            <Box className="w-4 h-4" /> Parámetros Inventario
          </button>
        </div>

        {/* CONTENEDOR DINÁMICO (Aquí se renderizan los forms) */}
        <div className="flex-1">
          {activeTab === 'perfil' && (
            <ProfileForm configInicial={config} onUpdate={fetchConfig} />
          )}
          {activeTab === 'logo' && <LogoForm configInicial={config} onUpdate={fetchConfig} />}
          {activeTab === 'inventario' && <InventoryParamsForm configInicial={config} onUpdate={fetchConfig} />}
        </div>
        
      </div>
    </div>
  );
};

export default ConfigurationView;