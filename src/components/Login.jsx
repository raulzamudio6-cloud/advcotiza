import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Briefcase, Plane } from 'lucide-react';

const Login = () => {
  const { signInWithGoogle, loading, clearAuthState } = useAuth();

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Panel - Login Form (40% on desktop, 100% on mobile) */}
      <div className="w-full lg:w-[40%] flex flex-col items-center justify-center bg-slate-50 p-6 lg:p-12">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-xl shadow-slate-100/50 p-8">
          {/* Logo/Branding */}
          <div className="mb-8 text-center">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="bg-gradient-to-br from-slate-900 to-sky-950 p-3 rounded-xl shadow-lg">
                <Briefcase className="w-8 h-8 text-cyan-400" />
              </div>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                SyMaletaLista
              </h1>
            </div>
            <p className="text-sm text-slate-500 font-normal text-center mt-2">
              Sistema Profesional de Cotización de Viajes
            </p>
          </div>

          {/* Welcome Message */}
          <div className="mb-8 text-center">
            <h2 className="text-2xl font-bold text-slate-900 mb-2">
              Bienvenido de vuelta
            </h2>
            <p className="text-slate-600 leading-relaxed">
              Gestiona tus cotizaciones de manera ágil y profesional
            </p>
          </div>

          {/* Authentication Form */}
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-slate-700 mb-6">
                Inicia sesión con tu cuenta de Google para acceder al sistema
              </p>
            </div>

            {/* Google Auth Button */}
            <button
              onClick={signInWithGoogle}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:border-cyan-500 hover:shadow-md text-slate-700 font-semibold text-sm py-4 px-6 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              <span className="group-hover:text-slate-900 transition-colors">
                Continuar con Google
              </span>
            </button>

            {/* Loading State */}
            {loading && (
              <div className="text-center">
                <div className="inline-flex items-center gap-3 text-cyan-600 font-medium">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  <span>Autenticando...</span>
                </div>
              </div>
            )}

            {/* Clear Auth State Button (Hidden functionality) */}
            <div className="mt-4 pt-4 border-t border-slate-200">
              <button
                onClick={clearAuthState}
                className="w-full text-xs text-slate-400 hover:text-red-500 transition-colors"
                title="Limpiar localStorage, sessionStorage y cerrar sesión en Supabase"
              >
              </button>
            </div>
          </div>

          {/* Security Notice */}
          <div className="mt-8 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              <p>Tus datos están protegidos y seguros</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Visual Travel Image (60% on desktop, hidden on mobile) */}
      <div className="hidden lg:flex lg:w-[60%] relative overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: 'url(https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2000&q=80)',
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900/70 via-slate-900/50 to-cyan-900/40" />
        
        {/* Content Overlay */}
        <div className="relative z-10 flex flex-col justify-center items-center h-full px-16 text-center">
          <div className="max-w-2xl">
            {/* Icon */}
            <div className="flex justify-center mb-8">
              <div className="bg-cyan-500/20 backdrop-blur-sm p-6 rounded-full border border-cyan-400/30">
                <Plane className="w-16 h-16 text-cyan-300" />
              </div>
            </div>
            
            {/* Inspirational Text */}
            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              Descubre el mundo,<br />
              <span className="text-cyan-400">cotiza con excelencia</span>
            </h2>
            
            <p className="text-xl text-white/90 font-light leading-relaxed mb-8">
              Transforma la experiencia de tus clientes con cotizaciones profesionales, 
              detalladas y personalizadas para cada destino.
            </p>
            
            {/* Feature Highlights */}
            <div className="grid grid-cols-3 gap-6 mt-12">
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-2">100%</div>
                <div className="text-white/80 text-sm">Profesional</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-2">24/7</div>
                <div className="text-white/80 text-sm">Disponible</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-2">∞</div>
                <div className="text-white/80 text-sm">Destinos</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
