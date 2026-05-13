import React, { useState, useEffect, useCallback } from 'react';
import clsx from 'clsx';
import { Plane, Calendar, DollarSign, Info, MapPin } from 'lucide-react';
import { Input, Checkbox, Button } from './UI/Input';
import { Card, CardHeader, CardContent } from './UI/Card';
import { Accordion, AccordionGroup } from './UI/Accordion';
import { createCurrencyBlurHandler, createCurrencyChangeHandler, formatInputValue } from '../utils/currencyUtils';

// Función para verificar si un vuelo tiene datos significativos (movida fuera del componente)
const flightHasData = (flight) => {
  return (
    flight.airline ||
    flight.price > 0 ||
    flight.route.origin ||
    flight.route.destination ||
    flight.outbound.date ||
    flight.outbound.departureTime ||
    flight.outbound.arrivalTime ||
    flight.return.date ||
    flight.return.departureTime ||
    flight.return.arrivalTime ||
    flight.luggageDetail
  );
};

export const FlightModule = ({ flights, onUpdateFlight, onSelectFlight, passengers, onDurationChange }) => {
  const [dateErrors, setDateErrors] = useState({});
  // Initialize with first flight expanded to avoid useEffect
  const [expandedFlights, setExpandedFlights] = useState(() => {
    if (flights && flights.length > 0) {
      return { [flights[0].id]: true };
    }
    return {};
  });

  
  
  // Función para manejar cambio de estado de acordeón (memoizada)
  const handleAccordionToggle = useCallback((flightId, isExpanded) => {
    setExpandedFlights(prev => {
      if (prev[flightId] === isExpanded) {
        return prev; // No actualizar si no hay cambio
      }
      return {
        ...prev,
        [flightId]: isExpanded
      };
    });
  }, []);

  // Función para calcular duración del viaje con manejo robusto
  const calculateDuration = (departureTime, arrivalTime) => {
    if (!departureTime || !arrivalTime) return '';
    
    try {
      const [depHours, depMinutes] = departureTime.split(':').map(Number);
      const [arrHours, arrMinutes] = arrivalTime.split(':').map(Number);
      
      // Validar que las horas y minutos sean válidos
      if (isNaN(depHours) || isNaN(depMinutes) || isNaN(arrHours) || isNaN(arrMinutes)) {
        return '';
      }
      
      if (depHours < 0 || depHours > 23 || arrHours < 0 || arrHours > 23 ||
          depMinutes < 0 || depMinutes > 59 || arrMinutes < 0 || arrMinutes > 59) {
        return '';
      }
      
      // Calcular minutos totales desde medianoche
      const depTotalMinutes = depHours * 60 + depMinutes;
      const arrTotalMinutes = arrHours * 60 + arrMinutes;
      
      // Calcular duración con manejo correcto de cruce de medianoche
      let durationMinutes;
      if (arrTotalMinutes >= depTotalMinutes) {
        // Llegada el mismo día
        durationMinutes = arrTotalMinutes - depTotalMinutes;
      } else {
        // Llegada al día siguiente (ej: 22:00 -> 02:00)
        durationMinutes = (24 * 60 - depTotalMinutes) + arrTotalMinutes;
      }
      
      // Validar duración mínima (10 minutos) y máxima (24 horas)
      if (durationMinutes < 10 || durationMinutes > 24 * 60) {
        return '';
      }
      
      const hours = Math.floor(durationMinutes / 60);
      const minutes = durationMinutes % 60;
      
      // Formato mejorado: HH:mm o Xh Ymin
      if (hours === 0) {
        return `${minutes}min`;
      } else if (minutes === 0) {
        return `${hours}h 00min`;
      } else {
        return `${hours}h ${minutes.toString().padStart(2, '0')}min`;
      }
    } catch (error) {
      console.error('Error calculating duration:', error);
      return '';
    }
  };

  
  // Función para calcular días y noches del viaje completo
  const calculateTripDuration = () => {
    const selectedFlight = flights.find(f => f.selected);
    if (!selectedFlight) {
      return { days: 0, nights: 0, valid: false };
    }
    
    if (!selectedFlight.outbound.date || !selectedFlight.return.date) {
      return { days: 0, nights: 0, valid: false };
    }
    
    const departure = new Date(selectedFlight.outbound.date);
    const returnDate = new Date(selectedFlight.return.date);
    
    // Validar que las fechas sean válidas
    if (isNaN(departure.getTime()) || isNaN(returnDate.getTime())) {
      return { days: 0, nights: 0, valid: false };
    }
    
    // Validar que la fecha de regreso sea posterior a la de salida
    if (returnDate <= departure) {
      return { days: 0, nights: 0, valid: false };
    }
    
    const diffTime = Math.abs(returnDate - departure);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    // Lógica inclusiva: Días = diferencia + 1, Noches = diferencia exacta
    // Ej: Del 13 al 20 de junio = 8 días / 7 noches
    return {
      days: diffDays + 1,
      nights: diffDays,
      valid: true
    };
  };

  // Efecto para notificar cambios en la duración del viaje - simplificado
  useEffect(() => {
    if (onDurationChange) {
      const selectedFlight = flights.find(f => f.selected);
      if (selectedFlight && selectedFlight.outbound.date && selectedFlight.return.date) {
        const duration = calculateTripDuration();
        onDurationChange(duration);
      }
    }
  }, [flights.length, onDurationChange]); // Dependencias estables

  const handleFlightUpdate = useCallback((flightId, field, value) => {
    onUpdateFlight(flightId, { [field]: value });
    
    // Inteligencia de fechas: si cambia la fecha de salida de ida, actualizar regreso automáticamente
    if (field === 'outbound.date' && value) {
      const outboundDate = new Date(value);
      const nextDay = new Date(outboundDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const returnDateStr = nextDay.toISOString().split('T')[0];
      onUpdateFlight(flightId, { 'return.date': returnDateStr });
      
      // Limpiar error si existía
      setDateErrors(prev => ({ ...prev, [flightId]: null }));
    }
    
    // Inteligencia de rutas: si cambia origen o destino, actualizar ambos tramos
    if (field === 'route.origin' || field === 'route.destination') {
      // Usar callback para obtener el estado actual de flights sin depender de él
      setTimeout(() => {
        // Esta lógica se manejará en el componente padre para evitar dependencias circulares
      }, 0);
    }
    
    // Calcular duración automáticamente si cambian horas
    if (field === 'outbound.departureTime' || field === 'outbound.arrivalTime') {
      setTimeout(() => {
        // Esta lógica se manejará en el componente padre para evitar dependencias circulares
      }, 0);
    }
    
    if (field === 'return.departureTime' || field === 'return.arrivalTime') {
      setTimeout(() => {
        // Esta lógica se manejará en el componente padre para evitar dependencias circulares
      }, 0);
    }
  }, [onUpdateFlight]);

  const formatDate = useCallback((dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }, []);

  const validateDates = useCallback((flightId) => {
    // Obtener el vuelo actual sin depender del array flights
    const flightElements = document.querySelectorAll(`[data-flight-id="${flightId}"]`);
    
    // Validación básica sin dependencias circulares
    setDateErrors(prev => {
      const newErrors = { ...prev };
      
      // Limpiar errores anteriores para este vuelo
      delete newErrors[flightId];
      delete newErrors[flightId + '_outbound_time'];
      delete newErrors[flightId + '_return_time'];
      
      return newErrors;
    });
    
    return false;
  }, []);

  // Componente de tabla de itinerario
  const FlightItineraryTable = ({ flight, isSelected, index }) => {
    const formatDateForTable = (dateString) => {
      if (!dateString) return '';
      // Parsear la fecha como local para evitar desfase UTC
      const [year, month, day] = dateString.split('-').map(Number);
      const date = new Date(year, month - 1, day);
      return date.toLocaleDateString('es-MX', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    };

return (
    <table className="flight-table w-full border-collapse border border-gray-300 text-xs">
      <thead>
        <tr className="bg-gray-100">
          <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Ruta (Escalas)</th>
          <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Fecha</th>
          <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Hora Salida</th>
          <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Hora Llegada</th>
          <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Duración del viaje</th>
          <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Equipaje</th>
        </tr>
      </thead>
      <tbody>
        {/* Tramo de Ida */}
        <tr className={clsx('hover:bg-blue-50', isSelected && 'bg-blue-50')}>
          <td className="px-4 py-3 text-sm border border-gray-300">
            <div className="font-medium text-blue-700">
              {flight.outbound.origin || flight.route.origin} → {flight.outbound.destination || flight.route.destination}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {flight.outbound.stops || 'Vuelo Directo'}
            </div>
          </td>
          <td className="px-4 py-3 text-sm border border-gray-300">
            {formatDateForTable(flight.outbound.date)}
          </td>
          <td className="px-4 py-3 text-sm border border-gray-300">
            {flight.outbound.departureTime || '--:--'}
          </td>
          <td className="px-4 py-3 text-sm border border-gray-300">
            {flight.outbound.arrivalTime || '--:--'}
          </td>
          <td className="px-4 py-3 text-sm border border-gray-300">
            <div className="flex flex-col">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                {flight.outbound.duration || '--'}
              </span>
              {flight.outbound.duration && (
                <span className="text-xs text-gray-500 mt-1 italic">
                  *Calculado en base a horas locales
                </span>
              )}
            </div>
          </td>
          <td className="px-4 py-3 text-sm border border-gray-300" rowSpan="2">
            <div className="text-xs text-gray-700">
              {flight.luggageDetail || 'No especificado'}
            </div>
          </td>
        </tr>
        
        {/* Tramo de Regreso */}
        <tr className={clsx('hover:bg-red-50', isSelected && 'bg-red-50')}>
          <td className="px-4 py-3 text-sm border border-gray-300">
            <div className="font-medium text-red-700">
              {flight.return.origin || flight.route.destination} → {flight.return.destination || flight.route.origin}
            </div>
            <div className="text-xs text-gray-600 mt-1">
              {flight.return.stops || 'Vuelo Directo'}
            </div>
          </td>
          <td className="px-4 py-3 text-sm border border-gray-300">
            {formatDateForTable(flight.return.date)}
          </td>
          <td className="px-4 py-3 text-sm border border-gray-300">
            {flight.return.departureTime || '--:--'}
          </td>
          <td className="px-4 py-3 text-sm border border-gray-300">
            {flight.return.arrivalTime || '--:--'}
          </td>
          <td className="px-4 py-3 text-sm border border-gray-300">
            <div className="flex flex-col">
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {flight.return.duration || '--'}
              </span>
              {flight.return.duration && (
                <span className="text-xs text-gray-500 mt-1 italic">
                  *Calculado en base a horas locales
                </span>
              )}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  );
};

  return (
    <div className="space-y-4">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Plane className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-800">Opciones de Vuelo</h3>
        </div>
      </CardHeader>

      <CardContent>
        <AccordionGroup>
          {flights.map((flight, index) => (
            <Accordion
              key={flight.id}
              id={flight.id}
              title={
                <div className="flex items-center space-x-3">
                  <span className="font-medium">Opción {index + 1}</span>
                  {flight.selected && (
                    <div className="bg-primary-500 text-white rounded-full p-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {flight.airline && (
                    <span className="text-sm text-gray-600">{flight.airline}</span>
                  )}
                </div>
              }
              defaultExpanded={index === 0} // Solo la primera opción expandida por defecto
              isExpanded={expandedFlights[flight.id]} // Estado controlado
              hasData={flightHasData(flight)}
              onToggle={handleAccordionToggle}
              className={clsx(
                'border-2 transition-all duration-200 flight-card',
                flight.selected ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
              )}
              headerClassName={clsx(
                flight.selected ? 'bg-primary-50' : 'bg-gray-50'
              )}
            >
              {/* Botón de selección */}
              <div className="flex justify-end mb-4">
                <Button
                  variant={flight.selected ? "default" : "outline"}
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectFlight(flight.id);
                  }}
                  className="flex items-center space-x-2"
                >
                  {flight.selected ? (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      <span>Seleccionado</span>
                    </>
                  ) : (
                    <>
                      <span>Seleccionar Opción</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Tabla de Itinerario */}
              <div className="mb-6">
                <FlightItineraryTable flight={flight} isSelected={flight.selected} index={index} />
              </div>

              {/* Formulario de edición */}
              <div className="space-y-4 border-t pt-4" onClick={(e) => e.stopPropagation()}>
                  {/* RUTA PRINCIPAL */}
                  <div className="bg-gradient-to-r from-blue-50 to-red-50 p-4 rounded-lg border border-blue-200">
                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                      Configurar Ruta
                    </h5>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Origen
                        </label>
                        <input
                          type="text"
                          value={flight.route.origin}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleFlightUpdate(flight.id, 'route.origin', e.target.value);
                          }}
                          placeholder="Ej: QRO"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Destino
                        </label>
                        <input
                          type="text"
                          value={flight.route.destination}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleFlightUpdate(flight.id, 'route.destination', e.target.value);
                          }}
                          placeholder="Ej: MCO"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>
                    {flight.route.origin && flight.route.destination && (
                      <div className="mt-3 text-center">
                        <span className="text-lg font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-red-600">
                          {flight.route.origin} ↔ {flight.route.destination}
                        </span>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Aerolínea</label>
                    <input
                      type="text"
                      value={flight.airline}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleFlightUpdate(flight.id, 'airline', e.target.value);
                      }}
                      placeholder="Ingrese el nombre de la aerolínea"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      onClick={(e) => e.stopPropagation()}
                    />
                  </div>

                  {/* TRAMO DE IDA */}
                  <div className="border-l-4 border-blue-500 pl-4">
                  
                    
                    <div className="text-sm font-medium text-blue-600 mb-3 text-center">
                      {flight.outbound.origin && flight.outbound.destination ? 
                        `${flight.outbound.origin} → ${flight.outbound.destination}` : 
                        'ITINERARIO DE IDA'
                      }
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          Fecha de Salida
                        </label>
                        <input
                          type="date"
                          value={flight.outbound.date}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleFlightUpdate(flight.id, 'outbound.date', e.target.value);
                          }}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          onClick={(e) => e.stopPropagation()}
                          min={new Date().toISOString().split('T')[0]}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Info className="w-4 h-4 inline mr-1" />
                          Escalas
                        </label>
                        <input
                          type="text"
                          value={flight.outbound.stops}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleFlightUpdate(flight.id, 'outbound.stops', e.target.value);
                          }}
                          placeholder="Vuelo Directo o 1 escala en Madrid"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Plane className="w-4 h-4 inline mr-1" />
                          Hora de Salida
                        </label>
                        <input
                          type="time"
                          value={flight.outbound.departureTime}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleFlightUpdate(flight.id, 'outbound.departureTime', e.target.value);
                            validateDates(flight.id);
                          }}
                          className={clsx(
                            "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                            dateErrors[flight.id + '_outbound_time'] ? "border-red-300" : "border-gray-300"
                          )}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {dateErrors[flight.id + '_outbound_time'] && (
                          <p className="text-xs text-red-600 mt-1">{dateErrors[flight.id + '_outbound_time']}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Plane className="w-4 h-4 inline mr-1" />
                          Hora de Llegada
                        </label>
                        <input
                          type="time"
                          value={flight.outbound.arrivalTime}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleFlightUpdate(flight.id, 'outbound.arrivalTime', e.target.value);
                            validateDates(flight.id);
                          }}
                          className={clsx(
                            "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                            dateErrors[flight.id + '_outbound_time'] ? "border-red-300" : "border-gray-300"
                          )}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Info className="w-4 h-4 inline mr-1" />
                        Duración del Vuelo
                      </label>
                      <input
                        type="text"
                        value={flight.outbound.duration}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleFlightUpdate(flight.id, 'outbound.duration', e.target.value);
                        }}
                        placeholder="Ej: 2h 30m o Directo - 3h"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Especifica la duración del vuelo (ej: 2h 30m, Directo, 1 escala 45m)
                      </p>
                    </div>

                                      </div>

                  {/* TRAMO DE REGRESO */}
                  <div className="border-l-4 border-red-500 pl-4">
                  
                    
                    <div className="text-sm font-medium text-red-600 mb-3 text-center">
                      {flight.return.origin && flight.return.destination ? 
                        `${flight.return.origin} → ${flight.return.destination}` : 
                        'ITINERARIO DE REGRESO'
                      }
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Calendar className="w-4 h-4 inline mr-1" />
                          Fecha de Regreso
                        </label>
                        <input
                          type="date"
                          value={flight.return.date}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleFlightUpdate(flight.id, 'return.date', e.target.value);
                            validateDates(flight.id);
                          }}
                          className={clsx(
                            "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                            dateErrors[flight.id] ? "border-red-300" : "border-gray-300"
                          )}
                          onClick={(e) => e.stopPropagation()}
                          min={flight.outbound.date || new Date().toISOString().split('T')[0]}
                        />
                        {dateErrors[flight.id] && (
                          <p className="text-xs text-red-600 mt-1">{dateErrors[flight.id]}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Info className="w-4 h-4 inline mr-1" />
                          Escalas
                        </label>
                        <input
                          type="text"
                          value={flight.return.stops}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleFlightUpdate(flight.id, 'return.stops', e.target.value);
                          }}
                          placeholder="Vuelo Directo o 1 escala en Ciudad de México"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Plane className="w-4 h-4 inline mr-1" />
                          Hora de Salida
                        </label>
                        <input
                          type="time"
                          value={flight.return.departureTime}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleFlightUpdate(flight.id, 'return.departureTime', e.target.value);
                            validateDates(flight.id);
                          }}
                          className={clsx(
                            "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                            dateErrors[flight.id + '_return_time'] ? "border-red-300" : "border-gray-300"
                          )}
                          onClick={(e) => e.stopPropagation()}
                        />
                        {dateErrors[flight.id + '_return_time'] && (
                          <p className="text-xs text-red-600 mt-1">{dateErrors[flight.id + '_return_time']}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          <Plane className="w-4 h-4 inline mr-1" />
                          Hora de Llegada
                        </label>
                        <input
                          type="time"
                          value={flight.return.arrivalTime}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleFlightUpdate(flight.id, 'return.arrivalTime', e.target.value);
                            validateDates(flight.id);
                          }}
                          className={clsx(
                            "w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent",
                            dateErrors[flight.id + '_return_time'] ? "border-red-300" : "border-gray-300"
                          )}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <Info className="w-4 h-4 inline mr-1" />
                        Duración del Vuelo
                      </label>
                      <input
                        type="text"
                        value={flight.return.duration}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleFlightUpdate(flight.id, 'return.duration', e.target.value);
                        }}
                        placeholder="Ej: 3h 15m o Directo - 2h"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        onClick={(e) => e.stopPropagation()}
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Especifica la duración del vuelo (ej: 3h 15m, Directo, 1 escala 30m)
                      </p>
                    </div>

                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        <MapPin className="w-4 h-4 inline mr-1" />
                        Escalas
                      </label>
                      <input
                        type="text"
                        value={flight.return.stops}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleFlightUpdate(flight.id, 'return.stops', e.target.value);
                        }}
                        placeholder="Vuelo Directo o 1 escala en Ciudad de México"
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                        onClick={(e) => e.stopPropagation()}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <DollarSign className="w-4 h-4 inline mr-1" />
                      Precio por Pasajero (Costo Neto)
                    </label>
                    <input
                      type="text"
                      value={formatInputValue(flight.price)}
                      onChange={(e) => {
                        e.stopPropagation();
                        const value = e.target.value;
                        // Permitir entrada libre durante la escritura
                        handleFlightUpdate(flight.id, 'price', value === '' ? 0 : parseFloat(value) || 0);
                      }}
                      onBlur={(e) => {
                        e.stopPropagation();
                        const cleanedValue = parseFloat(e.target.value) || 0;
                        const formattedValue = formatInputValue(cleanedValue);
                        
                        // Actualizar el estado con el valor numérico limpio
                        handleFlightUpdate(flight.id, 'price', cleanedValue);
                        
                        // Actualizar el input con el valor formateado
                        e.target.value = formattedValue;
                      }}
                      placeholder="0.00"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent cursor-text"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Ingresa el costo neto por pasajero (sin comisión)
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      <Info className="w-4 h-4 inline mr-1" />
                      Detalle de Equipaje
                    </label>
                    <textarea
                      value={flight.luggageDetail}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleFlightUpdate(flight.id, 'luggageDetail', e.target.value);
                      }}
                      placeholder="Ej: Maleta de 25kg + Objeto personal, Equipaje de mano, etc."
                      rows={2}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Describa qué incluye el plan de equipaje para cada pasajero
                    </p>
                  </div>

                  {flight.price > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Subtotal ({passengers.length} pasajeros):</span>
                        <span className="font-semibold text-gray-800">
                          ${(flight.price * passengers.length).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-base font-semibold pt-2 border-t">
                        <span>Total Neto:</span>
                        <span className="text-primary-600">
                          ${(flight.price * passengers.length).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
            </Accordion>
          ))}
        </AccordionGroup>
      </CardContent>
    </div>
  );
};
