import React, { useState } from 'react';
import clsx from 'clsx';
import { Hotel, Star, DollarSign, Copy, Trash2, AlertCircle } from 'lucide-react';
import { Input, Button } from './UI/Input';
import { Card, CardHeader, CardContent, HotelCard } from './UI/Card';
import { Accordion, AccordionGroup } from './UI/Accordion';

export const HotelModule = ({ accommodations, onUpdateAccommodation, onSelectAccommodation, onDuplicateAccommodation, onDeleteAccommodation }) => {
  const [validationErrors, setValidationErrors] = useState({});
  const [deleteConfirmation, setDeleteConfirmation] = useState(null);
  
  // Función para verificar si un alojamiento tiene datos significativos
  const accommodationHasData = (accommodation) => {
    return (
      accommodation.name ||
      accommodation.category > 0 ||
      accommodation.price > 0 ||
      accommodation.description ||
      (accommodation.images && accommodation.images.some(img => img && img.trim() !== ''))
    );
  };

  // Validate required fields for an accommodation
  const validateAccommodation = (accommodation) => {
    const errors = {};
    
    if (!accommodation.name) errors.name = 'Nombre del hotel requerido';
    if (!accommodation.totalPrice || accommodation.totalPrice <= 0) errors.totalPrice = 'Precio requerido';
    
    return errors;
  };

  // Handle delete with confirmation
  const handleDeleteClick = (accommodationId) => {
    setDeleteConfirmation(accommodationId);
  };

  const handleDeleteConfirm = () => {
    if (deleteConfirmation && onDeleteAccommodation) {
      onDeleteAccommodation(deleteConfirmation);
      setDeleteConfirmation(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteConfirmation(null);
  };

  // Handle duplicate
  const handleDuplicate = (accommodationId) => {
    if (onDuplicateAccommodation) {
      onDuplicateAccommodation(accommodationId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Hotel className="w-5 h-5 text-primary-600" />
        <h3 className="text-lg font-semibold text-gray-800">Opciones de Hospedaje</h3>
      </div>

      <AccordionGroup>
        {accommodations.map((accommodation, index) => (
          <Accordion
            key={accommodation.id}
            title={
              <div className="flex items-center justify-between w-full pr-4">
                <div className="flex items-center space-x-3">
                  <span className="font-medium">Opción {index + 1}</span>
                  {accommodation.selected && (
                    <div className="bg-primary-500 text-white rounded-full p-1">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                  {accommodation.name && (
                    <span className="text-sm text-gray-600">{accommodation.name}</span>
                  )}
                </div>
                <div className="flex items-center space-x-2" onClick={(e) => e.stopPropagation()}>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDuplicate(accommodation.id)}
                    className="p-2"
                    title="Duplicar opción"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDeleteClick(accommodation.id)}
                    className="p-2"
                    title="Eliminar opción"
                    disabled={accommodations.length <= 1}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            }
            defaultExpanded={index === 0} // Solo la primera opción expandida por defecto
            hasData={accommodationHasData(accommodation)}
            className={clsx(
              'border-2 transition-all duration-200',
              accommodation.selected ? 'border-primary-500 bg-primary-50' : 'border-gray-200'
            )}
            headerClassName={clsx(
              accommodation.selected ? 'bg-primary-50' : 'bg-gray-50'
            )}
          >
            <div className="space-y-4">
              {/* Botón de selección */}
              <div className="flex justify-end mb-4">
                <Button
                  variant={accommodation.selected ? "default" : "outline"}
                  size="sm"
                  onClick={() => onSelectAccommodation(accommodation.id)}
                  className="flex items-center space-x-2"
                >
                  {accommodation.selected ? (
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

              {/* Contenido del HotelCard */}
              <HotelCard
                key={accommodation.id}
                hotel={accommodation}
                isSelected={accommodation.selected}
                onSelect={() => onSelectAccommodation(accommodation.id)}
                onUpdate={(updates) => {
                  onUpdateAccommodation(accommodation.id, updates);
                  // Clear validation errors when field is updated
                  if (updates.name || updates.totalPrice) {
                    setValidationErrors(prev => ({
                      ...prev,
                      [accommodation.id]: { ...prev[accommodation.id], ...updates, ...(updates.name ? { name: null } : {}), ...(updates.totalPrice ? { totalPrice: null } : {}) }
                    }));
                  }
                }}
                validationErrors={validationErrors[accommodation.id] || {}}
                compact="true" // Modo compacto para usar dentro del acordeón
              />
            </div>
          </Accordion>
        ))}
      </AccordionGroup>

      {accommodations.every(acc => !acc.selected) && (
        <div className="text-center py-4 bg-amber-50 border border-amber-200 rounded-lg">
          <Hotel className="w-8 h-8 mx-auto mb-2 text-amber-600" />
          <p className="text-amber-800 text-sm">Por favor seleccione una opción de hospedaje</p>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4 shadow-xl">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Confirmar Eliminación</h3>
            <p className="text-gray-600 mb-6">
              ¿Está seguro de que desea eliminar esta opción de hospedaje? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={handleDeleteCancel}
              >
                Cancelar
              </Button>
              <Button
                variant="danger"
                onClick={handleDeleteConfirm}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
