# AdvCotiza - Sistema Profesional de Cotización de Viajes

Una aplicación web sofisticada diseñada para agencias de viajes y consultores para crear cotizaciones de viajes profesionales con cálculos en tiempo real, gestión de comisiones y exportación múltiple.

## Características

### Funcionalidad Principal
- **Gestión Dinámica de Pasajeros**: Agregar/eliminar pasajeros con validación de edad para menores
- **Comparación de Vuelos Multi-opción**: Comparar hasta 2 opciones de vuelos con precios detallados
- **Sistema de Selección de Hoteles**: Elegir hasta 3 opciones de hospedaje con calificación de estrellas
- **Integración de Servicios Adicionales**: Gestionar traslados y actividades/tours adicionales
- **Cálculos en Tiempo Real**: Cálculos automáticos de totales basados en selecciones
- **Panel de Vista Previa**: Vista previa instantánea de detalles de cotización
- **Generación Profesional de PDF**: Exportar cotizaciones como PDF profesionalmente formateados

### Características de Negocio Críticas
- **Sistema de Comisión de Agencia**: Campo global para configurar porcentaje de comisión
- **Lógica de Precios con Markup**: Todos los precios se tratan como costos netos con aplicación automática de comisión
- **Transparencia Interna**: Desglose de costo neto, comisión y precio final para el administrador
- **Exportación a Excel**: Generación de archivos Excel con múltiples hojas y estructura detallada
- **Interfaz 100% en Español**: Toda la aplicación completamente traducida al español

### Características Técnicas
- **Arquitectura de Componentes**: Limpia separación de responsabilidades con componentes reutilizables
- **Gestión de Estado**: Hook personalizado de React con useReducer para lógica de estado compleja
- **Diseño Responsivo**: Diseño mobile-first con Tailwind CSS
- **UI/UX Moderna**: Interfaz corporativa limpia con interacciones intuitivas
- **Validación de Formularios**: Validación del lado del cliente con mensajes amigables

## Stack Tecnológico

### Frontend
- **React 18**: React moderno con arquitectura de Hooks
- **Vite**: Servidor de desarrollo rápido y herramienta de build
- **Tailwind CSS**: Framework de CSS utility-first
- **Lucide React**: Iconografía bella y consistente

### Librerías Adicionales
- **jsPDF**: Generación profesional de documentos PDF
- **xlsx**: Exportación a Excel con SheetJS
- **date-fns**: Utilidades modernas de fechas JavaScript
- **clsx**: Utilidad de className condicional

## 📋 Requirements

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn package manager

### Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## 🚀 Getting Started

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd adv-cotiza
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

### Development

Start the development server:
```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Production Build

Create an optimized production build:
```bash
npm run build
```

Preview the production build locally:
```bash
npm run preview
```

## 📖 Usage Guide

### 1. Client Information
- Enter client's full name, email, and phone number
- All fields are validated for proper format

### 2. Passenger Management
- Click "Add Passenger" to add travelers
- For minors, select "Minor" and specify age
- Remove passengers using the delete button

### 3. Flight Options
- Configure up to 2 flight options
- Enter airline, dates, and price per passenger
- Include optional luggage (+$50 per passenger)
- Select one option by clicking on the card

### 4. Accommodation Selection
- Configure up to 3 hotel options
- Set hotel name, star rating, and total price
- Add descriptions for better client understanding
- Select one option by clicking on the card

### 5. Additional Services
- **Transfers**: Enable airport/hotel transfers with custom pricing
- **Extras**: Add tours, parks, or activities with individual pricing

### 6. Live Preview
- Right panel shows real-time quotation summary
- Displays all selected options and running totals
- Updates automatically as you make changes

### 7. PDF Generation
- Click "Generate PDF Quotation" once all required fields are complete
- PDF includes client info, selected options, and detailed pricing
- Professional formatting suitable for client presentation

## 🏗 Project Architecture

### Component Structure
```
src/
├── components/
│   ├── UI/
│   │   ├── Input.jsx          # Reusable form components
│   │   └── Card.jsx           # Card and HotelCard components
│   ├── PassengerManager.jsx   # Dynamic passenger management
│   ├── FlightModule.jsx       # Flight options and comparison
│   ├── AccommodationModule.jsx # Hotel selection interface
│   ├── AdditionalServicesModule.jsx # Services and extras
│   ├── PreviewPanel.jsx       # Real-time preview component
│   └── PDFGenerator.jsx      # PDF export functionality
├── hooks/
│   └── useTravelQuotation.js # Custom state management hook
├── App.jsx                   # Main application component
├── main.jsx                  # Application entry point
└── index.css                 # Global styles and Tailwind
```

### State Management
The application uses a custom hook `useTravelQuotation` that implements:
- **useReducer** for complex state logic
- **Action creators** for predictable state updates
- **Computed values** for derived calculations
- **Separation of concerns** between data capture and business logic

### Key Design Patterns
- **Container/Presentational**: Components separated by logic vs presentation
- **Custom Hooks**: Reusable state logic encapsulated in hooks
- **Component Composition**: Complex UI built from simple, reusable components
- **Prop Drilling Minimization**: Context-like pattern with custom hook

## 🎨 Design System

### Color Palette
- **Primary**: Blue (#3b82f6) for main actions and branding
- **Success**: Green (#10b981) for positive feedback
- **Warning**: Amber (#f59e0b) for alerts
- **Danger**: Red (#ef4444) for destructive actions
- **Neutral**: Gray scale for text and backgrounds

### Typography
- **Headings**: Bold, hierarchical sizing
- **Body**: Clean, readable sans-serif
- **Small**: Reduced opacity for secondary information

### Spacing
- Consistent 4px base unit
- Generous whitespace for readability
- Responsive padding/margins

## 🔧 Configuration

### Tailwind Configuration
Extended theme includes:
- Custom primary color palette
- Responsive breakpoints
- Component utility classes

### Vite Configuration
- React plugin for JSX support
- Development server on port 3000
- Optimized production builds

## 🧪 Testing Considerations

While this version focuses on functionality, future testing should include:
- Unit tests for utility functions
- Component integration tests
- End-to-end user flow testing
- PDF generation validation
- Responsive design testing

## 🚀 Deployment

### Static Site Deployment
The application builds to static files suitable for:
- Netlify
- Vercel
- GitHub Pages
- AWS S3 + CloudFront

### Environment Variables
No environment variables required for basic functionality.

## 📝 Development Notes

### Performance Optimizations
- React.memo for expensive components
- Debounced inputs for better UX
- Lazy loading consideration for future features

### Accessibility
- Semantic HTML5 structure
- ARIA labels where appropriate
- Keyboard navigation support
- Screen reader compatibility

### Browser Compatibility
- Modern JavaScript features (ES2020+)
- CSS Grid and Flexbox
- No IE11 support (modern browsers only)

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

### Development Guidelines
- Follow existing code style and patterns
- Use TypeScript for new components (future enhancement)
- Write meaningful commit messages
- Include tests for new functionality

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the excellent framework
- Tailwind CSS team for the utility-first CSS framework
- Lucide for the beautiful icon set
- jsPDF team for the PDF generation library

---

**AdvCotiza** - Professional Travel Quotation System  
Built with ❤️ using modern web technologies
