import React, { useState, useEffect } from 'react';
import { 
  History, 
  Download, 
  Trash2, 
  Eye, 
  Calendar, 
  DollarSign, 
  User, 
  AlertCircle,
  RefreshCw,
  FileText,
  Upload,
  DownloadCloud,
  Search,
  Filter,
  X
} from 'lucide-react';
import { Card, CardHeader, CardContent } from './UI/Card';
import { Button } from './UI/Input';
import clsx from 'clsx';
import { 
  getQuotations, 
  getQuotationById, 
  deleteQuotation, 
  getQuotationsStats,
  saveQuotation as saveQuotationToSupabase
} from '../services/quotationService';
import { formatMXN } from '../utils/formatters';
import { formatDisplayDate, normalizeQuotation } from '../utils/calculations';

export const QuotationHistory = ({ onLoadQuotation, currentQuotationId }) => {
  const [quotations, setQuotations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState({ total: 0, thisMonth: 0, lastSaved: null });
  const [selectedQuotation, setSelectedQuotation] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [showImportDialog, setShowImportDialog] = useState(false);
  
  // Filters
  const [filters, setFilters] = useState({
    clientName: '',
    startDate: '',
    endDate: ''
  });

  // Cargar cotizaciones al montar el componente
  useEffect(() => {
    loadQuotations();
  }, []);

  const loadQuotations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Apply filters
      const activeFilters = {};
      if (filters.clientName) activeFilters.clientName = filters.clientName;
      if (filters.startDate) activeFilters.startDate = filters.startDate;
      if (filters.endDate) activeFilters.endDate = filters.endDate;
      
      const allQuotations = await getQuotations(activeFilters);
      const statsData = await getQuotationsStats();
      
      // Transform Supabase data to match expected format
      const transformedQuotations = allQuotations.map(q => ({
        id: q.id,
        quotationTitle: q.quotation_title,
        clientInfo: q.client_info,
        passengers: q.passengers,
        flights: q.flights,
        accommodations: q.accommodations,
        additionalServices: q.additional_services,
        commissionRate: q.commission_rate,
        tripDuration: q.trip_duration,
        createdAt: q.created_at,
        updatedAt: q.updated_at
      }));
      
      // Normalize each quotation to fill missing fields with defaults
      const normalizedQuotations = transformedQuotations.map(q => normalizeQuotation(q));
      
      setQuotations(normalizedQuotations);
      setStats(statsData);
    } catch (err) {
      setError('Error al cargar las cotizaciones: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleLoadQuotation = async (quotationId) => {
    try {
      setLoading(true);
      const quotation = await getQuotationById(quotationId);
      
      if (quotation) {
        // Transform Supabase data to match expected format
        const transformedQuotation = {
          id: quotation.id,
          quotationTitle: quotation.quotation_title,
          clientInfo: quotation.client_info,
          passengers: quotation.passengers,
          flights: quotation.flights,
          accommodations: quotation.accommodations,
          additionalServices: quotation.additional_services,
          commissionRate: quotation.commission_rate,
          tripDuration: quotation.trip_duration,
          createdAt: quotation.created_at,
          updatedAt: quotation.updated_at
        };
        
        // Normalize quotation to fill missing fields with defaults
        const normalizedQuotation = normalizeQuotation(transformedQuotation);
        
        // Llamar a la función del componente padre para cargar la cotización
        if (onLoadQuotation) {
          onLoadQuotation(normalizedQuotation);
        }
        setSelectedQuotation(null);
      } else {
        setError('No se encontró la cotización');
      }
    } catch (err) {
      setError('Error al cargar la cotización: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteQuotation = async (quotationId) => {
    try {
      setLoading(true);
      const result = await deleteQuotation(quotationId);
      
      if (result.success) {
        await loadQuotations(); // Recargar la lista
        setShowDeleteConfirm(null);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error al eliminar la cotización: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleExportQuotations = async () => {
    try {
      setLoading(true);
      
      // Export current quotations as JSON
      const exportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        quotations: quotations
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cotizaciones_backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      setError('Error al exportar las cotizaciones: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleImportQuotations = async (event) => {
    try {
      const file = event.target.files[0];
      if (!file) return;
      
      setLoading(true);
      const text = await file.text();
      const importData = JSON.parse(text);
      
      if (!importData.quotations || !Array.isArray(importData.quotations)) {
        throw new Error('Formato de archivo inválido');
      }
      
      // Import each quotation using Supabase
      let importedCount = 0;
      for (const quotation of importData.quotations) {
        const result = await saveQuotationToSupabase(quotation);
        if (result.success) {
          importedCount++;
        }
      }
      
      await loadQuotations(); // Recargar la lista
      setShowImportDialog(false);
      alert(`Se importaron ${importedCount} cotizaciones correctamente.`);
      
      // Limpiar el input
      event.target.value = '';
    } catch (err) {
      setError('Error al importar las cotizaciones: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClearAllQuotations = async () => {
    if (!confirm('¿Está seguro de que desea eliminar TODAS las cotizaciones? Esta acción no se puede deshacer.')) {
      return;
    }
    
    try {
      setLoading(true);
      
      // Delete all quotations one by one
      for (const quotation of quotations) {
        await deleteQuotation(quotation.id);
      }
      
      await loadQuotations();
      alert('Todas las cotizaciones han sido eliminadas');
    } catch (err) {
      setError('Error al eliminar las cotizaciones: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const previewQuotation = (quotation) => {
    setSelectedQuotation(quotation);
  };

  return (
    <div className="space-y-6">
      {/* Header con estadísticas y acciones */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <History className="w-5 h-5 text-primary-600" />
              <h3 className="text-lg font-semibold text-gray-800">Historial de Cotizaciones</h3>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={loadQuotations}
              disabled={loading}
              className="flex items-center space-x-1"
            >
              <RefreshCw className={clsx("w-4 h-4", loading && "animate-spin")} />
              <span>Actualizar</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {/* Estadísticas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-600 font-medium">Total de Cotizaciones</p>
                  <p className="text-2xl font-bold text-blue-800">{stats.total}</p>
                </div>
                <FileText className="w-8 h-8 text-blue-400" />
              </div>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-green-600 font-medium">Este Mes</p>
                  <p className="text-2xl font-bold text-green-800">{stats.thisMonth}</p>
                </div>
                <Calendar className="w-8 h-8 text-green-400" />
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-purple-600 font-medium">Última Guardada</p>
                  <p className="text-sm font-bold text-purple-800">
                    {stats.lastSaved ? 
                      formatDisplayDate(stats.lastSaved.toISOString()) : 
                      'Sin registros'
                    }
                  </p>
                </div>
                <RefreshCw className="w-8 h-8 text-purple-400" />
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
            <div className="flex items-center space-x-2 mb-3">
              <Filter className="w-4 h-4 text-gray-600" />
              <h4 className="font-medium text-gray-800">Filtros</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre del Cliente
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={filters.clientName}
                    onChange={(e) => setFilters({ ...filters, clientName: e.target.value })}
                    placeholder="Buscar por nombre..."
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Desde
                </label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Hasta
                </label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
            <div className="flex gap-2 mt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={loadQuotations}
                disabled={loading}
                className="flex items-center space-x-1"
              >
                <Search className="w-4 h-4" />
                <span>Aplicar Filtros</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setFilters({ clientName: '', startDate: '', endDate: '' });
                  loadQuotations();
                }}
                disabled={loading}
                className="flex items-center space-x-1"
              >
                <X className="w-4 h-4" />
                <span>Limpiar Filtros</span>
              </Button>
            </div>
          </div>

          {/* Acciones */}
          <div className="flex flex-wrap gap-2 mb-4">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportQuotations}
              disabled={loading || quotations.length === 0}
              className="flex items-center space-x-1"
            >
              <DownloadCloud className="w-4 h-4" />
              <span>Exportar Todo</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowImportDialog(true)}
              disabled={loading}
              className="flex items-center space-x-1"
            >
              <Upload className="w-4 h-4" />
              <span>Importar</span>
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAllQuotations}
              disabled={loading || quotations.length === 0}
              className="flex items-center space-x-1 text-red-600 border-red-300 hover:bg-red-50"
            >
              <Trash2 className="w-4 h-4" />
              <span>Limpiar Todo</span>
            </Button>
          </div>

          {/* Diálogo de importación */}
          {showImportDialog && (
            <div className="mb-4 p-4 border border-gray-200 rounded-lg bg-gray-50">
              <h4 className="font-medium text-gray-800 mb-2">Importar Cotizaciones</h4>
              <p className="text-sm text-gray-600 mb-3">
                Seleccione un archivo JSON exportado anteriormente para importar las cotizaciones.
              </p>
              <input
                type="file"
                accept=".json"
                onChange={handleImportQuotations}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
              <div className="flex gap-2 mt-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowImportDialog(false)}
                >
                  Cancelar
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <p className="text-red-800">{error}</p>
          </div>
        </div>
      )}

      {/* Lista de cotizaciones */}
      {quotations.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-800 mb-2">No hay cotizaciones guardadas</h3>
            <p className="text-gray-600">
              Comienza creando una nueva cotización y guárdala para que aparezca en tu historial.
            </p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nombre del Paquete
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Pasajeros
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Creada
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actualizada
                    </th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {quotations.map((quotation) => (
                    <tr 
                      key={quotation.id}
                      className={clsx(
                        "hover:bg-gray-50 transition-colors",
                        currentQuotationId === quotation.id && "bg-blue-50"
                      )}
                    >
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {quotation.quotationTitle || 'Sin Título'}
                            </div>
                            {quotation.id === currentQuotationId && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                Actual
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <div className="text-sm text-gray-900">
                            {quotation.clientInfo?.name || 'Sin Cliente'}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                        {quotation.passengers.length}
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <DollarSign className="w-4 h-4 text-green-600 mr-1" />
                          <span className="text-sm font-medium text-green-600">
                            {formatMXN(calculateQuotationTotal(quotation))}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 text-gray-400 mr-1" />
                          {formatDisplayDate(quotation.createdAt)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex items-center">
                          <RefreshCw className="w-4 h-4 text-gray-400 mr-1" />
                          {formatDisplayDate(quotation.updatedAt)}
                        </div>
                      </td>
                      <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => previewQuotation(quotation)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Vista previa"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLoadQuotation(quotation.id)}
                            disabled={loading}
                            className="text-green-600 hover:text-green-800"
                            title="Cargar cotización"
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                          
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setShowDeleteConfirm(quotation.id)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-800"
                            title="Eliminar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Confirmación de eliminación */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-4">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Confirmar Eliminación
            </h3>
            <p className="text-gray-600 mb-6">
              ¿Está seguro de que desea eliminar esta cotización? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(null)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={() => handleDeleteQuotation(showDeleteConfirm)}
                disabled={loading}
              >
                Eliminar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Vista previa de cotización */}
      {selectedQuotation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Vista Preia de Cotización
                </h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedQuotation(null)}
                >
                  ×
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-800">{selectedQuotation.quotationTitle || 'Sin Título'}</h4>
                  <p className="text-sm text-gray-600">
                    Cliente: {selectedQuotation.clientInfo?.name || 'Sin Cliente'}
                  </p>
                  <p className="text-sm text-gray-600">
                    Pasajeros: {selectedQuotation.passengers.length}
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Creada:</span>
                    <p className="text-gray-600">{formatDisplayDate(selectedQuotation.createdAt)}</p>
                  </div>
                  <div>
                    <span className="font-medium">Actualizada:</span>
                    <p className="text-gray-600">{formatDisplayDate(selectedQuotation.updatedAt)}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-800">Total Estimado:</span>
                    <span className="text-lg font-bold text-green-600">
                      {formatMXN(calculateQuotationTotal(selectedQuotation))}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setSelectedQuotation(null)}
                >
                  Cerrar
                </Button>
                <Button
                  onClick={() => {
                    handleLoadQuotation(selectedQuotation.id);
                    setSelectedQuotation(null);
                  }}
                  disabled={loading}
                >
                  Cargar Cotización
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Función auxiliar para calcular el total de una cotización
const calculateQuotationTotal = (quotation) => {
  try {
    const { flights, accommodations, additionalServices, passengers, commissionRate } = quotation;
    const passengerCount = passengers.length;
    
    let total = 0;
    
    // Calcular total de vuelos
    const selectedFlight = flights.find(f => f.selected);
    if (selectedFlight && selectedFlight.price) {
      total += selectedFlight.price * passengerCount * (1 + commissionRate / 100);
    }
    
    // Calcular total de alojamiento
    const selectedAccommodation = accommodations.find(a => a.selected);
    if (selectedAccommodation && selectedAccommodation.price) {
      total += selectedAccommodation.price * passengerCount * (1 + commissionRate / 100);
    }
    
    // Calcular total de traslados
    if (additionalServices.transfers) {
      let transferTotal = 0;
      if (additionalServices.transfers.standard && additionalServices.transfers.standardPrice) {
        transferTotal += additionalServices.transfers.standardPrice;
      }
      if (additionalServices.transfers.extraPrice) {
        transferTotal += additionalServices.transfers.extraPrice;
      }
      total += transferTotal * (1 + commissionRate / 100);
    }
    
    // Calcular total de extras
    if (additionalServices.extras && Array.isArray(additionalServices.extras)) {
      const extrasTotal = additionalServices.extras.reduce((sum, extra) => 
        sum + (extra.price || 0), 0
      );
      // Aplicar comisión a extras solo si el flag está habilitado
      if (additionalServices.applyCommissionToExtras) {
        total += extrasTotal * (1 + commissionRate / 100);
      } else {
        total += extrasTotal;
      }
    }
    
    return total;
  } catch (error) {
    console.error('Error calculating quotation total:', error);
    return 0;
  }
};
