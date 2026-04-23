/**
 * Servicio de Persistencia de Datos para Cotizaciones
 * Encapsula toda la lógica de localStorage para facilitar futuras migraciones
 */

// Versión del esquema de datos para validación
const DATA_VERSION = '1.0.0';
const STORAGE_KEY = 'advCotiza_quotations';

/**
 * Esquema de validación para cotizaciones
 */
const QUOTATION_SCHEMA = {
  version: DATA_VERSION,
  id: 'string',
  title: 'string',
  clientInfo: {
    name: 'string',
    email: 'string',
    phone: 'string'
  },
  passengers: 'array',
  flights: 'array',
  accommodations: 'array',
  additionalServices: {
    transfers: 'object',
    extras: 'array'
  },
  commissionRate: 'number',
  createdAt: 'string',
  updatedAt: 'string'
};

/**
 * Genera un ID único para la cotización
 */
const generateId = () => {
  return `quotation_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Valida que un objeto de cotización cumpla con el esquema esperado
 */
const validateQuotationData = (data) => {
  try {
    // Validar versión
    if (!data.version || data.version !== DATA_VERSION) {
      throw new Error(`Versión incompatible. Esperada: ${DATA_VERSION}, Recibida: ${data.version}`);
    }

    // Validar campos requeridos
    const requiredFields = ['id', 'title', 'clientInfo', 'passengers', 'flights', 'accommodations', 'additionalServices'];
    for (const field of requiredFields) {
      if (data[field] === undefined || data[field] === null) {
        throw new Error(`Campo requerido faltante: ${field}`);
      }
    }

    // Validar estructura de objetos anidados
    if (typeof data.clientInfo !== 'object') {
      throw new Error('clientInfo debe ser un objeto');
    }

    if (!Array.isArray(data.passengers)) {
      throw new Error('passengers debe ser un array');
    }

    if (!Array.isArray(data.flights)) {
      throw new Error('flights debe ser un array');
    }

    if (!Array.isArray(data.accommodations)) {
      throw new Error('accommodations debe ser un array');
    }

    return true;
  } catch (error) {
    console.error('Error de validación de cotización:', error.message);
    return false;
  }
};

/**
 * Limpia y normaliza los datos antes de guardar
 */
const sanitizeQuotationData = (data) => {
  const sanitized = {
    version: DATA_VERSION,
    id: data.id || generateId(),
    title: data.quotationTitle || 'Sin título',
    clientInfo: {
      name: data.clientInfo?.name || '',
      email: data.clientInfo?.email || '',
      phone: data.clientInfo?.phone || ''
    },
    passengers: Array.isArray(data.passengers) ? data.passengers : [],
    flights: Array.isArray(data.flights) ? data.flights : [],
    accommodations: Array.isArray(data.accommodations) ? data.accommodations : [],
    additionalServices: {
      transfers: data.additionalServices?.transfers || { standard: false, extraDetail: '', extraPrice: 0, standardPrice: 0 },
      extras: Array.isArray(data.additionalServices?.extras) ? data.additionalServices.extras : []
    },
    commissionRate: typeof data.commissionRate === 'number' ? data.commissionRate : 0,
    createdAt: data.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  return sanitized;
};

/**
 * Obtiene todas las cotizaciones guardadas
 */
export const getAllQuotations = () => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      return [];
    }

    const data = JSON.parse(stored);
    
    // Validar que sea un array
    if (!Array.isArray(data)) {
      console.warn('Datos corruptos en localStorage, inicializando array vacío');
      return [];
    }

    // Validar cada cotización
    const validQuotations = data.filter(quotation => {
      return validateQuotationData(quotation);
    });

    // Si hay cotizaciones inválidas, actualizar el almacenamiento
    if (validQuotations.length !== data.length) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(validQuotations));
    }

    return validQuotations;
  } catch (error) {
    console.error('Error al obtener cotizaciones:', error);
    return [];
  }
};

/**
 * Guarda una cotización completa
 */
export const saveQuotation = (quotationData) => {
  try {
    // Sanitizar datos
    const sanitizedData = sanitizeQuotationData(quotationData);
    
    // Validar datos
    if (!validateQuotationData(sanitizedData)) {
      throw new Error('Datos de cotización inválidos');
    }

    // Obtener cotizaciones existentes
    const quotations = getAllQuotations();
    
    // Buscar si ya existe una cotización con el mismo ID
    const existingIndex = quotations.findIndex(q => q.id === sanitizedData.id);
    
    if (existingIndex >= 0) {
      // Actualizar cotización existente
      quotations[existingIndex] = sanitizedData;
    } else {
      // Agregar nueva cotización
      quotations.push(sanitizedData);
    }

    // Guardar en localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(quotations));
    
    return {
      success: true,
      id: sanitizedData.id,
      message: existingIndex >= 0 ? 'Cotización actualizada' : 'Cotización guardada'
    };
  } catch (error) {
    console.error('Error al guardar cotización:', error);
    return {
      success: false,
      error: error.message,
      message: 'Error al guardar la cotización'
    };
  }
};

/**
 * Carga una cotización específica por ID
 */
export const loadQuotation = (id) => {
  try {
    const quotations = getAllQuotations();
    const quotation = quotations.find(q => q.id === id);
    
    if (!quotation) {
      throw new Error(`Cotización con ID ${id} no encontrada`);
    }

    // Validar datos antes de retornar
    if (!validateQuotationData(quotation)) {
      throw new Error('Cotización encontrada pero con datos inválidos');
    }

    return {
      success: true,
      data: quotation
    };
  } catch (error) {
    console.error('Error al cargar cotización:', error);
    return {
      success: false,
      error: error.message,
      data: null
    };
  }
};

/**
 * Elimina una cotización por ID
 */
export const deleteQuotation = (id) => {
  try {
    const quotations = getAllQuotations();
    const filteredQuotations = quotations.filter(q => q.id !== id);
    
    if (filteredQuotations.length === quotations.length) {
      throw new Error(`Cotización con ID ${id} no encontrada`);
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(filteredQuotations));
    
    return {
      success: true,
      message: 'Cotización eliminada correctamente'
    };
  } catch (error) {
    console.error('Error al eliminar cotización:', error);
    return {
      success: false,
      error: error.message,
      message: 'Error al eliminar la cotización'
    };
  }
};

/**
 * Exporta todas las cotizaciones como JSON para backup
 */
export const exportQuotations = () => {
  try {
    const quotations = getAllQuotations();
    const exportData = {
      version: DATA_VERSION,
      exportDate: new Date().toISOString(),
      quotations: quotations
    };

    return {
      success: true,
      data: JSON.stringify(exportData, null, 2),
      filename: `cotizaciones_backup_${new Date().toISOString().split('T')[0]}.json`
    };
  } catch (error) {
    console.error('Error al exportar cotizaciones:', error);
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Importa cotizaciones desde un archivo JSON
 */
export const importQuotations = (jsonData) => {
  try {
    const importData = JSON.parse(jsonData);
    
    if (!importData.quotations || !Array.isArray(importData.quotations)) {
      throw new Error('Formato de archivo inválido');
    }

    const existingQuotations = getAllQuotations();
    const newQuotations = importData.quotations.filter(q => validateQuotationData(q));
    
    // Combinar cotizaciones existentes con las nuevas (evitando duplicados por ID)
    const combinedQuotations = [...existingQuotations];
    
    for (const newQuotation of newQuotations) {
      const existingIndex = combinedQuotations.findIndex(q => q.id === newQuotation.id);
      if (existingIndex >= 0) {
        combinedQuotations[existingIndex] = newQuotation; // Actualizar existente
      } else {
        combinedQuotations.push(newQuotation); // Agregar nuevo
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(combinedQuotations));
    
    return {
      success: true,
      imported: newQuotations.length,
      total: combinedQuotations.length,
      message: `Se importaron ${newQuotations.length} cotizaciones correctamente`
    };
  } catch (error) {
    console.error('Error al importar cotizaciones:', error);
    return {
      success: false,
      error: error.message,
      message: 'Error al importar las cotizaciones'
    };
  }
};

/**
 * Limpia todas las cotizaciones (con confirmación)
 */
export const clearAllQuotations = () => {
  try {
    localStorage.removeItem(STORAGE_KEY);
    return {
      success: true,
      message: 'Todas las cotizaciones han sido eliminadas'
    };
  } catch (error) {
    console.error('Error al limpiar cotizaciones:', error);
    return {
      success: false,
      error: error.message,
      message: 'Error al eliminar las cotizaciones'
    };
  }
};

/**
 * Obtiene estadísticas de las cotizaciones
 */
export const getQuotationsStats = () => {
  try {
    const quotations = getAllQuotations();
    const total = quotations.length;
    const thisMonth = quotations.filter(q => {
      const createdDate = new Date(q.createdAt);
      const now = new Date();
      return createdDate.getMonth() === now.getMonth() && 
             createdDate.getFullYear() === now.getFullYear();
    }).length;

    return {
      total,
      thisMonth,
      lastSaved: quotations.length > 0 ? 
        new Date(Math.max(...quotations.map(q => new Date(q.updatedAt)))) : 
        null
    };
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    return {
      total: 0,
      thisMonth: 0,
      lastSaved: null
    };
  }
};
