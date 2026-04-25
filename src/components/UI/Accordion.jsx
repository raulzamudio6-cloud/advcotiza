import React, { useState } from 'react';
import { ChevronDown, ChevronRight, CheckCircle } from 'lucide-react';
import clsx from 'clsx';

export const Accordion = ({ 
  children, 
  title, 
  defaultExpanded = false, 
  hasData = false,
  className = '',
  headerClassName = '',
  contentClassName = '',
  onToggle = null,
  isExpanded: controlledExpanded = null,
  id = null 
}) => {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded);
  
  // Usar estado controlado si se proporciona, si no usar estado interno
  const isExpanded = controlledExpanded !== null ? controlledExpanded : internalExpanded;

  const handleToggle = () => {
    const newState = !isExpanded;
    
    // Actualizar estado interno solo si no está controlado
    if (controlledExpanded === null) {
      setInternalExpanded(newState);
    }
    
    // Notificar al componente padre
    if (onToggle) {
      onToggle(newState, id);
    }
  };

  return (
    <div className={clsx('border border-gray-200 rounded-lg overflow-hidden', className)}>
      {/* Header del acordeón */}
      <button
        onClick={handleToggle}
        className={clsx(
          'w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors duration-200',
          'flex items-center justify-between text-left',
          'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-inset',
          headerClassName
        )}
      >
        <div className="flex items-center space-x-3">
          {/* Icono de expansión */}
          <div className="transition-transform duration-200">
            {isExpanded ? (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
          </div>
          
          {/* Título */}
          <span className="font-medium text-gray-800">{title}</span>
          
          {/* Indicador de datos */}
          {hasData && !isExpanded && (
            <div className="flex items-center space-x-1">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-xs text-green-600 font-medium">Con datos</span>
            </div>
          )}
        </div>
        
        {/* Estado */}
        <div className="text-sm text-gray-500">
          {isExpanded ? 'Contraer' : 'Expandir'}
        </div>
      </button>

      {/* Contenido del acordeón */}
      <div
        className={clsx(
          'transition-all duration-300 ease-in-out overflow-hidden',
          isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <div className={clsx('p-4 bg-white', contentClassName)}>
          {children}
        </div>
      </div>
    </div>
  );
};

export const AccordionGroup = ({ children, className = '' }) => {
  return (
    <div className={clsx('space-y-3', className)}>
      {children}
    </div>
  );
};
