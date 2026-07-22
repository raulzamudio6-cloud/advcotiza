import React, { createContext, useContext, useState, useEffect } from 'react';
import { getAgencyConfig, saveAgencyConfig as saveAgencyConfigToSupabase } from '../services/agencyService';

// Estructura de configuración de la agencia
const initialAgencyConfig = {
  agencyName: '',
  logoUrl: '',
  contact: {
    phone: '',
    email: ''
  },
  socialMedia: {
    instagram: '',
    facebook: ''
  },
  policies: ['']
};

// Crear el contexto
const AgencyConfigContext = createContext();

// Provider del contexto
export const AgencyConfigProvider = ({ children }) => {
  const [agencyConfig, setAgencyConfig] = useState(initialAgencyConfig);
  const [loading, setLoading] = useState(true);

  // Load agency configuration from Supabase
  useEffect(() => {
    const loadAgencyConfig = async () => {
      try {
        const supabaseConfig = await getAgencyConfig();
        
        if (supabaseConfig) {
          // Transform Supabase data to match existing structure
          setAgencyConfig({
            agencyName: supabaseConfig.nombre_comercial,
            logoUrl: supabaseConfig.logo_url || initialAgencyConfig.logoUrl,
            contact: {
              phone: supabaseConfig.whatsapp || initialAgencyConfig.contact.phone,
              email: supabaseConfig.email_contacto || initialAgencyConfig.contact.email
            },
            socialMedia: {
              instagram: supabaseConfig.instagram || initialAgencyConfig.socialMedia.instagram,
              facebook: supabaseConfig.facebook || initialAgencyConfig.socialMedia.facebook
            },
            policies: supabaseConfig.terminos_condiciones 
              ? JSON.parse(supabaseConfig.terminos_condiciones)
              : initialAgencyConfig.policies
          });
        } else {
          // Use initial config if no Supabase config exists
          setAgencyConfig(initialAgencyConfig);
        }
      } catch (error) {
        console.error('Error loading agency config:', error);
        setAgencyConfig(initialAgencyConfig);
      } finally {
        setLoading(false);
      }
    };

    loadAgencyConfig();
  }, []);

  // Función para actualizar la configuración
  const updateAgencyConfig = async (newConfig) => {
    try {
      // Transform to Supabase format and save
      const supabaseData = {
        nombre_comercial: newConfig.agencyName,
        logo_url: newConfig.logoUrl,
        whatsapp: newConfig.contact.phone,
        email_contacto: newConfig.contact.email,
        instagram: newConfig.socialMedia.instagram,
        facebook: newConfig.socialMedia.facebook,
        terminos_condiciones: JSON.stringify(newConfig.policies)
      };
      
      await saveAgencyConfigToSupabase(supabaseData);
      
      // Only update local state after successful save
      const updatedConfig = { ...agencyConfig, ...newConfig };
      setAgencyConfig(updatedConfig);
    } catch (error) {
      console.error('Error saving agency config to Supabase:', error);
      throw error; // Re-throw to allow UI to handle the error
    }
  };

  // Función para resetear a configuración inicial
  const resetAgencyConfig = async () => {
    setAgencyConfig(initialAgencyConfig);
    
    try {
      const supabaseData = {
        nombre_comercial: initialAgencyConfig.agencyName,
        logo_url: initialAgencyConfig.logoUrl,
        whatsapp: initialAgencyConfig.contact.phone,
        email_contacto: initialAgencyConfig.contact.email,
        instagram: initialAgencyConfig.socialMedia.instagram,
        facebook: initialAgencyConfig.socialMedia.facebook,
        terminos_condiciones: JSON.stringify(initialAgencyConfig.policies)
      };
      
      await saveAgencyConfigToSupabase(supabaseData);
    } catch (error) {
      console.error('Error resetting agency config in Supabase:', error);
    }
  };

  const value = {
    agencyConfig,
    loading,
    updateAgencyConfig,
    resetAgencyConfig
  };

  return (
    <AgencyConfigContext.Provider value={value}>
      {children}
    </AgencyConfigContext.Provider>
  );
};

// Hook personalizado para usar el contexto
export const useAgencyConfig = () => {
  const context = useContext(AgencyConfigContext);
  if (!context) {
    throw new Error('useAgencyConfig debe ser usado dentro de un AgencyConfigProvider');
  }
  return context;
};

export default AgencyConfigContext;
