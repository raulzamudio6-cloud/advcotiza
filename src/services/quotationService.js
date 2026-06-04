import { supabase } from '../lib/supabaseClient';

/**
 * Get all quotations for the current user with optional filters
 */
export const getQuotations = async (filters = {}) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    let query = supabase
      .from('cotizaciones')
      .select('*')
      .eq('user_id', user.id);

    // Apply filters
    if (filters.clientName) {
      query = query.ilike('client_info->>name', `%${filters.clientName}%`);
    }

    if (filters.startDate) {
      query = query.gte('created_at', filters.startDate);
    }

    if (filters.endDate) {
      query = query.lte('created_at', filters.endDate);
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting quotations:', error);
    throw error;
  }
};

/**
 * Get a single quotation by ID
 */
export const getQuotationById = async (id) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('cotizaciones')
      .select('*')
      .eq('id', id)
      .eq('user_id', user.id)
      .single();

    if (error) throw error;

    return data;
  } catch (error) {
    console.error('Error getting quotation:', error);
    throw error;
  }
};

/**
 * Save or update a quotation (upsert)
 * If quotationData.id exists, it updates; otherwise, it creates a new one
 */
export const saveQuotation = async (quotationData) => {
  console.log('=== SAVE QUOTATION TO SUPABASE INICIADO ===');
  console.log('Datos de cotización:', quotationData);
  
  try {
    console.log('>>> Obteniendo usuario autenticado...');
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      console.error('!!! Usuario no autenticado');
      throw new Error('User not authenticated');
    }
    console.log('✓ Usuario autenticado:', user.email);

    // Get user's agency ID (opcional - si falla, guardar sin agencia)
    console.log('>>> Intentando obtener agencia del usuario...');
    let agencyId = null;
    try {
      const { data: agency } = await supabase
        .from('agencias')
        .select('id')
        .eq('user_id', user.id)
        .single();
      
      if (agency) {
        agencyId = agency.id;
        console.log('✓ Agencia encontrada:', agencyId);
      } else {
        console.warn('⚠️  No se encontró agencia para el usuario, guardando sin agencia_id');
      }
    } catch (agencyError) {
      console.warn('⚠️  Error al obtener agencia (continuando sin agencia_id):', agencyError.message);
      // Continuar sin agencia_id si la tabla no existe o hay error
    }

    const quotationPayload = {
      user_id: user.id,
      agencia_id: agencyId,
      quotation_title: quotationData.quotationTitle,
      commission_rate: quotationData.commissionRate,
      client_info: quotationData.clientInfo,
      trip_duration: quotationData.tripDuration,
      passengers: quotationData.passengers,
      flights: quotationData.flights,
      accommodations: quotationData.accommodations,
      additional_services: quotationData.additionalServices,
      calculations: quotationData.calculations || {},
      updated_at: new Date().toISOString()
    };

    console.log('>>> Payload preparado, intentando guardar en Supabase...');
    let result;

    if (quotationData.id && quotationData.id.startsWith('quotation_')) {
      // This is a localStorage ID, create new quotation in Supabase
      console.log('>>> Creando nueva cotización (ID de localStorage)...');
      const { data, error } = await supabase
        .from('cotizaciones')
        .insert([quotationPayload])
        .select()
        .single();

      if (error) {
        console.error('!!! Error al insertar cotización:', error);
        throw error;
      }
      console.log('✓ Cotización insertada exitosamente');
      result = { success: true, data, message: 'Cotización guardada en la nube', isNew: true };
    } else if (quotationData.id) {
      // Update existing quotation
      console.log('>>> Actualizando cotización existente...');
      const { data, error } = await supabase
        .from('cotizaciones')
        .update(quotationPayload)
        .eq('id', quotationData.id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) {
        console.error('!!! Error al actualizar cotización:', error);
        throw error;
      }
      console.log('✓ Cotización actualizada exitosamente');
      result = { success: true, data, message: 'Cotización actualizada correctamente', isNew: false };
    } else {
      // Create new quotation
      console.log('>>> Creando nueva cotización...');
      const { data, error } = await supabase
        .from('cotizaciones')
        .insert([quotationPayload])
        .select()
        .single();

      if (error) {
        console.error('!!! Error al insertar cotización:', error);
        throw error;
      }
      console.log('✓ Cotización insertada exitosamente');
      result = { success: true, data, message: 'Cotización guardada correctamente', isNew: true };
    }

    console.log('=== SAVE QUOTATION COMPLETADO EXITOSAMENTE ===');
    return result;
  } catch (error) {
    console.error('!!! ERROR CRÍTICO EN SAVE QUOTATION ===');
    console.error('Error:', error);
    console.error('Error message:', error.message);
    console.error('Error code:', error.code);
    console.error('Error details:', error.details);
    console.error('Stack trace:', error.stack);
    return { success: false, message: error.message };
  }
};

/**
 * Update an existing quotation
 */
export const updateQuotation = async (id, quotationData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('cotizaciones')
      .update({
        quotation_title: quotationData.quotationTitle,
        commission_rate: quotationData.commissionRate,
        client_info: quotationData.clientInfo,
        trip_duration: quotationData.tripDuration,
        passengers: quotationData.passengers,
        flights: quotationData.flights,
        accommodations: quotationData.accommodations,
        additional_services: quotationData.additionalServices,
        calculations: quotationData.calculations || {},
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single();

    if (error) throw error;

    return { success: true, data, message: 'Cotización actualizada correctamente' };
  } catch (error) {
    console.error('Error updating quotation:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Delete a quotation
 */
export const deleteQuotation = async (id) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('cotizaciones')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;

    return { success: true, message: 'Cotización eliminada correctamente' };
  } catch (error) {
    console.error('Error deleting quotation:', error);
    return { success: false, message: error.message };
  }
};

/**
 * Get quotations statistics
 */
export const getQuotationsStats = async () => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data: quotations, error } = await supabase
      .from('cotizaciones')
      .select('created_at, updated_at')
      .eq('user_id', user.id);

    if (error) throw error;

    const total = quotations.length;
    const now = new Date();
    const thisMonth = quotations.filter(q => {
      const createdDate = new Date(q.created_at);
      return createdDate.getMonth() === now.getMonth() && 
             createdDate.getFullYear() === now.getFullYear();
    }).length;

    const lastSaved = quotations.length > 0 
      ? new Date(Math.max(...quotations.map(q => new Date(q.updated_at)))) 
      : null;

    return { total, thisMonth, lastSaved };
  } catch (error) {
    console.error('Error getting quotations stats:', error);
    return { total: 0, thisMonth: 0, lastSaved: null };
  }
};
