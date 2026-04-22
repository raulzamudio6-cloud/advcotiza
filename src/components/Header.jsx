import React from 'react';
import { Plane, RefreshCw } from 'lucide-react';
import { Button } from './UI/Input';

export const Header = ({ onReset }) => {
  return (
    <header className="bg-primary-600 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
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
      </div>
    </header>
  );
};
