import React from 'react';
import { Car, Plus, Trash2, MapPin, Ticket, X } from 'lucide-react';
import { Input, Checkbox, Button } from './UI/Input';
import { Card, CardHeader, CardContent } from './UI/Card';

export const AdditionalServicesModule = ({ 
  transfers, 
  extras, 
  applyCommissionToExtras,
  onUpdateTransfers, 
  onAddExtra, 
  onUpdateExtra, 
  onRemoveExtra,
  onToggleCommissionOnExtras
}) => {
  return (
    <div className="space-y-6">
      {/* Traslado Estándar */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Car className="w-5 h-5 text-primary-600" />
            <h3 className="text-lg font-semibold text-gray-800">Traslado Estándar</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <Checkbox
                label="Aeropuerto - Hotel - Aeropuerto"
                checked={transfers.standard}
                onChange={(e) => onUpdateTransfers({ standard: e.target.checked })}
                className="font-medium"
              />
              {transfers.standard && (
                <Input
                  type="number"
                  value={transfers.standardPrice}
                  onChange={(e) => onUpdateTransfers({ standardPrice: parseFloat(e.target.value) || 0 })}
                  placeholder="Costo Neto"
                  className="w-32"
                />
              )}
            </div>
            {transfers.standard && (
              <div className="pl-6 text-sm text-gray-600">
                <MapPin className="w-4 h-4 inline mr-1" />
                Servicio completo de traslado: Recibo en aeropuerto, traslado al hotel, y regreso al aeropuerto para el vuelo de salida.
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Traslados Extras */}
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-2">
            <Car className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-semibold text-gray-800">Traslados Extras</h3>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Detalle de Traslados Extras
                  </label>
                  <textarea
                    value={transfers.extraDetail || ''}
                    onChange={(e) => onUpdateTransfers({ extraDetail: e.target.value })}
                    placeholder="Ej: Traslado a centro histórico, Tour por la zona hotelera, Visita a puntos turísticos, etc."
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Describa los servicios adicionales de traslado que se incluirán
                  </p>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Input
                    type="number"
                    value={transfers.extraPrice}
                    onChange={(e) => onUpdateTransfers({ extraPrice: parseFloat(e.target.value) || 0 })}
                    placeholder="Costo Neto"
                    className="w-32"
                  />
                  <span className="text-sm text-gray-600">Costo total de traslados extras</span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Ticket className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-800">Extras Adicionales</h3>
              <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium">
                {extras.length} elementos
              </span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={onAddExtra}
              className="flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar Extra</span>
            </Button>
          </div>
          <div className="mt-3 sm:mt-4 p-3 sm:p-4 bg-primary-50 border border-primary-200 rounded-lg transition-all duration-200 hover:bg-primary-100">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center space-x-3">
                <Checkbox
                  label="Aplicar comisión a extras"
                  checked={applyCommissionToExtras}
                  onChange={(e) => onToggleCommissionOnExtras(e.target.checked)}
                  className="font-medium text-primary-900"
                />
              </div>
              <div className="mt-2 sm:mt-0 sm:ml-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors ${
                  applyCommissionToExtras 
                    ? 'bg-secondary-100 text-secondary-800 border border-secondary-200' 
                    : 'bg-gray-100 text-gray-600 border border-gray-200'
                }`}>
                  {applyCommissionToExtras ? 'Con comisión' : 'Sin comisión'}
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-primary-700 mt-2 sm:mt-1 leading-relaxed">
              {applyCommissionToExtras 
                ? "La comisión de agencia se agregará al costo de los extras" 
                : "Los extras se sumarán al precio final como costo neto"}
            </p>
          </div>
        </CardHeader>
        <CardContent>
          {extras.length === 0 ? (
            <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <Ticket className="w-12 h-12 mx-auto mb-3 text-gray-400" />
              <p className="text-gray-500 mb-2">No hay extras agregados aún</p>
              <p className="text-sm text-gray-400">Agregue tours, parques u otras actividades</p>
            </div>
          ) : (
            <div className="space-y-3">
              {extras.map((extra, index) => (
                <ExtraItem
                  key={extra.id}
                  extra={extra}
                  onUpdate={onUpdateExtra}
                  onRemove={onRemoveExtra}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

const ExtraItem = ({ extra, onUpdate, onRemove }) => {
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate(extra.id, { image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUrl = (e) => {
    onUpdate(extra.id, { image: e.target.value });
  };

  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Image Section */}
        <div className="lg:col-span-1">
          {extra.image ? (
            <div className="relative">
              <img 
                src={extra.image} 
                alt={extra.name} 
                className="w-full h-32 object-cover rounded-lg"
              />
              <button
                onClick={() => onUpdate(extra.id, { image: null })}
                className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="w-full h-32 bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <Ticket className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                <p className="text-sm text-gray-500">Sin imagen</p>
              </div>
            </div>
          )}
          
          {/* Image Upload Controls */}
          <div className="mt-2 space-y-2">
            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-600">Subir:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="text-xs"
              />
            </div>
            <div className="flex items-center space-x-2">
              <label className="text-xs text-gray-600">URL:</label>
              <input
                type="url"
                value={extra.image || ''}
                onChange={handleImageUrl}
                placeholder="https://..."
                className="flex-1 text-xs px-2 py-1 border border-gray-300 rounded focus:border-primary-500 focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="lg:col-span-2 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <Input
              value={extra.name}
              onChange={(e) => onUpdate(extra.id, { name: e.target.value })}
              placeholder="Nombre del Tour/Actividad"
            />
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-600">$</span>
              <Input
                type="number"
                value={extra.price}
                onChange={(e) => onUpdate(extra.id, { price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button
              variant="danger"
              size="sm"
              onClick={() => onRemove(extra.id)}
              className="flex items-center space-x-1"
            >
              <Trash2 className="w-4 h-4" />
              <span>Eliminar</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
