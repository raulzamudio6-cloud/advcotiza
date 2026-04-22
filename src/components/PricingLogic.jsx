import React from 'react';
import { Percent, DollarSign } from 'lucide-react';
import { Input } from './UI/Input';
import { Card, CardHeader, CardContent } from './UI/Card';

export const PricingLogic = ({ commissionRate, onChange, calculations }) => {
  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(amount);
  };

  return (
    <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Percent className="w-5 h-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-800">Configuración de Comisión</h3>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Input
              label="% de Comisión de Agencia"
              type="number"
              value={commissionRate}
              onChange={(e) => onChange(parseFloat(e.target.value) || 0)}
              placeholder="20"
              min="0"
              max="100"
              step="0.1"
              required
              className="text-lg font-semibold"
            />
            <p className="text-sm text-gray-600 mt-2">
              Este porcentaje se aplicará a todos los servicios para calcular el precio final del cliente.
            </p>
          </div>
          
          <div className="bg-white p-4 rounded-lg border border-gray-200">
            <h4 className="font-medium text-gray-800 mb-3 flex items-center">
              <DollarSign className="w-4 h-4 mr-2 text-green-600" />
              Resumen de Precios
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Costo Neto:</span>
                <span className="font-medium">{formatCurrency(calculations.netGrandTotal())}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Comisión ({commissionRate}%):</span>
                <span className="font-medium text-blue-600">{formatCurrency(calculations.commissionAmount())}</span>
              </div>
              <div className="flex justify-between text-lg font-bold pt-2 border-t">
                <span className="text-gray-800">Precio Final Cliente:</span>
                <span className="text-green-600">{formatCurrency(calculations.grandTotal())}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
