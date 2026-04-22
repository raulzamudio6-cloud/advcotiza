/**
 * Funciones globales de formateo para la aplicación
 */

/**
 * Formatea un monto monetario con separador de miles y dos decimales
 * @param {number} amount - El monto a formatear
 * @param {string} currency - Símbolo de moneda (por defecto '$')
 * @returns {string} - Monto formateado (ej: $1,250.00)
 */
export const formatCurrency = (amount, currency = '$') => {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return `${currency}0.00`;
  }
  
  // Convertir a número con 2 decimales
  const roundedAmount = Math.round(amount * 100) / 100;
  
  // Separar parte entera y decimal
  const [integerPart, decimalPart] = roundedAmount.toFixed(2).split('.');
  
  // Agregar separador de miles a la parte entera
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return `${currency}${formattedInteger}.${decimalPart}`;
};

/**
 * Formatea un monto monetario según estándar financiero mexicano
 * @param {number} amount - El monto a formatear
 * @returns {string} - Monto formateado con símbolo de peso mexicano
 */
export const formatMXN = (amount) => {
  return formatCurrency(amount, '$');
};

/**
 * Formatea un número con separador de miles
 * @param {number} number - El número a formatear
 * @param {number} decimals - Número de decimales (por defecto 0)
 * @returns {string} - Número formateado (ej: 1,250)
 */
export const formatNumber = (number, decimals = 0) => {
  if (typeof number !== 'number' || isNaN(number)) {
    return '0';
  }
  
  const roundedNumber = decimals > 0 ? Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals) : Math.round(number);
  const formattedNumber = decimals > 0 ? roundedNumber.toFixed(decimals) : roundedNumber.toString();
  
  const [integerPart, decimalPart] = formattedNumber.split('.');
  const formattedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  
  return decimalPart ? `${formattedInteger}.${decimalPart}` : formattedInteger;
};

/**
 * Formatea un porcentaje
 * @param {number} value - Valor del porcentaje (ej: 20 para 20%)
 * @param {number} decimals - Número de decimales (por defecto 1)
 * @returns {string} - Porcentaje formateado (ej: 20.0%)
 */
export const formatPercentage = (value, decimals = 1) => {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0.0%';
  }
  
  return `${value.toFixed(decimals)}%`;
};
