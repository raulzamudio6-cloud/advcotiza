import React from 'react';
import { FileSpreadsheet, Download } from 'lucide-react';
import { Button } from './UI/Input';
import * as XLSX from 'xlsx';
import { formatMXN } from '../utils/formatters';

export const ExcelExport = ({ state, calculations }) => {
  const selectedFlight = calculations.selectedFlight;
  const selectedAccommodation = calculations.selectedAccommodation;
  const { passengers, additionalServices } = state;

  const formatCurrency = (amount) => {
    return formatMXN(amount);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificado';
    // Parsear la fecha como local para evitar desfase UTC
    const [year, month, day] = dateString.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    return date.toLocaleDateString('es-MX', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const generateExcel = () => {
    // Crear un nuevo libro de trabajo
    const wb = XLSX.utils.book_new();

    // Hoja 1: Resumen General
    const summaryData = [
      [state.quotationTitle || 'COTIZACIÓN DE VIAJES - ADV COTIZA'],
      [],
      ['INFORMACIÓN DEL CLIENTE'],
      ['Nombre:', state.clientInfo.name || 'No especificado'],
      ['Correo:', state.clientInfo.email || 'No especificado'],
      ['Teléfono:', state.clientInfo.phone || 'No especificado'],
      [],
      ['DETALLES DEL VIAJE'],
      ['Número de Pasajeros:', passengers.length],
      ['% Comisión Agencia:', `${state.commissionRate}%`],
      [],
      ['RESUMEN FINANCIERO'],
      ['Costo Neto Total:', formatCurrency(calculations.netGrandTotal())],
      ['Monto de Comisión:', formatCurrency(calculations.commissionAmount())],
      ['INVERSIÓN TOTAL CLIENTE:', formatCurrency(calculations.grandTotal())],
    ];

    const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
    
    // Estilizar la hoja de resumen
    wsSummary['!cols'] = [
      { wch: 25 }, // Ancho de columna A
      { wch: 20 }, // Ancho de columna B
    ];

    // Hoja 2: Detalles de Pasajeros
    const passengerData = [
      ['PASAJEROS'],
      ['#', 'Nombre', 'Tipo', 'Edad (si aplica)'],
      ...passengers.map((passenger, index) => [
        index + 1,
        passenger.name || 'Sin nombre',
        passenger.isMinor ? 'Menor' : 'Adulto',
        passenger.isMinor ? (passenger.age || 'No especificado') : 'N/A'
      ])
    ];

    const wsPassengers = XLSX.utils.aoa_to_sheet(passengerData);
    wsPassengers['!cols'] = [
      { wch: 5 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 }
    ];

    // Hoja 3: Opciones de Vuelos
    const flightData = [
      ['OPCIONES DE VUELOS'],
      [],
      ['Opción', 'Aerolínea', 'Fecha Ida', 'Fecha Regreso', 'Precio Neto/Pasajero', 'Equipaje', 'Total Neto', 'Total Cliente'],
      ...state.flights.map((flight, index) => [
        `Opción ${index + 1}`,
        flight.airline || 'No especificado',
        formatDate(flight.outbound?.date),
        formatDate(flight.return?.date),
        flight.price || 0,
        flight.luggageDetail || 'No especificado',
        (flight.price * passengers.length).toFixed(2),
        (flight.price * passengers.length * (1 + state.commissionRate / 100)).toFixed(2)
      ])
    ];

    const wsFlights = XLSX.utils.aoa_to_sheet(flightData);
    wsFlights['!cols'] = [
      { wch: 10 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 }
    ];

    // Hoja 4: Opciones de Hospedaje
    const accommodationData = [
      ['OPCIONES DE HOSPEDAJE'],
      [],
      ['Opción', 'Hotel', 'Categoría', 'Descripción', 'Precio Neto', 'Precio Cliente'],
      ...state.accommodations.map((hotel, index) => [
        `Opción ${index + 1}`,
        hotel.name || 'No especificado',
        `${hotel.category} estrellas`,
        hotel.description || 'Sin descripción',
        hotel.totalPrice || 0,
        (hotel.totalPrice * (1 + state.commissionRate / 100)).toFixed(2)
      ])
    ];

    const wsAccommodations = XLSX.utils.aoa_to_sheet(accommodationData);
    wsAccommodations['!cols'] = [
      { wch: 10 },
      { wch: 25 },
      { wch: 12 },
      { wch: 30 },
      { wch: 15 },
      { wch: 15 }
    ];

    // Hoja 5: Servicios Adicionales
    const servicesData = [
      ['SERVICIOS ADICIONALES'],
      [],
      ['TRASLADOS'],
      ['Tipo', 'Activo', 'Precio Neto', 'Precio Cliente'],
      [
        'Traslado Estándar (Aeropuerto-Hotel-Aeropuerto)',
        additionalServices.transfers.standard ? 'Sí' : 'No',
        additionalServices.transfers.standardPrice || 0,
        additionalServices.transfers.standard ? (additionalServices.transfers.standardPrice * (1 + state.commissionRate / 100)).toFixed(2) : 0
      ],
      [
        'Traslados Extras',
        additionalServices.transfers.extraDetail ? 'Sí' : 'No',
        additionalServices.transfers.extraPrice || 0,
        additionalServices.transfers.extraPrice > 0 ? (additionalServices.transfers.extraPrice * (1 + state.commissionRate / 100)).toFixed(2) : 0
      ],
      [],
      ['EXTRAS ADICIONALES'],
      ['Nombre', 'Precio Neto', 'Precio Cliente'],
      ...additionalServices.extras.map((extra) => [
        extra.name || 'Sin nombre',
        extra.price || 0,
        (extra.price * (1 + state.commissionRate / 100)).toFixed(2)
      ])
    ];

    const wsServices = XLSX.utils.aoa_to_sheet(servicesData);
    wsServices['!cols'] = [
      { wch: 20 },
      { wch: 10 },
      { wch: 15 },
      { wch: 15 }
    ];

    // Hoja 6: Totales Detallados
    const totalsData = [
      ['RESUMEN DE TOTALES'],
      [],
      ['CATEGORÍA', 'COSTO NETO', 'COMISIÓN', 'PRECIO CLIENTE'],
      ['Vuelos', calculations.netFlightTotal().toFixed(2), (calculations.flightTotal() - calculations.netFlightTotal()).toFixed(2), calculations.flightTotal().toFixed(2)],
      ['Hospedaje', calculations.netAccommodationTotal().toFixed(2), (calculations.accommodationTotal() - calculations.netAccommodationTotal()).toFixed(2), calculations.accommodationTotal().toFixed(2)],
      ['Traslados', calculations.netTransfersTotal().toFixed(2), (calculations.transfersTotal() - calculations.netTransfersTotal()).toFixed(2), calculations.transfersTotal().toFixed(2)],
      ['Extras', calculations.netExtrasTotal().toFixed(2), (calculations.extrasTotal() - calculations.netExtrasTotal()).toFixed(2), calculations.extrasTotal().toFixed(2)],
      [],
      ['TOTALES', calculations.netGrandTotal().toFixed(2), calculations.commissionAmount().toFixed(2), calculations.grandTotal().toFixed(2)],
      [],
      ['INFORMACIÓN DE EXPORTACIÓN'],
      ['Fecha de Generación:', new Date().toLocaleDateString('es-MX')],
      ['Hora de Generación:', new Date().toLocaleTimeString('es-MX')],
      ['Sistema:', 'AdvCotiza v2.0']
    ];

    const wsTotals = XLSX.utils.aoa_to_sheet(totalsData);
    wsTotals['!cols'] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 15 },
      { wch: 15 }
    ];

    // Agregar todas las hojas al libro
    XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen General');
    XLSX.utils.book_append_sheet(wb, wsPassengers, 'Pasajeros');
    XLSX.utils.book_append_sheet(wb, wsFlights, 'Vuelos');
    XLSX.utils.book_append_sheet(wb, wsAccommodations, 'Hospedaje');
    XLSX.utils.book_append_sheet(wb, wsServices, 'Servicios');
    XLSX.utils.book_append_sheet(wb, wsTotals, 'Totales');

    // Generar y descargar el archivo Excel
    const fileName = `cotizacion-viajes-${state.clientInfo.name || 'cliente'}-${Date.now()}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  return (
    <div className="flex justify-center pt-4">
      <Button
        variant="secondary"
        size="lg"
        onClick={generateExcel}
        className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 text-white"
        disabled={!state.clientInfo.name || passengers.length === 0 || !selectedFlight || !selectedAccommodation}
      >
        <FileSpreadsheet className="w-5 h-5" />
        <span>Exportar a Excel</span>
      </Button>
    </div>
  );
};
