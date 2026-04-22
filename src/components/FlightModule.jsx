import React, { useState } from 'react';
import clsx from 'clsx';
import { Plane, Calendar, DollarSign, Info, MapPin } from 'lucide-react';
import { Input, Checkbox, Button } from './UI/Input';
import { Card, CardHeader, CardContent } from './UI/Card';

export const FlightModule = ({ flights, onUpdateFlight, onSelectFlight, passengers }) => {
  const [dateErrors, setDateErrors] = useState({});

  const handleFlightUpdate = (flightId, field, value) => {
    onUpdateFlight(flightId, { [field]: value });
    
    // Inteligencia de fechas: si cambia la fecha de salida de ida, actualizar regreso automáticamente
    if (field === 'outbound.date' && value) {
      const departureDate = new Date(value);
      const nextDay = new Date(departureDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      const returnDateStr = nextDay.toISOString().split('T')[0];
      onUpdateFlight(flightId, { 'return.date': returnDateStr });
      
      // Limpiar error si existía
      setDateErrors(prev => ({ ...prev, [flightId]: null }));
    }
    
    // Si se actualiza la ruta, propagar a los tramos
    if (field === 'route.origin' || field === 'route.destination') {
      const flight = flights.find(f => f.id === flightId);
      if (flight) {
        const origin = field === 'route.origin' ? value : flight.route.origin;
        const destination = field === 'route.destination' ? value : flight.route.destination;
        
        // Actualizar tramos con la nueva ruta
        onUpdateFlight(flightId, { 
          'outbound.origin': origin,
          'outbound.destination': destination,
          'return.origin': destination, // Invertido para el regreso
          'return.destination': origin   // Invertido para el regreso
        });
      }
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const validateDates = (flightId) => {
    const flight = flights.find(f => f.id === flightId);
    if (flight.outbound.date && flight.return.date) {
      const departure = new Date(flight.outbound.date);
      const returnDate = new Date(flight.return.date);
      
      if (returnDate <= departure) {
        setDateErrors(prev => ({ 
          ...prev, 
          [flightId]: 'La fecha de regreso debe ser posterior a la fecha de salida' 
        }));
        return false;
      }
    }
    
    // Validar horas de llegada vs salida
    if (flight.outbound.departureTime && flight.outbound.arrivalTime) {
      const [depHours, depMinutes] = flight.outbound.departureTime.split(':').map(Number);
      const [arrHours, arrMinutes] = flight.outbound.arrivalTime.split(':').map(Number);
      
      const depTotalMinutes = depHours * 60 + depMinutes;
      const arrTotalMinutes = arrHours * 60 + arrMinutes;
      
      if (arrTotalMinutes <= depTotalMinutes) {
        setDateErrors(prev => ({ 
          ...prev, 
          [flightId + '_outbound_time']: 'La hora de llegada debe ser posterior a la hora de salida' 
        }));
        return false;
      }
    }
    
    if (flight.return.departureTime && flight.return.arrivalTime) {
      const [depHours, depMinutes] = flight.return.departureTime.split(':').map(Number);
      const [arrHours, arrMinutes] = flight.return.arrivalTime.split(':').map(Number);
      
      const depTotalMinutes = depHours * 60 + depMinutes;
      const arrTotalMinutes = arrHours * 60 + arrMinutes;
      
      if (arrTotalMinutes <= depTotalMinutes) {
        setDateErrors(prev => ({ 
          ...prev, 
          [flightId + '_return_time']: 'La hora de llegada debe ser posterior a la hora de salida' 
        }));
        return false;
      }
    }
    
    setDateErrors(prev => ({ ...prev, [flightId]: null, [flightId + '_outbound_time']: null, [flightId + '_return_time']: null }));
    return true;
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {flights.map((flight, index) => (
            <Card
              key={flight.id}
              className={clsx(
                'cursor-pointer transition-all duration-200 border-2',
                flight.selected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300'
              )}
              onClick={() => onSelectFlight(flight.id)}
            >
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <h4 className="font-semibold text-gray-800">Opción {index + 1}</h4>
                  {flight.selected && (
                    <div className="bg-primary-500 text-white rounded-full p-1">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  {/* RUTA PRINCIPAL */}
                  <div className="bg-gradient-to-r from-blue-50 to-red-50 p-4 rounded-lg border border-blue-200">
                    <h5 className="font-semibold text-gray-800 mb-3 flex items-center">
                      <MapPin className="w-4 h-4 mr-2 text-blue-600" />
                      Detalles de vuelo
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
                          Duración
                        </label>
                        <input
                          type="text"
                          value={flight.outbound.duration}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleFlightUpdate(flight.id, 'outbound.duration', e.target.value);
                          }}
                          placeholder="Ej: 2h 30m"
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
                        <MapPin className="w-4 h-4 inline mr-1" />
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
                          Duración
                        </label>
                        <input
                          type="text"
                          value={flight.return.duration}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleFlightUpdate(flight.id, 'return.duration', e.target.value);
                          }}
                          placeholder="Ej: 3h 15m"
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
                      type="number"
                      value={flight.price}
                      onChange={(e) => {
                        e.stopPropagation();
                        handleFlightUpdate(flight.id, 'price', parseFloat(e.target.value) || 0);
                      }}
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      onClick={(e) => e.stopPropagation()}
                    />
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
              </CardContent>
            </Card>
          ))}
        </div>
      </CardContent>
    </div>
  );
};
