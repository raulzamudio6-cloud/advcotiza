/**
 * Utilidades para formateo y manejo de moneda
 */

/**
 * Formatea un valor numérico como moneda
 * @param {number|string} value - Valor a formatear
 * @param {string} currency - Código de moneda (default: 'USD')
 * @param {string} locale - Configuración regional (default: 'es-MX')
 * @returns {string} Valor formateado como moneda
 */
export const formatCurrency = (value, currency = 'USD', locale = 'es-MX') => {
  if (value === '' || value === null || value === undefined) return '';
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return '';
  
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(numValue);
};

/**
 * Limpia y formatea un valor de entrada de moneda
 * @param {string} value - Valor de entrada
 * @returns {number} Valor numérico limpio
 */
export const cleanCurrencyInput = (value) => {
  if (value === '' || value === null || value === undefined) return 0;
  
  // Remover caracteres no numéricos excepto punto y coma
  const cleaned = value.toString().replace(/[^\d.,]/g, '');
  
  // Reemplazar comas por puntos para decimal
  const normalized = cleaned.replace(/,/g, '.');
  
  // Convertir a número
  const numValue = parseFloat(normalized);
  
  return isNaN(numValue) ? 0 : numValue;
};

/**
 * Formatea un valor para mostrar en input (sin símbolo de moneda)
 * @param {number} value - Valor numérico
 * @returns {string} Valor formateado para input
 */
export const formatInputValue = (value) => {
  if (value === '' || value === null || value === undefined) return '';
  
  const numValue = parseFloat(value);
  if (isNaN(numValue)) return '';
  
  // Formatear con 2 decimales, sin símbolo de moneda
  return numValue.toFixed(2);
};

/**
 * Manejador para el evento onBlur de campos de moneda
 * @param {string} value - Valor actual del input
 * @param {function} onChange - Función para actualizar el estado
 * @returns {function} Función manejadora
 */
export const createCurrencyBlurHandler = (value, onChange) => {
  return (e) => {
    const cleanedValue = cleanCurrencyInput(e.target.value);
    const formattedValue = formatInputValue(cleanedValue);
    
    // Actualizar el estado con el valor numérico limpio
    onChange(cleanedValue);
    
    // Actualizar el input con el valor formateado
    e.target.value = formattedValue;
  };
};

/**
 * Manejador para el evento onChange de campos de moneda
 * @param {function} onChange - Función para actualizar el estado
 * @returns {function} Función manejadora
 */
export const createCurrencyChangeHandler = (onChange) => {
  return (e) => {
    // Permitir entrada libre durante la escritura
    onChange(e.target.value);
  };
};
