/**
 * Utilidades de Cálculo Puro - Lógica de Negocio Separada de la UI
 * Estas funciones son puras y no dependen de React o el DOM
 * Facilitan la migración a otros frameworks (Flutter, etc.)
 */

/**
 * Calcula la duración de un vuelo basado en horas de salida y llegada
 * @param {string} departureTime - HH:MM formato
 * @param {string} arrivalTime - HH:MM formato
 * @returns {string} - Formato "Xh Ym" o "--" si hay error
 */
export const calculateFlightDuration = (departureTime, arrivalTime) => {
  if (!departureTime || !arrivalTime) return '';
  
  try {
    const [depHours, depMinutes] = departureTime.split(':').map(Number);
    const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number);
    
    // Validar que los valores sean números válidos
    if (isNaN(depHours) || isNaN(depMinutes) || isNaN(arrHours) || isNaN(arrMinutes)) {
      return '';
    }
    
    let durationMinutes = (arrHours * 60 + arrMinutes) - (depHours * 60 + depMinutes);
    
    // Si la llegada es al día siguiente, sumar 24 horas
    if (durationMinutes < 0) {
      durationMinutes += 24 * 60;
    }
    
    const hours = Math.floor(durationMinutes / 60);
    const minutes = durationMinutes % 60;
    
    return `${hours}h ${minutes}m`;
  } catch (error) {
    console.error('Error calculating flight duration:', error);
    return '';
  }
};

/**
 * Calcula días y noches del viaje completo
 * @param {string} departureDate - Fecha de salida (YYYY-MM-DD)
 * @param {string} returnDate - Fecha de regreso (YYYY-MM-DD)
 * @returns {Object} - { days: number, nights: number, valid: boolean }
 */
export const calculateTripDuration = (departureDate, returnDate) => {
  try {
    if (!departureDate || !returnDate) {
      return { days: 0, nights: 0, valid: false };
    }
    
    const departure = new Date(departureDate);
    const returnDateObj = new Date(returnDate);
    
    // Validar que las fechas sean válidas
    if (isNaN(departure.getTime()) || isNaN(returnDateObj.getTime())) {
      return { days: 0, nights: 0, valid: false };
    }
    
    // Validar que la fecha de regreso sea posterior a la de salida
    if (returnDateObj <= departure) {
      return { days: 0, nights: 0, valid: false };
    }
    
    const diffTime = Math.abs(returnDateObj - departure);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Lógica inclusiva: Días = diferencia + 1, Noches = diferencia exacta
    return {
      days: diffDays + 1,
      nights: diffDays,
      valid: true
    };
  } catch (error) {
    console.error('Error calculating trip duration:', error);
    return { days: 0, nights: 0, valid: false };
  }
};

/**
 * Calcula el precio con comisión incluida
 * @param {number} basePrice - Precio base
 * @param {number} commissionRate - Tasa de comisión (porcentaje)
 * @returns {number} - Precio con comisión
 */
export const calculatePriceWithCommission = (basePrice, commissionRate) => {
  try {
    const price = parseFloat(basePrice) || 0;
    const commission = parseFloat(commissionRate) || 0;
    
    return price * (1 + commission / 100);
  } catch (error) {
    console.error('Error calculating price with commission:', error);
    return 0;
  }
};

/**
 * Calcula el subtotal para un conjunto de pasajeros
 * @param {number} pricePerPerson - Precio por persona
 * @param {number} passengerCount - Número de pasajeros
 * @returns {number} - Subtotal
 */
export const calculateSubtotal = (pricePerPerson, passengerCount) => {
  try {
    const price = parseFloat(pricePerPerson) || 0;
    const count = parseInt(passengerCount) || 0;
    
    return price * count;
  } catch (error) {
    console.error('Error calculating subtotal:', error);
    return 0;
  }
};

/**
 * Calcula el total de vuelos con comisión
 * @param {Array} flights - Array de vuelos
 * @param {number} passengerCount - Número de pasajeros
 * @param {number} commissionRate - Tasa de comisión
 * @returns {number} - Total de vuelos
 */
export const calculateFlightTotal = (flights, passengerCount, commissionRate) => {
  try {
    const selectedFlight = flights.find(f => f.selected);
    if (!selectedFlight || !selectedFlight.price) {
      return 0;
    }
    
    const basePrice = parseFloat(selectedFlight.price) || 0;
    const subtotal = calculateSubtotal(basePrice, passengerCount);
    
    return calculatePriceWithCommission(subtotal, commissionRate);
  } catch (error) {
    console.error('Error calculating flight total:', error);
    return 0;
  }
};

/**
 * Calcula el total de alojamiento con comisión
 * @param {Array} accommodations - Array de alojamientos
 * @param {number} passengerCount - Número de pasajeros
 * @param {number} commissionRate - Tasa de comisión
 * @returns {number} - Total de alojamiento
 */
export const calculateAccommodationTotal = (accommodations, passengerCount, commissionRate) => {
  try {
    const selectedAccommodation = accommodations.find(a => a.selected);
    if (!selectedAccommodation || !selectedAccommodation.totalPrice) {
      return 0;
    }
    
    const basePrice = parseFloat(selectedAccommodation.totalPrice) || 0;
    const subtotal = calculateSubtotal(basePrice, passengerCount);
    
    return calculatePriceWithCommission(subtotal, commissionRate);
  } catch (error) {
    console.error('Error calculating accommodation total:', error);
    return 0;
  }
};

/**
 * Calcula el total de traslados con comisión
 * @param {Object} transfers - Objeto de traslados
 * @param {number} commissionRate - Tasa de comisión
 * @returns {number} - Total de traslados
 */
export const calculateTransfersTotal = (transfers, commissionRate) => {
  try {
    if (!transfers) return 0;
    
    let total = 0;
    
    if (transfers.standard && transfers.standardPrice) {
      total += parseFloat(transfers.standardPrice) || 0;
    }
    
    if (transfers.extraDetail && transfers.extraPrice) {
      total += parseFloat(transfers.extraPrice) || 0;
    }
    
    return calculatePriceWithCommission(total, commissionRate);
  } catch (error) {
    console.error('Error calculating transfers total:', error);
    return 0;
  }
};

/**
 * Calcula el total de servicios adicionales con comisión
 * @param {Array} extras - Array de servicios adicionales
 * @param {number} commissionRate - Tasa de comisión
 * @returns {number} - Total de servicios adicionales
 */
export const calculateExtrasTotal = (extras, commissionRate) => {
  try {
    if (!Array.isArray(extras)) return 0;
    
    const baseTotal = extras.reduce((total, extra) => {
      return total + (parseFloat(extra.price) || 0);
    }, 0);
    
    return calculatePriceWithCommission(baseTotal, commissionRate);
  } catch (error) {
    console.error('Error calculating extras total:', error);
    return 0;
  }
};

/**
 * Calcula el gran total de la cotización
 * @param {Object} state - Estado completo de la cotización
 * @param {number} commissionRate - Tasa de comisión
 * @returns {number} - Gran total
 */
export const calculateGrandTotal = (state, commissionRate) => {
  try {
    const { flights, accommodations, additionalServices, passengers } = state;
    const passengerCount = passengers.length;
    
    const flightTotal = calculateFlightTotal(flights, passengerCount, commissionRate);
    const accommodationTotal = calculateAccommodationTotal(accommodations, passengerCount, commissionRate);
    const transfersTotal = calculateTransfersTotal(additionalServices.transfers, commissionRate);
    const extrasTotal = calculateExtrasTotal(additionalServices.extras, commissionRate);
    
    return flightTotal + accommodationTotal + transfersTotal + extrasTotal;
  } catch (error) {
    console.error('Error calculating grand total:', error);
    return 0;
  }
};

/**
 * Genera un resumen de cálculos para una cotización
 * @param {Object} state - Estado completo de la cotización
 * @param {number} commissionRate - Tasa de comisión
 * @returns {Object} - Objeto con todos los cálculos
 */
export const generateCalculations = (state, commissionRate) => {
  const { flights, accommodations, additionalServices, passengers } = state;
  const passengerCount = passengers.length;
  
  return {
    selectedFlight: flights.find(f => f.selected) || null,
    selectedAccommodation: accommodations.find(a => a.selected) || null,
    passengerCount,
    
    // Totales por categoría
    flightTotal: () => calculateFlightTotal(flights, passengerCount, commissionRate),
    accommodationTotal: () => calculateAccommodationTotal(accommodations, passengerCount, commissionRate),
    transfersTotal: () => calculateTransfersTotal(additionalServices.transfers, commissionRate),
    extrasTotal: () => calculateExtrasTotal(additionalServices.extras, commissionRate),
    grandTotal: () => calculateGrandTotal(state, commissionRate),
    
    // Utilidades de cálculo
    tripDuration: () => {
      const selectedFlight = flights.find(f => f.selected);
      if (!selectedFlight) return { days: 0, nights: 0, valid: false };
      
      return calculateTripDuration(selectedFlight.outbound.date, selectedFlight.return.date);
    }
  };
};

/**
 * Formatea una fecha para visualización
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @param {string} locale - Locale para formateo (default: 'es-MX')
 * @returns {string} - Fecha formateada
 */
export const formatDisplayDate = (dateString, locale = 'es-MX') => {
  try {
    if (!dateString) return 'No especificado';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return 'Fecha inválida';
    
    return date.toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting date:', error);
    return 'Error en fecha';
  }
};

/**
 * Formatea una fecha para tabla (DD/MM/YYYY)
 * @param {string} dateString - Fecha en formato YYYY-MM-DD
 * @returns {string} - Fecha formateada
 */
export const formatTableDate = (dateString) => {
  try {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleDateString('es-MX', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch (error) {
    console.error('Error formatting table date:', error);
    return '';
  }
};

/**
 * Valida la integridad de los datos de una cotización
 * @param {Object} data - Datos de la cotización
 * @returns {Object} - { valid: boolean, errors: Array }
 */
export const validateQuotationData = (data) => {
  const errors = [];
  
  try {
    // Validar estructura básica
    if (!data || typeof data !== 'object') {
      errors.push('Los datos de cotización deben ser un objeto válido');
      return { valid: false, errors };
    }
    
    // Validar información del cliente
    if (!data.clientInfo || typeof data.clientInfo !== 'object') {
      errors.push('La información del cliente es requerida');
    } else {
      if (!data.clientInfo.name || data.clientInfo.name.trim() === '') {
        errors.push('El nombre del cliente es requerido');
      }
    }
    
    // Validar pasajeros
    if (!Array.isArray(data.passengers) || data.passengers.length === 0) {
      errors.push('Se requiere al menos un pasajero');
    } else {
      data.passengers.forEach((passenger, index) => {
        if (!passenger.name || passenger.name.trim() === '') {
          errors.push(`El nombre del pasajero ${index + 1} es requerido`);
        }
      });
    }
    
    // Validar vuelos
    if (!Array.isArray(data.flights) || data.flights.length === 0) {
      errors.push('Se requiere al menos una opción de vuelo');
    } else {
      const selectedFlight = data.flights.find(f => f.selected);
      if (!selectedFlight) {
        errors.push('Debe seleccionar una opción de vuelo');
      } else {
        if (!selectedFlight.price || selectedFlight.price <= 0) {
          errors.push('El vuelo seleccionado debe tener un precio válido');
        }
      }
    }
    
    // Validar alojamiento
    if (!Array.isArray(data.accommodations) || data.accommodations.length === 0) {
      errors.push('Se requiere al menos una opción de alojamiento');
    } else {
      const selectedAccommodation = data.accommodations.find(a => a.selected);
      if (!selectedAccommodation) {
        errors.push('Debe seleccionar una opción de alojamiento');
      } else {
        // Validación condicional: solo validar precio si el hotel tiene nombre
        if (selectedAccommodation.name && selectedAccommodation.name.trim() !== '') {
          // Convertir totalPrice a número para validación (coincidente con el campo del formulario)
          const accommodationPrice = parseFloat(selectedAccommodation.totalPrice) || 0;
          if (accommodationPrice <= 0) {
            errors.push('El alojamiento seleccionado debe tener un precio válido mayor a 0');
          }
        }
      }
    }
    
    // Validar comisión
    if (typeof data.commissionRate !== 'number' || data.commissionRate < 0) {
      errors.push('La tasa de comisión debe ser un número válido mayor o igual a 0');
    }
    
  } catch (error) {
    errors.push('Error durante la validación: ' + error.message);
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
};

/**
 * Genera un resumen ejecutivo de la cotización
 * @param {Object} state - Estado de la cotización
 * @param {Object} calculations - Cálculos generados
 * @returns {Object} - Resumen para exportación
 */
export const generateQuotationSummary = (state, calculations) => {
  try {
    const tripDuration = calculations.tripDuration();
    const selectedFlight = calculations.selectedFlight;
    const selectedAccommodation = calculations.selectedAccommodation;
    
    return {
      title: state.quotationTitle,
      clientName: state.clientInfo.name,
      clientEmail: state.clientInfo.email,
      clientPhone: state.clientInfo.phone,
      passengerCount: state.passengers.length,
      tripDuration: tripDuration.valid ? 
        `${tripDuration.days} Días / ${tripDuration.nights} Noches` : 
        'Pendiente de fechas',
      flightRoute: selectedFlight ? 
        `${selectedFlight.outbound.origin || selectedFlight.route.origin} → ${selectedFlight.outbound.destination || selectedFlight.route.destination}` : 
        'No seleccionado',
      airline: selectedFlight?.airline || 'No especificado',
      accommodationName: selectedAccommodation?.name || 'No seleccionado',
      accommodationCategory: selectedAccommodation ? 
        `${selectedAccommodation.category} estrellas` : 
        'No especificado',
      grandTotal: calculations.grandTotal(),
      commissionRate: state.commissionRate,
      createdAt: new Date().toISOString(),
      status: 'draft'
    };
  } catch (error) {
    console.error('Error generating quotation summary:', error);
    return null;
  }
};
