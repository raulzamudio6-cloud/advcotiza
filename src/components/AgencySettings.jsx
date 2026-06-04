import React, { useState, useEffect } from 'react';
import { useAgencyConfig } from '../contexts/AgencyConfigContext';
import { Input, Button } from './UI/Input';
import { Card, CardHeader, CardContent } from './UI/Card';
import { supabase } from '../lib/supabaseClient';
import { Upload, X, Save, Loader2 } from 'lucide-react';

const AgencySettings = () => {
  const { agencyConfig, updateAgencyConfig, loading } = useAgencyConfig();
  const [formData, setFormData] = useState({
    agencyName: '',
    logoUrl: '',
    contact: {
      phone: '',
      email: ''
    },
    socialMedia: {
      instagram: '',
      facebook: ''
    },
    policies: ['']
  });
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!loading && agencyConfig) {
      setFormData({
        agencyName: agencyConfig.agencyName || '',
        logoUrl: agencyConfig.logoUrl || '',
        contact: {
          phone: agencyConfig.contact?.phone || '',
          email: agencyConfig.contact?.email || ''
        },
        socialMedia: {
          instagram: agencyConfig.socialMedia?.instagram || '',
          facebook: agencyConfig.socialMedia?.facebook || ''
        },
        policies: agencyConfig.policies || ['']
      });
      setLogoPreview(agencyConfig.logoUrl || null);
    }
  }, [agencyConfig, loading]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.match(/image\/(png|jpg|jpeg|gif|webp)/)) {
      setMessage({ type: 'error', text: 'Solo se permiten imágenes (PNG, JPG, JPEG, GIF, WEBP)' });
      return;
    }

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      setMessage({ type: 'error', text: 'El archivo no debe exceder 2MB' });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuario no autenticado');

      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${Date.now()}.${fileExt}`;

      const { data, error } = await supabase.storage
        .from('agency-logos')
        .upload(fileName, file);

      if (error) throw error;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('agency-logos')
        .getPublicUrl(fileName);

      setLogoPreview(publicUrl);
      setFormData(prev => ({ ...prev, logoUrl: publicUrl }));
      setMessage({ type: 'success', text: 'Logo cargado exitosamente' });
    } catch (error) {
      console.error('Error uploading logo:', error);
      setMessage({ type: 'error', text: 'Error al cargar el logo: ' + error.message });
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setFormData(prev => ({ ...prev, logoUrl: '' }));
  };

  const handlePolicyChange = (index, value) => {
    const newPolicies = [...formData.policies];
    newPolicies[index] = value;
    setFormData(prev => ({ ...prev, policies: newPolicies }));
  };

  const addPolicy = () => {
    setFormData(prev => ({ ...prev, policies: [...prev.policies, ''] }));
  };

  const removePolicy = (index) => {
    if (formData.policies.length > 1) {
      const newPolicies = formData.policies.filter((_, i) => i !== index);
      setFormData(prev => ({ ...prev, policies: newPolicies }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await updateAgencyConfig(formData);
      setMessage({ type: 'success', text: 'Configuración guardada exitosamente' });
    } catch (error) {
      console.error('Error saving config:', error);
      setMessage({ type: 'error', text: 'Error al guardar la configuración' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Ajustes de Agencia</h1>
        <p className="text-gray-600">Configura la información de tu agencia que aparecerá en las cotizaciones</p>
        {loading && (
          <div className="flex items-center gap-2 text-blue-600 mt-2">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">Cargando configuración...</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Logo Upload */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-800">Logo de la Agencia</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {logoPreview ? (
                <div className="relative inline-block">
                  <img
                    src={logoPreview}
                    alt="Logo preview"
                    className="h-32 w-auto object-contain border border-gray-200 rounded-lg p-2"
                  />
                  <button
                    type="button"
                    onClick={handleRemoveLogo}
                    className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-4 text-gray-500" />
                      <p className="text-sm text-gray-500">
                        <span className="font-semibold">Click para subir</span> o arrastra el archivo aquí
                      </p>
                      <p className="text-xs text-gray-500 mt-1">PNG, JPG, GIF, WEBP (Máx. 2MB)</p>
                    </div>
                    <input
                      type="file"
                      className="hidden"
                      accept="image/png,image/jpeg,image/gif,image/webp"
                      onChange={handleLogoUpload}
                      disabled={uploading}
                    />
                  </label>
                </div>
              )}
              {uploading && (
                <div className="flex items-center gap-2 text-blue-600">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span className="text-sm">Cargando logo...</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-800">Información Básica</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Nombre Comercial"
                value={formData.agencyName}
                onChange={(e) => setFormData(prev => ({ ...prev, agencyName: e.target.value }))}
                placeholder="Ej: Viajes Maleta Lista"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Contact Information */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-800">Información de Contacto</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="WhatsApp"
                type="tel"
                value={formData.contact.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contact: { ...prev.contact, phone: e.target.value }
                }))}
                placeholder="Ej: +52 (555) 123-4567"
                required
              />
              <Input
                label="Correo Electrónico"
                type="email"
                value={formData.contact.email}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  contact: { ...prev.contact, email: e.target.value }
                }))}
                placeholder="Ej: contacto@agencia.com"
                required
              />
            </div>
          </CardContent>
        </Card>

        {/* Social Media */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-800">Redes Sociales</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <Input
                label="Instagram"
                value={formData.socialMedia.instagram}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  socialMedia: { ...prev.socialMedia, instagram: e.target.value }
                }))}
                placeholder="Ej: @agencia_viajes"
              />
              <Input
                label="Facebook"
                value={formData.socialMedia.facebook}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  socialMedia: { ...prev.socialMedia, facebook: e.target.value }
                }))}
                placeholder="Ej: agencia_viajes"
              />
            </div>
          </CardContent>
        </Card>

        {/* Policies */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-gray-800">Términos y Condiciones</h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {formData.policies.map((policy, index) => (
                <div key={index} className="flex gap-2">
                  <Input
                    label={`Política ${index + 1}`}
                    value={policy}
                    onChange={(e) => handlePolicyChange(index, e.target.value)}
                    placeholder="Ej: Las reservas están sujetas a disponibilidad"
                    className="flex-1"
                  />
                  {formData.policies.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removePolicy(index)}
                      className="mt-6 px-3 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
              <button
                type="button"
                onClick={addPolicy}
                className="w-full py-2 border-2 border-dashed border-gray-300 rounded-lg text-gray-600 hover:bg-gray-50 transition-colors"
              >
                + Agregar Política
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Message */}
        {message && (
          <div className={`p-4 rounded-lg ${
            message.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}>
            {message.text}
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                Guardar Configuración
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default AgencySettings;
