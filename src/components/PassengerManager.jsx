import React, { useState } from 'react';
import { Plus, Trash2, User, Users, AlertCircle } from 'lucide-react';
import { Input, Button } from './UI/Input';

export const PassengerManager = ({ passengers, onAddPassenger, onUpdatePassenger, onRemovePassenger }) => {
  const [ageErrors, setAgeErrors] = useState({});

  const validateAge = (id, age, isMinor) => {
    if (isMinor) {
      const ageNum = parseInt(age);
      if (isNaN(ageNum) || ageNum < 0 || ageNum > 17) {
        setAgeErrors(prev => ({ 
          ...prev, 
          [id]: 'La edad de menores debe ser un número entero entre 0 y 17 años' 
        }));
        return false;
      }
      
      if (ageNum >= 18) {
        setAgeErrors(prev => ({ 
          ...prev, 
          [id]: 'Para 18 años o más, seleccione tipo de pasajero "Adulto"' 
        }));
        return false;
      }
    }
    
    setAgeErrors(prev => ({ ...prev, [id]: null }));
    return true;
  };

  const handlePassengerChange = (id, field, value) => {
    if (field === 'isMinor') {
      onUpdatePassenger(id, { 
        isMinor: value, 
        age: value ? 0 : undefined 
      });
      // Limpiar error si cambia a adulto
      if (!value) {
        setAgeErrors(prev => ({ ...prev, [id]: null }));
      }
    } else if (field === 'age') {
      const passenger = passengers.find(p => p.id === id);
      const isValid = validateAge(id, value, passenger?.isMinor);
      if (isValid) {
        onUpdatePassenger(id, { age: parseInt(value) || 0 });
      }
    } else {
      onUpdatePassenger(id, { [field]: value });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-primary-600" />
          <h3 className="text-lg font-semibold text-gray-800">Pasajeros</h3>
          <span className="bg-primary-100 text-primary-800 px-2 py-1 rounded-full text-xs font-medium">
            {passengers.length}
          </span>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onAddPassenger}
          className="flex items-center space-x-1"
        >
          <Plus className="w-4 h-4" />
          <span>Agregar Pasajero</span>
        </Button>
      </div>

      {passengers.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
          <User className="w-12 h-12 mx-auto mb-3 text-gray-400" />
          <p className="text-gray-500 mb-2">No hay pasajeros agregados aún</p>
          <p className="text-sm text-gray-400">Haz clic en "Agregar Pasajero" para comenzar</p>
        </div>
      ) : (
        <div className="space-y-3">
          {passengers.map((passenger, index) => (
            <div key={passenger.id} className="bg-white border border-gray-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-500" />
                  <span className="font-medium text-gray-700">Pasajero {index + 1}</span>
                </div>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onRemovePassenger(passenger.id)}
                  className="flex items-center space-x-1"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>Eliminar</span>
                </Button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Input
                  label="Nombre Completo"
                  value={passenger.name}
                  onChange={(e) => handlePassengerChange(passenger.id, 'name', e.target.value)}
                  placeholder="Ingrese el nombre del pasajero"
                  required
                />

                <div className="space-y-1">
                  <label className="block text-sm font-medium text-gray-700">
                    Tipo de Pasajero
                  </label>
                  <div className="flex items-center space-x-4">
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`passenger-type-${passenger.id}`}
                        checked={!passenger.isMinor}
                        onChange={() => handlePassengerChange(passenger.id, 'isMinor', false)}
                        className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Adulto</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name={`passenger-type-${passenger.id}`}
                        checked={passenger.isMinor}
                        onChange={() => handlePassengerChange(passenger.id, 'isMinor', true)}
                        className="w-4 h-4 text-primary-600 border-gray-300 focus:ring-primary-500"
                      />
                      <span className="text-sm text-gray-700">Menor</span>
                    </label>
                  </div>
                </div>

                {passenger.isMinor && (
                  <div>
                    <Input
                      label="Edad"
                      type="number"
                      value={passenger.age || ''}
                      onChange={(e) => handlePassengerChange(passenger.id, 'age', e.target.value)}
                      placeholder="Ingrese la edad (0-17)"
                      min="0"
                      max="17"
                      required
                      className={ageErrors[passenger.id] ? 'border-red-300' : ''}
                    />
                    {ageErrors[passenger.id] && (
                      <div className="flex items-center mt-1 text-xs text-red-600">
                        <AlertCircle className="w-3 h-3 mr-1" />
                        {ageErrors[passenger.id]}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
