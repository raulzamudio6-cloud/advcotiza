import React from 'react';
import clsx from 'clsx';
import { Eye, DollarSign, Plane, Hotel, Car, Ticket, Users, Calendar, Star, Percent, Briefcase, Phone, Mail, Instagram, Facebook } from 'lucide-react';
import { Card, CardHeader, CardContent } from './UI/Card';
import { formatMXN } from '../utils/formatters';
import { useAgencyConfig } from '../contexts/AgencyConfigContext';

export const PreviewPanel = ({ state, calculations, tripDuration }) => {
  const { agencyConfig, loading } = useAgencyConfig();
  const selectedFlight = calculations.selectedFlight;
  const selectedAccommodation = calculations.selectedAccommodation;
  const { passengers, additionalServices } = state;

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificado';
    // Parsear la fecha como local para evitar desfase UTC
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-MX', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return formatMXN(amount);
  };

  return (
    <div className="space-y-4">
      {/* Agency Header */}
      {!loading && (
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
          <div className="flex items-start space-x-4">
            {/* Logo */}
            <div className="flex-shrink-0">
              {agencyConfig.logoUrl ? (
                <img 
                  src={agencyConfig.logoUrl} 
                  alt={agencyConfig.agencyName}
                  className="w-16 h-16 object-contain rounded-lg border border-gray-200"
                />
              ) : (
                <div className="w-16 h-16 bg-primary-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-8 h-8 text-primary-600" />
                </div>
              )}
            </div>
            
            {/* Agency Info */}
            <div className="flex-1 min-w-0">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {agencyConfig.agencyName}
              </h2>
              
              {/* Contact Information */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4 text-primary-500" />
                  <span>{agencyConfig.contact.phone}</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <Mail className="w-4 h-4 text-primary-500" />
                  <span>{agencyConfig.contact.email}</span>
                </div>
              </div>
              
              {/* Social Media */}
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-1 text-gray-600">
                  <Instagram className="w-4 h-4 text-pink-500" />
                  <span>{agencyConfig.socialMedia.instagram}</span>
                </div>
                <div className="flex items-center space-x-1 text-gray-600">
                  <Facebook className="w-4 h-4 text-blue-600" />
                  <span>{agencyConfig.socialMedia.facebook}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Título Dinámico */}
      {state.quotationTitle && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-blue-600 to-red-600 text-white p-4 rounded-lg">
            <h2 className="text-xl font-bold text-center">{state.quotationTitle}</h2>
            {tripDuration && tripDuration.valid && (
              <p className="text-center text-sm italic mt-2 opacity-90">
                {tripDuration.days} Días / {tripDuration.nights} Noches
              </p>
            )}
          </div>
        </div>
      )}

      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Eye className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-800">Vista Previa</h3>
          </div>
          <div className="text-sm text-gray-500">
            Actualizada en tiempo real
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Client Information */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-800 mb-2 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Información del Cliente
          </h4>
          <div className="bg-gray-50 p-3 rounded-lg space-y-1">
            <p className="text-sm"><span className="font-medium">Nombre:</span> {state.clientInfo.name || 'No especificado'}</p>
            <p className="text-sm"><span className="font-medium">Correo:</span> {state.clientInfo.email || 'No especificado'}</p>
            <p className="text-sm"><span className="font-medium">Teléfono:</span> {state.clientInfo.phone || 'No especificado'}</p>
          </div>
        </div>

        {/* Passengers Summary */}
        <div className="mb-6">
          <h4 className="font-medium text-gray-800 mb-2 flex items-center">
            <Users className="w-4 h-4 mr-2" />
            Pasajeros ({passengers.length})
          </h4>
          <div className="bg-gray-50 p-3 rounded-lg">
            {passengers.length === 0 ? (
              <p className="text-sm text-gray-500">No hay pasajeros agregados</p>
            ) : (
              <div className="space-y-1">
                {passengers.map((passenger, index) => (
                  <div key={passenger.id} className="text-sm">
                    <span className="font-medium">{index + 1}. {passenger.name || 'Sin nombre'}</span>
                    {passenger.isMinor && (
                      <span className="ml-2 text-blue-600 text-xs">(Edad: {passenger.age || 'No especificado'})</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Selected Flight */}
        {selectedFlight && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 mb-2 flex items-center">
              <Plane className="w-4 h-4 mr-2" />
              Vuelo Seleccionado
            </h4>
            <div className="bg-primary-50 border border-primary-200 p-3 rounded-lg">
              <div className="space-y-3">
                <p className="text-sm"><span className="font-medium">Aerolínea:</span> {selectedFlight.airline || 'No especificado'}</p>
                
                {/* Tramo de Ida */}
                <div className="border-l-4 border-primary-500 pl-3">
                  <p className="text-sm font-semibold text-primary-700">TRAMO DE IDA</p>
                  <p className="text-sm"><span className="font-medium">Fecha:</span> {formatDate(selectedFlight.outbound.date)}</p>
                  {selectedFlight.outbound.departureTime && selectedFlight.outbound.arrivalTime && (
                    <p className="text-sm"><span className="font-medium">Horario:</span> {selectedFlight.outbound.departureTime} - {selectedFlight.outbound.arrivalTime}</p>
                  )}
                  {selectedFlight.outbound.duration && (
                    <p className="text-sm"><span className="font-medium">Duración:</span> {selectedFlight.outbound.duration}</p>
                  )}
                  {selectedFlight.outbound.stops && (
                    <p className="text-sm"><span className="font-medium">Escalas:</span> {selectedFlight.outbound.stops}</p>
                  )}
                </div>
                
                {/* Tramo de Regreso */}
                <div className="border-l-4 border-secondary-500 pl-3">
                  <p className="text-sm font-semibold text-secondary-700">TRAMO DE REGRESO</p>
                  <p className="text-sm"><span className="font-medium">Fecha:</span> {formatDate(selectedFlight.return.date)}</p>
                  {selectedFlight.return.departureTime && selectedFlight.return.arrivalTime && (
                    <p className="text-sm"><span className="font-medium">Horario:</span> {selectedFlight.return.departureTime} - {selectedFlight.return.arrivalTime}</p>
                  )}
                  {selectedFlight.return.duration && (
                    <p className="text-sm"><span className="font-medium">Duración:</span> {selectedFlight.return.duration}</p>
                  )}
                  {selectedFlight.return.stops && (
                    <p className="text-sm"><span className="font-medium">Escalas:</span> {selectedFlight.return.stops}</p>
                  )}
                </div>
                
                {selectedFlight.luggageDetail && (
                  <p className="text-sm text-green-600"><span className="font-medium">â</span> {selectedFlight.luggageDetail}</p>
                )}
                <p className="text-sm font-semibold text-primary-700">
                  Total Cliente: {formatCurrency(calculations.flightTotal())}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Selected Accommodation */}
        {selectedAccommodation && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 mb-2 flex items-center">
              <Hotel className="w-4 h-4 mr-2" />
              Hotel Seleccionado
            </h4>
            <div className="bg-primary-50 border border-primary-200 p-3 rounded-lg">
              <div className="space-y-1">
                <p className="text-sm font-medium">{selectedAccommodation.name || 'No especificado'}</p>
                <div className="flex items-center">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className={clsx(
                        'w-3 h-3',
                        i < selectedAccommodation.category ? 'text-yellow-400 fill-current' : 'text-gray-300'
                      )}
                    />
                  ))}
                  <span className="ml-1 text-xs text-gray-600">({selectedAccommodation.category} estrellas)</span>
                </div>
                {selectedAccommodation.description && (
                  <p className="text-xs text-gray-600 mt-1">{selectedAccommodation.description}</p>
                )}
                <p className="text-sm font-semibold text-primary-700">
                  Total Cliente: {formatCurrency(calculations.accommodationTotal())}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Additional Services */}
        {(additionalServices.transfers.standard || additionalServices.transfers.extraPrice > 0 || additionalServices.extras.length > 0) && (
          <div className="mb-6">
            <h4 className="font-medium text-gray-800 mb-2 flex items-center">
              <Ticket className="w-4 h-4 mr-2" />
              Servicios Adicionales
            </h4>
            <div className="bg-gray-50 p-3 rounded-lg space-y-2">
              {additionalServices.transfers.standard && (
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center">
                    <Car className="w-3 h-3 mr-1" />
                    Traslado Estándar (Aeropuerto-Hotel-Aeropuerto)
                  </span>
                  <span className="font-medium">{formatCurrency(additionalServices.transfers.standardPrice * (1 + state.commissionRate / 100))}</span>
                </div>
              )}
              {additionalServices.transfers.extraPrice > 0 && (
                <div className="flex justify-between items-center text-sm">
                  <span className="flex items-center">
                    <Car className="w-3 h-3 mr-1" />
                    Traslados Extras
                  </span>
                  <span className="font-medium">{formatCurrency(additionalServices.transfers.extraPrice * (1 + state.commissionRate / 100))}</span>
                </div>
              )}
              {additionalServices.extras.map((extra) => (
                <div key={extra.id} className="flex justify-between items-center text-sm">
                  <span className="flex items-center">
                    <Ticket className="w-3 h-3 mr-1" />
                    {extra.name || 'Servicio adicional'}
                  </span>
                  <span className="font-medium">{formatCurrency(extra.price * (1 + state.commissionRate / 100))}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Commission Breakdown */}
        {calculations.netGrandTotal() > 0 && (
          <div className="mb-6 bg-blue-50 border border-blue-200 p-3 rounded-lg">
            <h4 className="font-medium text-gray-800 mb-2 flex items-center">
              <Percent className="w-4 h-4 mr-2 text-blue-600" />
              Desglose de Comisión ({state.commissionRate}%)
            </h4>
            <div className="space-y-1">
              <div className="flex justify-between items-center text-sm">
                <span>Costo Neto:</span>
                <span className="font-medium">{formatCurrency(calculations.netGrandTotal())}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Comisión:</span>
                <span className="font-medium text-blue-600">{formatCurrency(calculations.commissionAmount())}</span>
              </div>
            </div>
          </div>
        )}

        {/* Total Summary */}
        <div className="border-t pt-4">
          <div className="space-y-2">
            <div className="flex justify-between items-center text-sm">
              <span>Total Vuelos:</span>
              <span>{formatCurrency(calculations.flightTotal())}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Total Hospedaje:</span>
              <span>{formatCurrency(calculations.accommodationTotal())}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span>Total Servicios:</span>
              <span>{formatCurrency(calculations.transfersTotal() + calculations.extrasTotal())}</span>
            </div>
            <div className="flex justify-between items-center text-lg font-bold border-t pt-2">
              <span className="flex items-center">
                <DollarSign className="w-5 h-5 mr-1 text-green-600" />
                Inversión Total:
              </span>
              <span className="text-green-600">{formatCurrency(calculations.grandTotal())}</span>
            </div>
          </div>
        </div>

        {/* Agency Policies */}
        {!loading && agencyConfig.policies && agencyConfig.policies.length > 0 && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <h4 className="font-semibold text-gray-800 mb-3 flex items-center">
              <Briefcase className="w-4 h-4 mr-2 text-primary-600" />
              Políticas de la Agencia
            </h4>
            <div className="bg-gray-50 rounded-lg p-4">
              <ul className="space-y-2">
                {agencyConfig.policies.map((policy, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <span className="text-primary-500 mr-2 mt-1">•</span>
                    <span>{policy}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </CardContent>
    </div>
  );
};
