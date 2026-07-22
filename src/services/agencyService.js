import { supabase } from '../lib/supabaseClient';

/**
 * Get agency configuration for the current user
 */
export const getAgencyConfig = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('agencias')
      .select('*')
      .eq('user_id', user.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No agency config found
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error getting agency config:', error);
    throw error;
  }
};

/**
 * Create agency configuration for the current user
 */
export const createAgencyConfig = async (config) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('agencias')
      .insert([
        {
          user_id: user.id,
          nombre_comercial: config.nombre_comercial,
          logo_url: config.logo_url || null,
          whatsapp: config.whatsapp || null,
          email_contacto: config.email_contacto || null,
          instagram: config.instagram || null,
          facebook: config.facebook || null,
          terminos_condiciones: config.terminos_condiciones || null
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Supabase error creating agency config:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error creating agency config:', error);
    throw error;
  }
};

/**
 * Update agency configuration for the current user
 */
export const updateAgencyConfig = async (config) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('agencias')
      .update({
        nombre_comercial: config.nombre_comercial,
        logo_url: config.logo_url || null,
        whatsapp: config.whatsapp || null,
        email_contacto: config.email_contacto || null,
        instagram: config.instagram || null,
        facebook: config.facebook || null,
        terminos_condiciones: config.terminos_condiciones || null
      })
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating agency config:', {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint
      });
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating agency config:', error);
    throw error;
  }
};

/**
 * Save or update agency configuration (upsert)
 */
export const saveAgencyConfig = async (config) => {
  try {
    const existing = await getAgencyConfig();
    
    if (existing) {
      return await updateAgencyConfig(config);
    } else {
      return await createAgencyConfig(config);
    }
  } catch (error) {
    console.error('Error saving agency config:', error);
    throw error;
  }
};
