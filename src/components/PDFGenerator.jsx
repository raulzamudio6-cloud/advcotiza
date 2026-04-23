import React from 'react';
import { Download, FileText, Printer } from 'lucide-react';
import { Button } from './UI/Input';
import jsPDF from 'jspdf';
import { formatMXN } from '../utils/formatters';

export const PDFGenerator = ({ state, calculations, tripDuration }) => {
  const selectedFlight = calculations.selectedFlight;
  const selectedAccommodation = calculations.selectedAccommodation;
  const { passengers, additionalServices } = state;

  const formatDate = (dateString) => {
    if (!dateString) return 'No especificado';
    return new Date(dateString).toLocaleDateString('es-MX', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return formatMXN(amount);
  };

  const generatePDF = async () => {
    const doc = new jsPDF();
    
    // Configurar fuente estándar para todo el documento (helvetica)
    doc.setFont('helvetica');
    
    // Configurar colores consistentes para el tema
    const colors = {
      primary: [59, 130, 246],    // Azul
      secondary: [239, 68, 68],    // Rojo
      text: [55, 65, 81],         // Gris oscuro para texto
      light: [249, 250, 251],     // Gris muy claro para fondos
      white: [255, 255, 255],     // Blanco
      gray: [107, 114, 128],      // Gris medio
      lightGray: [156, 163, 175]  // Gris claro
    };
    
    // Cargar logo de agencia de forma asíncrona
    let logoData = null;
    try {
      const logoResponse = await fetch('/images/logo sin fondo.png');
      if (logoResponse.ok) {
        const logoBlob = await logoResponse.blob();
        logoData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(logoBlob);
        });
      }
    } catch (error) {
      console.log('Logo no encontrado, usando texto alternativo');
    }
    
    // Función para manejar saltos de página automáticos
    const checkPageBreak = (requiredHeight, currentY, margin = 20) => {
      if (currentY + requiredHeight > 280 - margin) {
        doc.addPage();
        return 20; // Reiniciar Y en nueva página
      }
      return currentY;
    };
    
    // Función para dibujar sección con altura dinámica mejorada (soporta async)
    const drawSection = async (title, content, yPosition, titleColor = colors.primary, borderColor = colors.primary) => {
      let currentY = yPosition;
      
      // Calcular altura necesaria de forma más precisa
      let neededHeight = 30; // Espacio base para título y padding
      
      if (Array.isArray(content)) {
        content.forEach((line) => {
          const lines = doc.splitTextToSize(line, 160);
          neededHeight += lines.length * 5 + 2; // 5px por línea + 2px de espaciado
        });
      } else if (typeof content === 'function') {
        neededHeight = 80; // Estimación inicial para contenido dinámico con imágenes
      }
      
      currentY = checkPageBreak(neededHeight, currentY);
      
      // Dibujar rectángulo con altura dinámica exacta
      const sectionHeight = Math.max(neededHeight, 40);
      doc.setFillColor(...colors.light);
      doc.rect(15, currentY, 180, sectionHeight, 'F');
      doc.setDrawColor(...borderColor);
      doc.setLineWidth(0.5);
      doc.rect(15, currentY, 180, sectionHeight);
      
      // Título
      doc.setFontSize(12);
      doc.setTextColor(...titleColor);
      doc.setFont('helvetica', 'bold');
      doc.text(title, 25, currentY + 15);
      
      // Contenido
      doc.setFontSize(10);
      doc.setTextColor(...colors.text);
      doc.setFont('helvetica', 'normal');
      
      if (Array.isArray(content)) {
        let contentY = currentY + 25;
        content.forEach((line, index) => {
          const lines = doc.splitTextToSize(line, 160);
          lines.forEach((textLine) => {
            if (contentY > currentY + sectionHeight - 5) {
              // Si el contenido se desborda, añadir página
              doc.addPage();
              currentY = 20;
              contentY = currentY + 25;
              
              // Redibujar encabezado de sección en nueva página
              doc.setFillColor(...colors.light);
              doc.rect(15, currentY, 180, sectionHeight, 'F');
              doc.setDrawColor(...borderColor);
              doc.setLineWidth(0.5);
              doc.rect(15, currentY, 180, sectionHeight);
              
              doc.setFontSize(12);
              doc.setTextColor(...titleColor);
              doc.setFont('helvetica', 'bold');
              doc.text(title + ' (continuación)', 25, currentY + 15);
              
              doc.setFontSize(10);
              doc.setTextColor(...colors.text);
              doc.setFont('helvetica', 'normal');
            }
            doc.text(textLine, 25, contentY);
            contentY += 5;
          });
        });
      } else if (typeof content === 'function') {
        currentY = await content(doc, currentY + 25);
      }
      
      return currentY + sectionHeight + 10;
    };
    
    // Header with professional design - White background with blue and red accents
    doc.setFillColor(...colors.white);
    doc.rect(0, 0, 210, 60, 'F');
    
    // Blue border at top
    doc.setFillColor(...colors.primary);
    doc.rect(0, 0, 210, 3, 'F');
    
    // Red accent line
    doc.setFillColor(...colors.secondary);
    doc.rect(0, 3, 210, 1, 'F');
    
    // Agregar logo si está disponible
    if (logoData) {
      try {
        doc.addImage(logoData, 'PNG', 15, 15, 35, 18);
      } catch (error) {
        console.log('Error al agregar logo, usando texto');
        doc.setFontSize(16);
        doc.setTextColor(...colors.primary);
        doc.setFont('helvetica', 'bold');
        doc.text('ADV COTIZA', 15, 30);
      }
    } else {
      doc.setFontSize(16);
      doc.setTextColor(...colors.primary);
      doc.setFont('helvetica', 'bold');
      doc.text('ADV COTIZA', 15, 30);
    }
    
    // Dynamic quotation title
    doc.setFontSize(20);
    doc.setTextColor(31, 41, 55);
    doc.setFont('helvetica', 'bold');
    const title = state.quotationTitle || 'COTIZACIÓN DE VIAJES';
    doc.text(title, 105, 25, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setTextColor(...colors.primary);
    doc.setFont('helvetica', 'normal');
    doc.text('Cotización personalizada', 105, 35, { align: 'center' });
    
    // Date in header
    doc.setFontSize(8);
    doc.setTextColor(...colors.lightGray);
    doc.setFont('helvetica', 'normal');
    doc.text(`Fecha: ${new Date().toLocaleDateString('es-MX')}`, 195, 55, { align: 'right' });
    
    let currentY = 70;
    
    // Client Information Block
    currentY = await drawSection(
      'DATOS DEL CLIENTE',
      [
        `Nombre: ${state.clientInfo.name || 'No especificado'}`,
        `Correo: ${state.clientInfo.email || 'No especificado'}`,
        `Teléfono: ${state.clientInfo.phone || 'No especificado'}`
      ],
      currentY,
      colors.primary,
      colors.primary
    );
    
    // Passengers Block
    const passengerLines = passengers.map((passenger, index) => 
      `${index + 1}. ${passenger.name || 'Sin nombre'}${passenger.isMinor ? ` (Edad: ${passenger.age || 'No especificado'})` : ''}`
    );
    
    currentY = await drawSection(
      'PASAJEROS',
      passengerLines,
      currentY,
      colors.primary,
      colors.primary
    );
    
    // Flight Information - Dynamic content
    if (selectedFlight) {
      currentY = await drawSection(
        'DETALLES DEL VUELO',
        (doc, startY) => {
          let y = startY;
          
          // Mostrar ruta principal destacada al inicio
          if (selectedFlight.route && selectedFlight.route.origin && selectedFlight.route.destination) {
            doc.setFontSize(14);
            doc.setTextColor(...colors.primary);
            doc.setFont('helvetica', 'bold');
            doc.text(`RUTA: ${selectedFlight.route.origin} ↔ ${selectedFlight.route.destination}`, 25, y);
            y += 10;
          }
          
          // Aerolínea
          doc.setFontSize(11);
          doc.setTextColor(...colors.text);
          doc.setFont('helvetica', 'normal');
          doc.text(`Aerolínea: ${selectedFlight.airline || 'No especificado'}`, 25, y);
          y += 8;
          
          // Tramo de Ida - Azul
          doc.setTextColor(...colors.primary);
          doc.setFont('helvetica', 'bold');
          doc.text('TRAMO DE IDA:', 25, y);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...colors.text);
          y += 6;
          
          if (selectedFlight.outbound.date) {
            doc.text(`Fecha: ${formatDate(selectedFlight.outbound.date)}`, 30, y);
            y += 5;
          }
          if (selectedFlight.outbound.departureTime && selectedFlight.outbound.arrivalTime) {
            doc.text(`Horario: ${selectedFlight.outbound.departureTime} - ${selectedFlight.outbound.arrivalTime}`, 30, y);
            y += 5;
          }
          if (selectedFlight.outbound.duration) {
            doc.text(`Duración: ${selectedFlight.outbound.duration}`, 30, y);
            y += 5;
          }
          if (selectedFlight.outbound.stops) {
            const lines = doc.splitTextToSize(`Escalas: ${selectedFlight.outbound.stops}`, 155);
            lines.forEach(line => {
              doc.text(line, 30, y);
              y += 5;
            });
          }
          
          // Tramo de Regreso - Rojo
          y += 3;
          doc.setTextColor(...colors.secondary);
          doc.setFont('helvetica', 'bold');
          doc.text('TRAMO DE REGRESO:', 25, y);
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(...colors.text);
          y += 6;
          
          if (selectedFlight.return.date) {
            doc.text(`Fecha: ${formatDate(selectedFlight.return.date)}`, 30, y);
            y += 5;
          }
          if (selectedFlight.return.departureTime && selectedFlight.return.arrivalTime) {
            doc.text(`Horario: ${selectedFlight.return.departureTime} - ${selectedFlight.return.arrivalTime}`, 30, y);
            y += 5;
          }
          if (selectedFlight.return.duration) {
            doc.text(`Duración: ${selectedFlight.return.duration}`, 30, y);
            y += 5;
          }
          if (selectedFlight.return.stops) {
            const lines = doc.splitTextToSize(`Escalas: ${selectedFlight.return.stops}`, 155);
            lines.forEach(line => {
              doc.text(line, 30, y);
              y += 5;
            });
          }
          
          // Equipaje
          if (selectedFlight.luggageDetail) {
            const lines = doc.splitTextToSize(`Equipaje: ${selectedFlight.luggageDetail}`, 160);
            lines.forEach(line => {
              doc.text(line, 25, y);
              y += 5;
            });
          }
          
          // Total vuelo
          y += 5;
          doc.setTextColor(...colors.primary);
          doc.setFont('helvetica', 'bold');
          doc.text(`Total Vuelo: ${formatCurrency(calculations.flightTotal())}`, 25, y);
          
          return y;
        },
        currentY,
        colors.primary,
        colors.primary
      );
    }
    
    // Accommodation Information - Dynamic content
    if (selectedAccommodation) {
      currentY = await drawSection(
        'DETALLES DEL HOSPEDAJE',
        async (doc, startY) => {
          let y = startY;
          
          // Handle hotel image
          if (selectedAccommodation.image) {
            try {
              // Check if it's a data URL or external URL
              let imageData = selectedAccommodation.image;
              
              if (selectedAccommodation.image.startsWith('http')) {
                // Fetch external image
                const response = await fetch(selectedAccommodation.image);
                if (response.ok) {
                  const blob = await response.blob();
                  imageData = await new Promise((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result);
                    reader.readAsDataURL(blob);
                  });
                }
              }
              
              // Add image to PDF
              doc.addImage(imageData, 'JPEG', 25, y, 40, 30);
              y += 35;
            } catch (error) {
              console.log('Error al cargar imagen del hotel, continuando sin imagen');
              // Add placeholder text
              doc.setTextColor(...colors.gray);
              doc.setFontSize(8);
              doc.text('[Imagen no disponible]', 25, y + 10);
              doc.setTextColor(...colors.text);
              doc.setFontSize(10);
              y += 20;
            }
          }
          
          doc.text(`Hotel: ${selectedAccommodation.name || 'No especificado'}`, 25, y);
          y += 6;
          doc.text(`Categoría: ${selectedAccommodation.category} estrellas`, 25, y);
          y += 6;
          
          if (selectedAccommodation.description) {
            const lines = doc.splitTextToSize(selectedAccommodation.description, 160);
            lines.forEach(line => {
              doc.text(line, 25, y);
              y += 5;
            });
          }
          
          doc.setTextColor(...colors.primary);
          doc.setFont('helvetica', 'bold');
          doc.text(`Total Hospedaje: ${formatCurrency(calculations.accommodationTotal())}`, 25, y + 5);
          
          return y;
        },
        currentY,
        colors.primary,
        colors.primary
      );
    }
    
    // Additional Services - Dynamic content
    const hasServices = additionalServices.transfers.standard || additionalServices.extras.length > 0;
    
    if (hasServices) {
      currentY = await drawSection(
        'SERVICIOS ADICIONALES',
        async (doc, startY) => {
          let y = startY;
          
          if (additionalServices.transfers.standard) {
            doc.text(`Traslado Estándar: ${formatCurrency(additionalServices.transfers.standardPrice * (1 + state.commissionRate / 100))}`, 25, y);
            y += 7;
          }
          
          if (additionalServices.transfers.extraDetail) {
            doc.text(`Traslado Extra: ${additionalServices.transfers.extraDetail} - ${formatCurrency(additionalServices.transfers.extraPrice * (1 + state.commissionRate / 100))}`, 25, y);
            y += 7;
          }
          
          // Process extras with images
          for (const extra of additionalServices.extras) {
            // Handle extra image
            if (extra.image) {
              try {
                // Check if it's a data URL or external URL
                let imageData = extra.image;
                
                if (extra.image.startsWith('http')) {
                  // Fetch external image
                  const response = await fetch(extra.image);
                  if (response.ok) {
                    const blob = await response.blob();
                    imageData = await new Promise((resolve) => {
                      const reader = new FileReader();
                      reader.onloadend = () => resolve(reader.result);
                      reader.readAsDataURL(blob);
                    });
                  }
                }
                
                // Add image to PDF
                doc.addImage(imageData, 'JPEG', 25, y, 30, 25);
                y += 30;
              } catch (error) {
                console.log('Error al cargar imagen del extra, continuando sin imagen');
                // Add placeholder text
                doc.setTextColor(...colors.gray);
                doc.setFontSize(8);
                doc.text('[Imagen no disponible]', 25, y + 10);
                doc.setTextColor(...colors.text);
                doc.setFontSize(10);
                y += 20;
              }
            }
            
            doc.text(`${extra.name || 'Extra sin nombre'}: ${formatCurrency(extra.price * (1 + state.commissionRate / 100))}`, 25, y);
            y += 7;
          }
          
          return y;
        },
        currentY,
        [75, 85, 99],
        colors.lightGray
      );
    }
    
    // Total Summary - Dynamic content
    currentY = await drawSection(
      'RESUMEN DE TOTALES',
      [
        `Total Vuelos: ${formatCurrency(calculations.flightTotal())}`,
        `Total Hospedaje: ${formatCurrency(calculations.accommodationTotal())}`,
        `Total Servicios: ${formatCurrency(calculations.transfersTotal() + calculations.extrasTotal())}`
      ],
      currentY,
      colors.primary,
      colors.primary
    );
    
    // Grand Total Block - Green with blue border
    currentY = checkPageBreak(30, currentY);
    doc.setFillColor(34, 197, 94);
    doc.rect(15, currentY, 180, 25, 'F');
    doc.setDrawColor(...colors.primary);
    doc.setLineWidth(1);
    doc.rect(15, currentY, 180, 25);
    
    doc.setFontSize(24);
    doc.setTextColor(...colors.white);
    doc.setFont('helvetica', 'bold');
    doc.text(`INVERSIÓN TOTAL: ${formatCurrency(calculations.grandTotal())}`, 25, currentY + 17);
    
    currentY += 35;
    
    // Sección Legal - NOTAS IMPORTANTES Y POLÍTICAS
    const legalText = [
      '1. Las cotizaciones son válidas por 72 horas a partir de la fecha de emisión.',
      '2. Los precios están sujetos a disponibilidad y pueden variar sin previo aviso.',
      '3. Los pagos deben realizarse según los términos y condiciones establecidos.',
      '4. La cancelación de reservas está sujeta a las políticas de cada proveedor.',
      '5. Es responsabilidad del pasajero contar con documentación válida (pasaporte, visas, etc.).',
      '6. La agencia no se responsabiliza por cambios de vuelo o cancelaciones por causas de fuerza mayor.',
      '7. Los paquetes incluyen lo especificado en el itinerario, cualquier servicio adicional tiene costo extra.',
      '8. Las tarifas no incluyen impuestos de salida ni tasas turísticas locales.'
    ];
    
    currentY = await drawSection(
      'NOTAS IMPORTANTES Y POLÍTICAS',
      legalText,
      currentY,
      [0, 0, 0],
      colors.secondary
    );
    
    // Sección Legal - PROTECCIÓN Y SEGURO DE VIAJERO
    const insuranceText = [
      '1. RECOMENDACIÓN SEGURO: Se recomienda contratar un seguro de viaje completo que cubra:',
      '   - Gastos médicos por enfermedad o accidente',
      '   - Pérdida o daño de equipaje',
      '   - Cancelación o interrupción de viaje',
      '   - Responsabilidad civil personal',
      '2. COBERTURA MÉDICA: Verifique que su seguro médico actual cubra emergencias en el destino.',
      '3. PROTECCIÓN DE EQUIPAJE: La aerolínea limita su responsabilidad por pérdida o daño de equipaje.',
      '   Se recomienda seguro adicional para artículos de valor.',
      '4. DOCUMENTACIÓN: Mantenga copias de documentos importantes (pasaportes, visas, reservas).',
      '5. CONTACTO DE EMERGENCIA: Proporcione a la agencia contacto de emergencia familiar.',
      '6. EXCLUSIONES: La mayoría de seguros no cubren condiciones preexistentes o actividades extremas.',
      'Para mayor información sobre opciones de seguro, consulte con su asesor de viajes.'
    ];
    
    currentY = await drawSection(
      'PROTECCIÓN Y SEGURO DE VIAJERO',
      insuranceText,
      currentY,
      [0, 0, 0],
      colors.secondary
    );
    
    // Sección MSI - Financiación
    currentY = checkPageBreak(50, currentY);
    
    // Cargar imagen MSI de forma asíncrona
    let msiData = null;
    try {
      const msiResponse = await fetch('/images/MSI.png');
      if (msiResponse.ok) {
        const msiBlob = await msiResponse.blob();
        msiData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(msiBlob);
        });
      }
    } catch (error) {
      console.log('Imagen MSI no encontrada');
    }
    
    // Agregar imagen MSI si está disponible
    if (msiData) {
      try {
        doc.addImage(msiData, 'PNG', 75, currentY, 60, 24);
        currentY += 30;
      } catch (error) {
        console.log('Error al agregar imagen MSI');
        doc.setFontSize(14);
        doc.setTextColor(...colors.primary);
        doc.setFont('helvetica', 'bold');
        doc.text('MESES SIN INTERESES', 105, currentY + 10, { align: 'center' });
        currentY += 20;
      }
    } else {
      doc.setFontSize(14);
      doc.setTextColor(...colors.primary);
      doc.setFont('helvetica', 'bold');
      doc.text('MESES SIN INTERESES', 105, currentY + 10, { align: 'center' });
      currentY += 20;
    }
    
    // Leyenda de financiación
    doc.setFontSize(10);
    doc.setTextColor(50);
    doc.setFont('helvetica', 'normal');
    const financingText = 'Aceptamos Meses sin intereses; se aplica una comisión de gestión del 11% para diferir hasta 9 meses sin intereses.';
    const financingLines = doc.splitTextToSize(financingText, 170);
    financingLines.forEach(line => {
      doc.text(line, 105, currentY, { align: 'center' });
      currentY += 5;
    });
    
    currentY += 15;
    
    // Footer con imagen institucional
    currentY = checkPageBreak(40, currentY, 10);
    
    // Cargar imagen footer de forma asíncrona
    let footerData = null;
    try {
      const footerResponse = await fetch('/images/footer.png');
      if (footerResponse.ok) {
        const footerBlob = await footerResponse.blob();
        footerData = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(footerBlob);
        });
      }
    } catch (error) {
      console.log('Imagen footer no encontrada');
    }
    
    // Agregar imagen footer si está disponible
    if (footerData) {
      try {
        // Calcular posición para que la imagen esté en la parte inferior de la página
        const footerY = 283; // Posición fija cerca del final
        doc.addImage(footerData, 'PNG', 0, footerY, 210, 15); // Ancho completo de la página (210mm)
      } catch (error) {
        console.log('Error al agregar imagen footer');
        // Fallback a footer de texto
        doc.setFillColor(...colors.primary);
        doc.rect(0, 270, 210, 30, 'F');
        
        doc.setFontSize(10);
        doc.setTextColor(...colors.white);
        doc.setFont('helvetica', 'bold');
        
        const contactY = 285;
        doc.text('📱 WhatsApp: 442 6780784', 30, contactY);
        doc.text('📧 Email: vdvmaletalista@gmail.com', 90, contactY);
        doc.text('📷 Instagram: @vdvmaletalista', 30, contactY + 10);
        doc.text('📘 Facebook: @vdvmaletalista', 90, contactY + 10);
      }
    } else {
      // Fallback a footer de texto si no hay imagen
      doc.setFillColor(...colors.primary);
      doc.rect(0, 270, 210, 30, 'F');
      
      doc.setFontSize(10);
      doc.setTextColor(...colors.white);
      doc.setFont('helvetica', 'bold');
      
      const contactY = 285;
      doc.text('📱 WhatsApp: 442 6780784', 30, contactY);
      doc.text('📧 Email: vdvmaletalista@gmail.com', 90, contactY);
      doc.text('📷 Instagram: @vdvmaletalista', 30, contactY + 10);
      doc.text('📘 Facebook: @vdvmaletalista', 90, contactY + 10);
    }
    
    
    
    // Save the PDF
    doc.save(`cotizacion-viajes-${state.clientInfo.name || 'cliente'}-${Date.now()}.pdf`);
  };

  const generatePrintView = () => {
    const printWindow = window.open('', '_blank');
    
    const formatDate = (dateString) => {
      if (!dateString) return 'No especificado';
      return new Date(dateString).toLocaleDateString('es-MX', {
        month: 'long',
        day: 'numeric',
        year: 'numeric'
      });
    };

    const formatCurrency = (amount) => {
      return formatMXN(amount);
    };

    const passengerLines = passengers.map((passenger, index) => 
      `${index + 1}. ${passenger.name || 'Sin nombre'}${passenger.isMinor ? ` (Edad: ${passenger.age || 'No especificado'})` : ''}`
    ).join('<br>');

    const printContent = `
      <!DOCTYPE html>
      <html lang="es-MX">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${state.quotationTitle || 'COTIZACIÓN DE VIAJES'}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Verdana:wght@400;700&display=swap');
          
          * {
            font-family: 'Verdana', sans-serif;
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-size: 12px;
            line-height: 1.4;
            color: #374151;
            background: white;
            padding: 20px;
          }
          
          .header {
            background: white;
            border-bottom: 3px solid #3B82F6;
            border-top: 1px solid #EF4444;
            padding: 30px 0;
            margin-bottom: 20px;
            text-align: center;
          }
          
          .logo-section {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            margin-bottom: 20px;
          }
          
          .logo {
            max-width: 120px;
            height: auto;
            margin-bottom: 15px;
          }
          
          .logo-text {
            font-size: 24px;
            font-weight: bold;
            color: #3B82F6;
            margin-bottom: 5px;
          }
          
          .date {
            font-size: 10px;
            color: #9CA3AF;
            text-align: center;
            margin-bottom: 15px;
          }
          
          .title {
            font-size: 24px;
            font-weight: bold;
            color: #1F2937;
            margin-bottom: 8px;
            font-family: 'Verdana', sans-serif;
          }
          
          .subtitle {
            font-size: 12px;
            color: #3B82F6;
            font-family: 'Verdana', sans-serif;
          }
          
          .duration-subtitle {
            font-size: 14px;
            color: #6B7280;
            font-style: italic;
            margin-bottom: 8px;
            font-family: 'Verdana', sans-serif;
          }
          
          .section {
            background: #F9FAFB;
            border: 1px solid #3B82F6;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            page-break-inside: avoid;
          }
          
          .section-title {
            font-size: 12px;
            font-weight: bold;
            color: #3B82F6;
            margin-bottom: 10px;
          }
          
          .section-content {
            font-size: 10px;
            color: #374151;
          }
          
          .section-content p {
            margin-bottom: 5px;
          }
          
          .flight-section .outbound {
            color: #3B82F6;
            font-weight: bold;
            margin-bottom: 8px;
          }
          
          .flight-section .return {
            color: #EF4444;
            font-weight: bold;
            margin-bottom: 8px;
          }
          
          .total-section {
            background: #22C55E;
            border: 2px solid #3B82F6;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            text-align: center;
          }
          
          .total-title {
            font-size: 24px;
            font-weight: bold;
            color: white;
          }
          
          .legal-section {
            background: #F9FAFB;
            border: 1px solid #EF4444;
            border-radius: 8px;
            padding: 15px;
            margin-bottom: 15px;
            page-break-inside: avoid;
          }
          
          .legal-section .section-title {
            color: black;
          }
          
          .msi-section {
            text-align: center;
            margin: 20px 0;
            page-break-inside: avoid;
          }
          
          .msi-section img {
            max-width: 60px;
            height: auto;
          }
          
          .msi-title {
            font-size: 14px;
            font-weight: bold;
            color: #3B82F6;
            margin-bottom: 10px;
          }
          
          .msi-text {
            font-size: 10px;
            color: #323232;
            max-width: 400px;
            margin: 0 auto;
          }
          
          .footer {
            background: #3B82F6;
            color: white;
            padding: 10px 20px;
            text-align: center;
            font-size: 10px;
            font-weight: bold;
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
          }
          
          .hotel-gallery {
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            gap: 12px;
            margin-bottom: 15px;
            justify-content: flex-start;
            align-items: center;
          }
          
          .hotel-image {
            width: 400px;
            height: 300px;
            object-fit: cover;
            border-radius: 8px;
            flex-shrink: 0;
            max-width: 100%;
          }
          
          .extra-image {
            max-width: 100px;
            max-height: 80px;
            object-fit: cover;
            border-radius: 4px;
            margin-bottom: 10px;
          }
          
          .image-placeholder {
            width: 100px;
            height: 80px;
            background: #E5E7EB;
            border-radius: 4px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #6B7280;
            font-size: 12px;
            margin-bottom: 10px;
          }
          
          @media print {
            body {
              padding: 0;
            }
            
            .no-print {
              display: none !important;
            }
            
            .section {
              page-break-inside: avoid;
            }
            
            .total-section {
              page-break-inside: avoid;
            }
            
            .legal-section {
              page-break-inside: avoid;
            }
            
            .msi-section {
              page-break-inside: avoid;
            }
            
            .footer {
              position: fixed;
              bottom: 0;
            }
            
            @page {
              margin: 20mm;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-section">
            <img src="/images/logo sin fondo.png" alt="ADV COTIZA" class="logo" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';" />
            <div class="logo-text" style="display: none;">ADV COTIZA</div>
            <div class="date">Fecha: ${new Date().toLocaleDateString('es-MX')}</div>
          </div>
          <div class="title">${state.quotationTitle || 'COTIZACIÓN DE VIAJES'}</div>
          ${tripDuration && tripDuration.valid ? 
            `<div class="duration-subtitle">${tripDuration.days} Días / ${tripDuration.nights} Noches</div>` : ''
          }
          <div class="subtitle">Cotización personalizada</div>
        </div>
        
        <div class="section">
          <div class="section-title">DATOS DEL CLIENTE</div>
          <div class="section-content">
            <p>Nombre: ${state.clientInfo.name || 'No especificado'}</p>
            <p>Correo: ${state.clientInfo.email || 'No especificado'}</p>
            <p>Teléfono: ${state.clientInfo.phone || 'No especificado'}</p>
          </div>
        </div>
        
        <div class="section">
          <div class="section-title">PASAJEROS</div>
          <div class="section-content">
            ${passengerLines}
          </div>
        </div>
        
        ${selectedFlight ? `
        <div class="section">
          <div class="section-title">DETALLES DEL VUELO</div>
          <div class="section-content">
            ${selectedFlight.airline ? `<p><strong>Aerolínea:</strong> ${selectedFlight.airline}</p>` : ''}
            
            <table style="width: 100%; border-collapse: collapse; font-family: 'Verdana', sans-serif; margin: 10px 0;">
              <thead>
                <tr style="background: #f0f0f0; border-bottom: 2px solid #d0d0d0;">
                  <th style="padding: 8px; text-align: left; font-size: 10px; font-weight: bold; color: #374151; border: 1px solid #d0d0d0;">Ruta (Escalas)</th>
                  <th style="padding: 8px; text-align: left; font-size: 10px; font-weight: bold; color: #374151; border: 1px solid #d0d0d0;">Fecha</th>
                  <th style="padding: 8px; text-align: left; font-size: 10px; font-weight: bold; color: #374151; border: 1px solid #d0d0d0;">Hora Salida</th>
                  <th style="padding: 8px; text-align: left; font-size: 10px; font-weight: bold; color: #374151; border: 1px solid #d0d0d0;">Hora Llegada</th>
                  <th style="padding: 8px; text-align: left; font-size: 10px; font-weight: bold; color: #374151; border: 1px solid #d0d0d0;">Duración del viaje</th>
                  <th style="padding: 8px; text-align: left; font-size: 10px; font-weight: bold; color: #374151; border: 1px solid #d0d0d0;">Equipaje</th>
                </tr>
              </thead>
              <tbody>
                <tr style="border: 1px solid #d0d0d0;">
                  <td style="padding: 8px; font-size: 9px; border: 1px solid #d0d0d0;">
                    <div style="font-weight: bold; color: #3B82F6;">
                      ${selectedFlight.outbound.origin || selectedFlight.route.origin || 'N/A'} → ${selectedFlight.outbound.destination || selectedFlight.route.destination || 'N/A'}
                    </div>
                    <div style="font-size: 8px; color: #6B7280; margin-top: 2px;">
                      ${selectedFlight.outbound.stops || 'Vuelo Directo'}
                    </div>
                  </td>
                  <td style="padding: 8px; font-size: 9px; border: 1px solid #d0d0d0;">
                    ${selectedFlight.outbound.date ? formatDate(selectedFlight.outbound.date) : 'N/A'}
                  </td>
                  <td style="padding: 8px; font-size: 9px; border: 1px solid #d0d0d0;">
                    ${selectedFlight.outbound.departureTime || '--:--'}
                  </td>
                  <td style="padding: 8px; font-size: 9px; border: 1px solid #d0d0d0;">
                    ${selectedFlight.outbound.arrivalTime || '--:--'}
                  </td>
                  <td style="padding: 8px; font-size: 9px; border: 1px solid #d0d0d0;">
                    <span style="display: inline-block; padding: 2px 6px; border-radius: 10px; font-size: 8px; font-weight: bold; background: #DBEAFE; color: #1E40AF;">
                      ${selectedFlight.outbound.duration || '--'}
                    </span>
                  </td>
                  <td style="padding: 8px; font-size: 8px; border: 1px solid #d0d0d0;" rowspan="2">
                    ${selectedFlight.luggageDetail || 'No especificado'}
                  </td>
                </tr>
                <tr style="border: 1px solid #d0d0d0;">
                  <td style="padding: 8px; font-size: 9px; border: 1px solid #d0d0d0;">
                    <div style="font-weight: bold; color: #EF4444;">
                      ${selectedFlight.return.origin || selectedFlight.route.destination || 'N/A'} → ${selectedFlight.return.destination || selectedFlight.route.origin || 'N/A'}
                    </div>
                    <div style="font-size: 8px; color: #6B7280; margin-top: 2px;">
                      ${selectedFlight.return.stops || 'Vuelo Directo'}
                    </div>
                  </td>
                  <td style="padding: 8px; font-size: 9px; border: 1px solid #d0d0d0;">
                    ${selectedFlight.return.date ? formatDate(selectedFlight.return.date) : 'N/A'}
                  </td>
                  <td style="padding: 8px; font-size: 9px; border: 1px solid #d0d0d0;">
                    ${selectedFlight.return.departureTime || '--:--'}
                  </td>
                  <td style="padding: 8px; font-size: 9px; border: 1px solid #d0d0d0;">
                    ${selectedFlight.return.arrivalTime || '--:--'}
                  </td>
                  <td style="padding: 8px; font-size: 9px; border: 1px solid #d0d0d0;">
                    <span style="display: inline-block; padding: 2px 6px; border-radius: 10px; font-size: 8px; font-weight: bold; background: #FEE2E2; color: #991B1B;">
                      ${selectedFlight.return.duration || '--'}
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
        ` : ''}
        
        ${selectedAccommodation ? `
        <div class="section">
          <div class="section-title">DETALLES DEL HOSPEDAJE</div>
          <div class="section-content">
            <p><strong>Hotel:</strong> ${selectedAccommodation.name || 'No especificado'}</p>
            <p><strong>Categoría:</strong> ${selectedAccommodation.category} estrellas</p>
            ${selectedAccommodation.description ? `<p>${selectedAccommodation.description}</p>` : ''}
            
            ${selectedAccommodation.images && selectedAccommodation.images.some(img => img && img.trim() !== '') ? 
              `<div style="margin-top: 15px;">
                <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
                  ${selectedAccommodation.images.map((img, index) => 
                    img && img.trim() !== '' ? 
                      `<div style="flex-shrink: 0;">
                        <img src="${img}" alt="${selectedAccommodation.name} - Imagen ${index + 1}" style="width: 280px; height: 210px; object-fit: cover; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);" onerror="this.style.display='none';">
                      </div>` : ''
                  ).join('')}
                </div>
              </div>` : ''
            }
          </div>
        </div>
        ` : ''}
        
        ${(additionalServices.transfers.standard || additionalServices.extras.length > 0) ? `
        <div class="section">
          <div class="section-title">SERVICIOS ADICIONALES</div>
          <div class="section-content">
            ${additionalServices.transfers.standard ? 
              `<p>Traslado Estándar: Aeropuerto - Hotel - Aeropuerto</p>` : ''
            }
            
            ${additionalServices.transfers.extraDetail ? 
              `<p>Traslados Extras: ${additionalServices.transfers.extraDetail}</p>` : ''
            }
            
            ${additionalServices.extras.map((extra, index) => 
              extra.name ? `<p>${extra.name}</p>` : ''
            ).join('')}
            ${additionalServices.extras.map(extra => 
              `<div style="margin-bottom: 10px;">
                ${extra.image ? 
                  `<img src="${extra.image}" alt="${extra.name}" class="extra-image">` :
                  `<div class="image-placeholder">Sin imagen</div>`
                }
                <p>${extra.name || 'Extra sin nombre'}</p>
              </div>`
            ).join('')}
          </div>
        </div>
        ` : ''}
        
        <div class="total-section">
          <div class="total-title">INVERSIÓN TOTAL: ${formatCurrency(calculations.grandTotal())}</div>
          <div class="section-content" style="text-align: center;">
            <p style="font-size: 14px; color: #6B7280; margin-top: 10px;">
              Precio final por todo el paquete de viajes
            </p>
          </div>
        </div>
        
        <div class="legal-section">
          <div class="section-title">NOTAS IMPORTANTES Y POLÍTICAS</div>
          <div class="section-content">
            <p>1. Las cotizaciones son válidas por 72 horas a partir de la fecha de emisión.</p>
            <p>2. Los precios están sujetos a disponibilidad y pueden variar sin previo aviso.</p>
            <p>3. Los pagos deben realizarse según los términos y condiciones establecidos.</p>
            <p>4. La cancelación de reservas está sujeta a las políticas de cada proveedor.</p>
            <p>5. Es responsabilidad del pasajero contar con documentación válida (pasaporte, visas, etc.).</p>
            <p>6. La agencia no se responsabiliza por cambios de vuelo o cancelaciones por causas de fuerza mayor.</p>
            <p>7. Los paquetes incluyen lo especificado en el itinerario, cualquier servicio adicional tiene costo extra.</p>
            <p>8. Las tarifas no incluyen impuestos de salida ni tasas turísticas locales.</p>
          </div>
        </div>
        
        <div class="legal-section">
          <div class="section-title">PROTECCIÓN Y SEGURO DE VIAJERO</div>
          <div class="section-content">
            <p>1. RECOMENDACIÓN SEGURO: Se recomienda contratar un seguro de viaje completo que cubra:</p>
            <p>   - Gastos médicos por enfermedad o accidente</p>
            <p>   - Pérdida o daño de equipaje</p>
            <p>   - Cancelación o interrupción de viaje</p>
            <p>   - Responsabilidad civil personal</p>
            <p>2. COBERTURA MÉDICA: Verifique que su seguro médico actual cubra emergencias en el destino.</p>
            <p>3. PROTECCIÓN DE EQUIPAJE: La aerolínea limita su responsabilidad por pérdida o daño de equipaje. Se recomienda seguro adicional para artículos de valor.</p>
            <p>4. DOCUMENTACIÓN: Mantenga copias de documentos importantes (pasaportes, visas, reservas).</p>
            <p>5. CONTACTO DE EMERGENCIA: Proporcione a la agencia contacto de emergencia familiar.</p>
            <p>6. EXCLUSIONES: La mayoría de seguros no cubren condiciones preexistentes o actividades extremas.</p>
            <p>Para mayor información sobre opciones de seguro, consulte con su asesor de viajes.</p>
          </div>
        </div>
        
        <div class="msi-section">
          <div class="msi-title">MESES SIN INTERESES</div>
          <p class="msi-text">Aceptamos Meses sin intereses; se aplica una comisión de gestión del 11% para diferir hasta 9 meses sin intereses.</p>
        </div>
        
        <div class="footer">
          <div>WhatsApp: 442 6780784 | Email: vdvmaletalista@gmail.com | Instagram: @vdvmaletalista | Facebook: @vdvmaletalista</div>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.focus();
  };

  const [isGenerating, setIsGenerating] = React.useState(false);

  const handleGeneratePDF = async () => {
    setIsGenerating(true);
    try {
      await generatePDF();
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="flex justify-center pt-4 space-x-4">
      <Button
        variant="outline"
        size="lg"
        onClick={generatePrintView}
        className="flex items-center space-x-2"
        disabled={!state.clientInfo.name || passengers.length === 0 || !selectedFlight || !selectedAccommodation}
      >
        <Printer className="w-5 h-5" />
        <span>Vista de Impresión (HTML)</span>
      </Button>
    </div>
  );
};
