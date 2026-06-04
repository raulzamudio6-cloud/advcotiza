import React from 'react';
import clsx from 'clsx';
import { Briefcase, Save, History, FileText, CheckCircle, AlertCircle, Settings, RefreshCw, LogOut, User, LogIn } from 'lucide-react';
import { Button } from './UI/Input';
import { useAgencyConfig } from '../contexts/AgencyConfigContext';
import { useAuth } from '../contexts/AuthContext';

export const Header = ({ 
  currentView, 
  onViewChange, 
  onSaveQuotation, 
  saveStatus,
  onResetQuotation,
  currentQuotationId,
  quotationTitle
}) => {
  const { agencyConfig, loading } = useAgencyConfig();
  const { user, signOut, signInWithGoogle } = useAuth();

  console.log('=== HEADER RENDER ===');
  console.log('Estado de auth:', { 
    user: user ? 'Presente' : 'Ausente', 
    userEmail: user?.email,
    userName: user?.user_metadata?.full_name 
  });

  const handleLogout = async () => {
    console.log('>>> handleLogout iniciado');
    try {
      await signOut();
      console.log('✓ signOut() completado');
    } catch (error) {
      console.error('!!! Error al cerrar sesión:', error);
    }
  };

  const handleLogin = async () => {
    console.log('>>> handleLogin iniciado');
    try {
      await signInWithGoogle();
      console.log('✓ signInWithGoogle llamado exitosamente');
    } catch (error) {
      console.error('!!! Error al iniciar sesión:', error);
    }
  };

  // Componente UserMenu - muestra cuando el usuario está logueado
  const UserMenu = () => {
    const initials = user.user_metadata?.full_name
      ? user.user_metadata.full_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
      : user.email?.split('@')[0].toUpperCase().slice(0, 2) || 'U';

    return (
      <div className="flex items-center gap-3 bg-white/10 rounded-lg px-4 py-2 backdrop-blur-sm">
        {user.user_metadata?.avatar_url ? (
          <img 
            src={user.user_metadata.avatar_url} 
            alt="Avatar" 
            className="w-8 h-8 rounded-full border-2 border-white/30"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center border-2 border-white/30">
            <span className="text-xs font-bold text-white">{initials}</span>
          </div>
        )}
        <div className="text-sm">
          <p className="font-medium text-white">
            {user.user_metadata?.full_name || user.email?.split('@')[0]}
          </p>
          <p className="text-xs text-primary-200">{user.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="ml-2 p-2 hover:bg-white/20 rounded-lg transition-colors group"
          title="Cerrar sesión"
          type="button"
        >
          <LogOut className="w-4 h-4 group-hover:rotate-180 transition-transform duration-300" />
        </button>
      </div>
    );
  };

  // Componente LoginButton - muestra cuando el usuario NO está logueado
  const LoginButton = () => {
    return (
      <button
        onClick={handleLogin}
        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white border border-white/30 px-4 py-2 rounded-lg backdrop-blur-sm transition-all duration-200"
      >
        <LogIn className="w-4 h-4" />
        <span className="text-sm font-medium">Iniciar Sesión</span>
      </button>
    );
  };

  return (
    <header className="bg-primary-600 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brand Section */}
        <div className="py-4 sm:py-6">
          <div className="flex items-center gap-4">
            {/* Logo and Brand */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 sm:w-12 sm:h-12 bg-white/10 rounded-lg flex items-center justify-center backdrop-blur-sm">
                  <Briefcase className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-white leading-tight">
                    {loading ? 'Cargando...' : agencyConfig.agencyName}
                  </h1>
                  {currentView === 'form' && (
                    <span className={clsx(
                      "inline-flex items-center px-2 py-1 rounded text-xs font-medium",
                      currentQuotationId ? "bg-green-500/20 text-green-200 border border-green-400/30" : "bg-blue-500/20 text-blue-200 border border-blue-400/30"
                    )}>
                      {currentQuotationId ? 'Editando' : 'Nueva'}
                    </span>
                  )}
                </div>
                <p className="text-primary-100 text-xs sm:text-sm lg:text-base mt-1 hidden sm:block">
                  Sistema Profesional de Cotización de Viajes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="border-t border-primary-500/30">
          <div className="py-4">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
              {/* Auth Section - Conditional Rendering */}
              <div className="flex items-center gap-3">
                {user ? <UserMenu /> : <LoginButton />}
              </div>
              {/* Navigation Tabs */}
              <div className="flex flex-wrap gap-2 flex-1">
                <Button
                  variant={currentView === 'form' ? 'default' : 'outline'}
                  onClick={() => {
                    onViewChange('form');
                    if (onResetQuotation) {
                      onResetQuotation();
                    }
                  }}
                  className={clsx(
                    "flex items-center space-x-2 px-3 py-2 sm:px-4 transition-all duration-200",
                    currentView === 'form' 
                      ? "bg-white text-primary-600 border-white shadow-lg" 
                      : "bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
                  )}
                >
                  <FileText className="w-4 h-4" />
                  <span className="text-sm font-medium">Nueva Cotización</span>
                </Button>
                
                <Button
                  variant={currentView === 'history' ? 'default' : 'outline'}
                  onClick={() => onViewChange('history')}
                  className={clsx(
                    "flex items-center space-x-2 px-3 py-2 sm:px-4 transition-all duration-200",
                    currentView === 'history' 
                      ? "bg-white text-primary-600 border-white shadow-lg" 
                      : "bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
                  )}
                >
                  <History className="w-4 h-4" />
                  <span className="text-sm font-medium">Mis Cotizaciones</span>
                </Button>

                <Button
                  variant={currentView === 'settings' ? 'default' : 'outline'}
                  onClick={() => onViewChange('settings')}
                  className={clsx(
                    "flex items-center space-x-2 px-3 py-2 sm:px-4 transition-all duration-200",
                    currentView === 'settings' 
                      ? "bg-white text-primary-600 border-white shadow-lg" 
                      : "bg-white/10 hover:bg-white/20 text-white border-white/30 backdrop-blur-sm"
                  )}
                >
                  <Settings className="w-4 h-4" />
                  <span className="text-sm font-medium">Ajustes</span>
                </Button>
              </div>

              {/* Save Section - Form View Only */}
              {currentView === 'form' && (
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Status Messages */}
                  {saveStatus && (
                    <div className="flex items-center space-x-2 text-sm">
                      {saveStatus.loading && (
                        <div className="flex items-center space-x-2 text-yellow-200 bg-yellow-500/10 px-3 py-1.5 rounded-lg">
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span className="font-medium">Guardando...</span>
                        </div>
                      )}
                      {saveStatus.message && (
                        <div className="flex items-center space-x-2 text-green-200 bg-green-500/10 px-3 py-1.5 rounded-lg">
                          <CheckCircle className="w-4 h-4" />
                          <span className="font-medium">{saveStatus.message}</span>
                        </div>
                      )}
                      {saveStatus.error && (
                        <div className="flex items-center space-x-2 text-red-200 bg-red-500/10 px-3 py-1.5 rounded-lg">
                          <AlertCircle className="w-4 h-4" />
                          <span className="font-medium">{saveStatus.error}</span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  {/* Save Button */}
                  <Button
                    variant="default"
                    onClick={onSaveQuotation}
                    disabled={saveStatus?.loading}
                    className="flex items-center space-x-2 bg-secondary-600 hover:bg-secondary-700 text-white border-secondary-700 shadow-lg transition-all duration-200"
                  >
                    <Save className="w-4 h-4" />
                    <span className="font-medium">Guardar Cotización</span>
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
