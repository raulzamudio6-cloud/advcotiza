import React from 'react';
import clsx from 'clsx';
import { Hotel, Star, DollarSign } from 'lucide-react';
import { Input, Button } from './UI/Input';
import { Card, CardHeader, CardContent, HotelCard } from './UI/Card';

export const HotelModule = ({ accommodations, onUpdateAccommodation, onSelectAccommodation }) => {
  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Hotel className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-800">Opciones de Hospedaje</h3>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {accommodations.map((accommodation, index) => (
          <HotelCard
            key={accommodation.id}
            hotel={accommodation}
            isSelected={accommodation.selected}
            onSelect={() => onSelectAccommodation(accommodation.id)}
            onUpdate={(updates) => onUpdateAccommodation(accommodation.id, updates)}
          />
        ))}
      </div>

      {accommodations.every(acc => !acc.selected) && (
        <div className="text-center py-4 bg-amber-50 border border-amber-200 rounded-lg">
          <Hotel className="w-8 h-8 mx-auto mb-2 text-amber-600" />
          <p className="text-amber-800 text-sm">Por favor seleccione una opción de hospedaje</p>
        </div>
      )}
    </div>
  );
};
