import React from 'react';
import clsx from 'clsx';
import { Plane, RefreshCw, Save, History, FileText, CheckCircle, AlertCircle } from 'lucide-react';
import { Button } from './UI/Input';

export const Header = ({ 
  onReset, 
  currentView, 
  onViewChange, 
  onSaveQuotation, 
  saveStatus 
}) => {
  return (
    <header className="bg-primary-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Navegación principal */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <Plane className="w-8 h-8" />
            <div>
              <h1 className="text-3xl font-bold">AdvCotiza</h1>
              <p className="text-primary-100 text-sm">Sistema Profesional de Cotización de Viajes</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={onReset}
            className="flex items-center space-x-2 bg-white/10 hover:bg-white/20 text-white border-white/30"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Reiniciar</span>
          </Button>
        </div>

        {/* Barra de navegación secundaria */}
        <div className="flex items-center justify-between border-t border-primary-500 pt-4">
          {/* Navegación entre vistas */}
          <div className="flex space-x-2">
            <Button
              variant={currentView === 'form' ? 'default' : 'outline'}
              onClick={() => onViewChange('form')}
              className={clsx(
                "flex items-center space-x-2",
                currentView === 'form' 
                  ? "bg-white text-primary-600 border-white" 
                  : "bg-white/10 hover:bg-white/20 text-white border-white/30"
              )}
            >
              <FileText className="w-4 h-4" />
              <span>Nueva Cotización</span>
            </Button>
            
            <Button
              variant={currentView === 'history' ? 'default' : 'outline'}
              onClick={() => onViewChange('history')}
              className={clsx(
                "flex items-center space-x-2",
                currentView === 'history' 
                  ? "bg-white text-primary-600 border-white" 
                  : "bg-white/10 hover:bg-white/20 text-white border-white/30"
              )}
            >
              <History className="w-4 h-4" />
              <span>Mis Cotizaciones</span>
            </Button>
          </div>

          {/* Botón de guardado y estado */}
          {currentView === 'form' && (
            <div className="flex items-center space-x-3">
              {/* Estado de guardado */}
              {saveStatus && (
                <div className="flex items-center space-x-2 text-sm">
                  {saveStatus.loading && (
                    <div className="flex items-center space-x-1 text-yellow-200">
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Guardando...</span>
                    </div>
                  )}
                  {saveStatus.message && (
                    <div className="flex items-center space-x-1 text-green-200">
                      <CheckCircle className="w-4 h-4" />
                      <span>{saveStatus.message}</span>
                    </div>
                  )}
                  {saveStatus.error && (
                    <div className="flex items-center space-x-1 text-red-200">
                      <AlertCircle className="w-4 h-4" />
                      <span>{saveStatus.error}</span>
                    </div>
                  )}
                </div>
              )}
              
              {/* Botón de guardar */}
              <Button
                variant="default"
                onClick={onSaveQuotation}
                disabled={saveStatus?.loading}
                className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white border-green-700"
              >
                <Save className="w-4 h-4" />
                <span>Guardar Cotización</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
