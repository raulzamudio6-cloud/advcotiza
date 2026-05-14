import React from 'react';
import clsx from 'clsx';
import { AlertCircle } from 'lucide-react';

export const Card = ({ 
  children, 
  className = '', 
  padding = 'md',
  shadow = 'md',
  ...props 
}) => {
  const paddingClasses = {
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8'
  };
  
  const shadowClasses = {
    sm: 'shadow-sm',
    md: 'shadow-md',
    lg: 'shadow-lg',
    xl: 'shadow-xl'
  };

  return (
    <div
      className={clsx(
        'bg-white rounded-lg',
        paddingClasses[padding],
        shadowClasses[shadow],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardHeader = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <div
      className={clsx('mb-4', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const CardContent = ({ 
  children, 
  className = '',
  ...props 
}) => {
  return (
    <div
      className={clsx('space-y-4', className)}
      {...props}
    >
      {children}
    </div>
  );
};

export const HotelCard = ({ 
  hotel, 
  isSelected, 
  onSelect, 
  onUpdate,
  className = '',
  compact = false,
  validationErrors = {},
  ...props 
}) => {
  const handleImageUrl = (index, value) => {
    const currentImages = hotel.images || ['', '', ''];
    const newImages = [...currentImages]; // Crear copia para inmutabilidad
    newImages[index] = value;
    onUpdate({ images: newImages });
  };

  const handleImageError = (e) => {
    e.target.style.display = 'none';
    e.target.nextElementSibling.style.display = 'flex';
  };

  const hasAnyImage = hotel.images && hotel.images.some(img => img && img.trim() !== '');

  return (
    <Card
      className={clsx(
        'cursor-pointer transition-all duration-200 border-2',
        isSelected ? 'border-primary-500 bg-primary-50' : 'border-gray-200 hover:border-gray-300',
        compact && 'p-4', // Compact styling when compact prop is true
        className
      )}
      padding={compact ? 'sm' : 'md'}
      onClick={onSelect}
      {...props}
    >
      <CardContent>
        {/* 1. Nombre del Hotel */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nombre del Hotel
            {validationErrors.name && (
              <AlertCircle className="w-4 h-4 inline ml-1 text-red-500" />
            )}
          </label>
          <input
            type="text"
            value={hotel.name}
            onChange={(e) => {
              e.stopPropagation();
              onUpdate({ name: e.target.value });
            }}
            placeholder="Ingrese el nombre del hotel"
            className={clsx(
              "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all",
              validationErrors.name ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
            )}
            onClick={(e) => e.stopPropagation()}
          />
          {validationErrors.name && (
            <p className="text-xs text-red-600 mt-1">{validationErrors.name}</p>
          )}
        </div>

        {/* 2. Estrellas */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Categoría (Estrellas)</label>
          <div className="flex items-center space-x-2">
            {[...Array(5)].map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onUpdate({ category: i + 1 });
                }}
                className="p-1 hover:scale-110 transition-transform"
              >
                <svg
                  className={clsx(
                    'w-6 h-6',
                    i < hotel.category ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  )}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                </svg>
              </button>
            ))}
            <span className="text-sm text-gray-600 ml-2">({hotel.category} estrellas)</span>
          </div>
        </div>

        {/* 3. Descripción del Hotel */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
          <textarea
            value={hotel.description}
            onChange={(e) => {
              e.stopPropagation();
              onUpdate({ description: e.target.value });
            }}
            placeholder="Descripción del hotel, servicios, ubicación..."
            rows={4}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all hover:border-gray-400"
            onClick={(e) => e.stopPropagation()}
          />
        </div>

        {/* 4. Galería de Imágenes (ahora debajo del texto) */}
        <div className="mb-5">
          <label className="block text-sm font-medium text-gray-700 mb-2">Galería de Imágenes</label>
          {hasAnyImage ? (
            <div className="flex justify-center gap-3">
              {[0, 1, 2].map((index) => {
                const imageUrl = hotel.images?.[index];
                return imageUrl && imageUrl.trim() !== '' ? (
                  <div key={index} className="relative">
                    <img 
                      src={imageUrl} 
                      alt={`${hotel.name} - Imagen ${index + 1}`} 
                      className="w-[280px] h-[210px] object-cover rounded-lg shadow-sm hotel-image"
                      onError={handleImageError}
                    />
                  </div>
                ) : (
                  <div key={index} className="w-[280px] h-[210px] bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="w-full h-[210px] bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg flex items-center justify-center">
              <div className="text-center">
                <svg className="w-12 h-12 mx-auto mb-2 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-sm text-gray-500">Sin imágenes</p>
              </div>
            </div>
          )}
        </div>

        {/* 5-7. Configuración de Imágenes */}
        <div className="mb-5 space-y-3 border border-gray-200 rounded-xl p-5 bg-gray-50">
          <label className="block text-sm font-semibold text-gray-700 mb-3">Configurar URLs de Imágenes</label>
          {[0, 1, 2].map((index) => (
            <div key={index} className="space-y-1">
              <label className="block text-sm font-medium text-gray-600">Enlace Foto {index + 1}:</label>
              <div className="flex items-center space-x-2">
                <input
                  type="url"
                  value={hotel.images?.[index] || ''}
                  onChange={(e) => handleImageUrl(index, e.target.value)}
                  placeholder={`https://ejemplo.com/imagen-hotel-${index + 1}.jpg`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
                {hotel.images?.[index] && hotel.images[index].trim() !== '' && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleImageUrl(index, '');
                    }}
                    className="text-red-500 hover:text-red-600 p-2 border border-red-300 rounded-md hover:bg-red-50"
                    title="Eliminar imagen"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          ))}
          <p className="text-xs text-gray-500 mt-3 italic">Ingresa hasta 3 URLs de imágenes del hotel (280x210px recomendado)</p>
        </div>

        {/* 7. Precio Total */}
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Precio Total (Costo Neto)
              {validationErrors.totalPrice && (
                <AlertCircle className="w-4 h-4 inline ml-1 text-red-500" />
              )}
            </label>
            <input
              type="number"
              value={hotel.totalPrice}
              onChange={(e) => {
                e.stopPropagation();
                onUpdate({ totalPrice: parseFloat(e.target.value) || 0 });
              }}
              placeholder="0.00"
              min="0"
              step="0.01"
              className={clsx(
                "w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all",
                validationErrors.totalPrice ? "border-red-500 focus:ring-red-500 bg-red-50" : "border-gray-300 hover:border-gray-400"
              )}
              onClick={(e) => e.stopPropagation()}
            />
            {validationErrors.totalPrice && (
              <p className="text-xs text-red-600 mt-1">{validationErrors.totalPrice}</p>
            )}
          </div>
          
          {isSelected && (
            <div className="bg-primary-500 text-white rounded-full p-2 ml-4">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            </div>
          )}
        </div>

        {/* Precio Calculado */}
        {hotel.totalPrice > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200 bg-gray-50 rounded-lg p-4">
            <div className="flex justify-between items-center text-lg font-bold">
              <span className="text-gray-700">Precio Neto:</span>
              <span className="text-primary-600">${hotel.totalPrice.toFixed(2)}</span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
