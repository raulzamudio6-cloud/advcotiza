import React, { useState, useEffect } from 'react';
import { useTravelQuotation } from './hooks/useTravelQuotation';
import { Input, Button } from './components/UI/Input';
import { Card, CardHeader, CardContent } from './components/UI/Card';
import { Header } from './components/Header';
import { PricingLogic } from './components/PricingLogic';
import { PassengerManager } from './components/PassengerManager';
import { FlightModule } from './components/FlightModule';
import { HotelModule } from './components/HotelModule';
import { AdditionalServicesModule } from './components/AdditionalServicesModule';
import { PreviewPanel } from './components/PreviewPanel';
import { PDFGenerator } from './components/PDFGenerator';
import { ExcelExport } from './components/ExcelExport';
import { QuotationHistory } from './components/QuotationHistory';
import { saveQuotation } from './services/storageService';
import { validateQuotationData } from './utils/calculations';

function App() {
  const { state, actions, calculations } = useTravelQuotation();
  const [tripDuration, setTripDuration] = React.useState({ days: 0, nights: 0 });
  const [currentView, setCurrentView] = useState('form'); // 'form' o 'history'
  const [currentQuotationId, setCurrentQuotationId] = useState(null);
  const [saveStatus, setSaveStatus] = useState(null);

  const handleClientInfoChange = (field, value) => {
    actions.setClientInfo({ [field]: value });
  };

  const handleDurationChange = (duration) => {
    setTripDuration(duration);
  };

  const handleSaveQuotation = async () => {
    try {
      setSaveStatus({ loading: true, message: null, error: null });
      
      // Validar datos antes de guardar
      const validation = validateQuotationData(state);
      if (!validation.valid) {
        setSaveStatus({ 
          loading: false, 
          error: 'No se puede guardar: ' + validation.errors.join(', '), 
          message: null 
        });
        return;
      }
      
      // Preparar datos para guardar
      const quotationData = {
        ...state,
        tripDuration
      };
      
      const result = saveQuotation(quotationData);
      
      if (result.success) {
        setCurrentQuotationId(result.id);
        setSaveStatus({ 
          loading: false, 
          message: result.message, 
          error: null 
        });
        
        // Limpiar el mensaje después de 3 segundos
        setTimeout(() => {
          setSaveStatus(prev => ({ ...prev, message: null }));
        }, 3000);
      } else {
        setSaveStatus({ 
          loading: false, 
          error: result.message, 
          message: null 
        });
      }
    } catch (error) {
      setSaveStatus({ 
        loading: false, 
        error: 'Error al guardar la cotización: ' + error.message, 
        message: null 
      });
    }
  };

  const handleLoadQuotation = (quotationData) => {
    try {
      // Cargar los datos en el estado
      actions.loadQuotation(quotationData);
      setCurrentQuotationId(quotationData.id);
      setCurrentView('form');
      
      // Actualizar duración si está disponible
      if (quotationData.tripDuration) {
        setTripDuration(quotationData.tripDuration);
      }
      
      setSaveStatus({ 
        loading: false, 
        message: 'Cotización cargada correctamente', 
        error: null 
      });
      
      // Limpiar el mensaje después de 3 segundos
      setTimeout(() => {
        setSaveStatus(prev => ({ ...prev, message: null }));
      }, 3000);
    } catch (error) {
      setSaveStatus({ 
        loading: false, 
        error: 'Error al cargar la cotización: ' + error.message, 
        message: null 
      });
    }
  };

  const resetForm = () => {
    actions.resetQuotation();
    setTripDuration({ days: 0, nights: 0 });
    setCurrentQuotationId(null);
    setSaveStatus(null);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header 
        onReset={resetForm} 
        currentView={currentView}
        onViewChange={setCurrentView}
        onSaveQuotation={handleSaveQuotation}
        saveStatus={saveStatus}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {currentView === 'form' ? (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column - Form Sections */}
            <div className="xl:col-span-2 space-y-6">
            {/* Título de la Cotización */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-800">Título de la Cotización</h3>
              </CardHeader>
              <CardContent>
                <Input
                  label="Título del Viaje"
                  value={state.quotationTitle}
                  onChange={(e) => actions.setQuotationTitle(e.target.value)}
                  placeholder="Ej: ORLANDO DESDE QUERÉTARO o TOUR JAPÓN 2026"
                  required
                />
                <p className="text-xs text-gray-500 mt-2">
                  Este título será el elemento principal en el encabezado del PDF
                </p>
                
                {/* Nuevo campo de duración del viaje */}
                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duración del Viaje
                  </label>
                  <input
                    type="text"
                    value={
                      tripDuration.days > 0 && tripDuration.nights >= 0
                        ? `${tripDuration.days} Días / ${tripDuration.nights} Noches`
                        : 'Pendiente de fechas...'
                    }
                    readOnly
                    className="w-full px-3 py-2 border border-dashed border-gray-300 bg-gray-50 text-gray-600 rounded-md cursor-not-allowed"
                    title="Este campo se calcula automáticamente según las fechas del vuelo"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    <span className="italic">Información calculada automáticamente según las fechas de vuelo seleccionadas</span>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Configuración de Comisión */}
            <PricingLogic
              commissionRate={state.commissionRate}
              onChange={actions.setCommissionRate}
              calculations={calculations}
            />

            {/* Información del Cliente */}
            <Card>
              <CardHeader>
                <h3 className="text-lg font-semibold text-gray-800">Información del Cliente</h3>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Input
                    label="Nombre Completo"
                    value={state.clientInfo.name}
                    onChange={(e) => handleClientInfoChange('name', e.target.value)}
                    placeholder="Ingrese el nombre del cliente"
                    required
                  />
                  <Input
                    label="Correo Electrónico"
                    type="email"
                    value={state.clientInfo.email}
                    onChange={(e) => handleClientInfoChange('email', e.target.value)}
                    placeholder="cliente@correo.com"
                  />
                  <Input
                    label="Teléfono"
                    type="tel"
                    value={state.clientInfo.phone}
                    onChange={(e) => handleClientInfoChange('phone', e.target.value)}
                    placeholder="+52 (555) 123-4567"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Pasajeros */}
            <Card>
              <CardContent>
                <PassengerManager
                  passengers={state.passengers}
                  onAddPassenger={actions.addPassenger}
                  onUpdatePassenger={actions.updatePassenger}
                  onRemovePassenger={actions.removePassenger}
                />
              </CardContent>
            </Card>

            {/* Vuelos */}
            <Card>
              <CardContent>
                <FlightModule
                  flights={state.flights}
                  onUpdateFlight={actions.updateFlight}
                  onSelectFlight={actions.selectFlight}
                  passengers={state.passengers}
                  onDurationChange={handleDurationChange}
                />
              </CardContent>
            </Card>

            {/* Hospedaje */}
            <Card>
              <CardContent>
                <HotelModule
                  accommodations={state.accommodations}
                  onUpdateAccommodation={actions.updateAccommodation}
                  onSelectAccommodation={actions.selectAccommodation}
                />
              </CardContent>
            </Card>

            {/* Servicios Adicionales */}
            <Card>
              <CardContent>
                <AdditionalServicesModule
                  transfers={state.additionalServices.transfers}
                  extras={state.additionalServices.extras}
                  onUpdateTransfers={actions.updateTransfers}
                  onAddExtra={actions.addExtra}
                  onUpdateExtra={actions.updateExtra}
                  onRemoveExtra={actions.removeExtra}
                />
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Preview */}
          <div className="xl:col-span-1">
            <div className="sticky top-4 space-y-6">
              {/* Panel de Previsualización */}
              <Card className="shadow-lg">
                <CardContent>
                  <PreviewPanel
                    state={state}
                    calculations={calculations}
                    tripDuration={tripDuration}
                  />
                </CardContent>
              </Card>

              {/* Generación de Documentos */}
              <Card className="shadow-lg">
                <CardContent>
                  <div className="space-y-4">
                    <PDFGenerator
                      state={state}
                      calculations={calculations}
                      tripDuration={tripDuration}
                    />
                    <ExcelExport
                      state={state}
                      calculations={calculations}
                    />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
        ) : (
          /* Vista de Historial de Cotizaciones */
          <QuotationHistory 
            onLoadQuotation={handleLoadQuotation}
            currentQuotationId={currentQuotationId}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white mt-16">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h4 className="text-lg font-semibold mb-3">AdvCotiza</h4>
              <p className="text-gray-300 text-sm">
                Sistema profesional de cotización de viajes diseñado para agencias de viajes y consultores.
              </p>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3">Características</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• Gestión dinámica de pasajeros</li>
                <li>• Comparación de múltiples opciones de vuelos</li>
                <li>• Selección de hoteles con calificaciones</li>
                <li>• Integración de servicios adicionales</li>
                <li>• Generación profesional de PDF</li>
                <li>• Exportación a Excel</li>
              </ul>
            </div>
            <div>
              <h4 className="text-lg font-semibold mb-3">Tecnología</h4>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• React 18 con Hooks</li>
                <li>• Tailwind CSS</li>
                <li>• Lucide React Icons</li>
                <li>• jsPDF para generación de documentos</li>
                <li>• xlsx para exportación a Excel</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-8 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              © 2024 AdvCotiza. Construido con React y tecnologías web modernas.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
