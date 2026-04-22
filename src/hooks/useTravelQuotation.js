import { useReducer } from 'react';

// Estado inicial del cotizador
const initialState = {
  quotationTitle: '',
  clientInfo: {
    name: '',
    email: '',
    phone: ''
  },
  commissionRate: 20, // % de comisión por defecto
  passengers: [],
  flights: [
    {
      id: 1,
      airline: '',
      price: 0,
      route: {
        origin: '',
        destination: ''
      },
      outbound: {
        date: '',
        departureTime: '',
        arrivalTime: '',
        duration: '',
        stops: ''
      },
      return: {
        date: '',
        departureTime: '',
        arrivalTime: '',
        duration: '',
        stops: ''
      },
      luggageDetail: '',
      selected: false
    },
    {
      id: 2,
      airline: '',
      price: 0,
      route: {
        origin: '',
        destination: ''
      },
      outbound: {
        date: '',
        departureTime: '',
        arrivalTime: '',
        duration: '',
        stops: ''
      },
      return: {
        date: '',
        departureTime: '',
        arrivalTime: '',
        duration: '',
        stops: ''
      },
      luggageDetail: '',
      selected: false
    }
  ],
  accommodations: [
    {
      id: 1,
      name: '',
      category: 3,
      totalPrice: 0,
      description: '',
      selected: false,
      images: ['', '', '']
    },
    {
      id: 2,
      name: '',
      category: 3,
      totalPrice: 0,
      description: '',
      selected: false,
      images: ['', '', '']
    },
    {
      id: 3,
      name: '',
      category: 3,
      totalPrice: 0,
      description: '',
      selected: false,
      images: ['', '', '']
    }
  ],
  additionalServices: {
    transfers: {
      standard: false,
      standardPrice: 0,
      extraDetail: '',
      extraPrice: 0
    },
    extras: []
  }
};

// Action types
const actionTypes = {
  SET_QUOTATION_TITLE: 'SET_QUOTATION_TITLE',
  SET_CLIENT_INFO: 'SET_CLIENT_INFO',
  SET_COMMISSION_RATE: 'SET_COMMISSION_RATE',
  ADD_PASSENGER: 'ADD_PASSENGER',
  UPDATE_PASSENGER: 'UPDATE_PASSENGER',
  REMOVE_PASSENGER: 'REMOVE_PASSENGER',
  UPDATE_FLIGHT: 'UPDATE_FLIGHT',
  SELECT_FLIGHT: 'SELECT_FLIGHT',
  UPDATE_ACCOMMODATION: 'UPDATE_ACCOMMODATION',
  SELECT_ACCOMMODATION: 'SELECT_ACCOMMODATION',
  UPDATE_TRANSFERS: 'UPDATE_TRANSFERS',
  ADD_EXTRA: 'ADD_EXTRA',
  UPDATE_EXTRA: 'UPDATE_EXTRA',
  REMOVE_EXTRA: 'REMOVE_EXTRA',
  RESET_QUOTATION: 'RESET_QUOTATION'
};

// Reducer para manejar el estado
function quotationReducer(state, action) {
  switch (action.type) {
    case actionTypes.SET_QUOTATION_TITLE:
      return {
        ...state,
        quotationTitle: action.payload
      };

    case actionTypes.SET_CLIENT_INFO:
      return {
        ...state,
        clientInfo: { ...state.clientInfo, ...action.payload }
      };

    case actionTypes.SET_COMMISSION_RATE:
      return {
        ...state,
        commissionRate: action.payload
      };

    case actionTypes.ADD_PASSENGER:
      return {
        ...state,
        passengers: [...state.passengers, {
          id: Date.now(),
          name: '',
          isMinor: false,
          age: 0
        }]
      };

    case actionTypes.UPDATE_PASSENGER:
      return {
        ...state,
        passengers: state.passengers.map(passenger =>
          passenger.id === action.payload.id
            ? { ...passenger, ...action.payload.updates }
            : passenger
        )
      };

    case actionTypes.REMOVE_PASSENGER:
      return {
        ...state,
        passengers: state.passengers.filter(p => p.id !== action.payload.id)
      };

    case actionTypes.UPDATE_FLIGHT:
      return {
        ...state,
        flights: state.flights.map(flight => {
          if (flight.id === action.payload.id) {
            // Manejar actualizaciones anidadas para outbound y return
            const updates = action.payload.updates;
            const updatedFlight = { ...flight };
            
            Object.keys(updates).forEach(key => {
              if (key.includes('.')) {
                const [parent, child] = key.split('.');
                updatedFlight[parent] = {
                  ...updatedFlight[parent],
                  [child]: updates[key]
                };
              } else {
                updatedFlight[key] = updates[key];
              }
            });
            
            return updatedFlight;
          }
          return flight;
        })
      };

    case actionTypes.SELECT_FLIGHT:
      return {
        ...state,
        flights: state.flights.map(flight => ({
          ...flight,
          selected: flight.id === action.payload.id
        }))
      };

    case actionTypes.UPDATE_ACCOMMODATION:
      return {
        ...state,
        accommodations: state.accommodations.map(accommodation => {
          if (accommodation.id === action.payload.id) {
            const updatedAccommodation = { ...accommodation, ...action.payload.updates };
            // Asegurar que siempre tenga la propiedad images
            if (!updatedAccommodation.images) {
              updatedAccommodation.images = ['', '', ''];
            }
            return updatedAccommodation;
          }
          // Asegurar que todos los hoteles tengan la propiedad images
          if (!accommodation.images) {
            return { ...accommodation, images: ['', '', ''] };
          }
          return accommodation;
        })
      };

    case actionTypes.SELECT_ACCOMMODATION:
      return {
        ...state,
        accommodations: state.accommodations.map(accommodation => {
          const updatedAccommodation = {
            ...accommodation,
            selected: accommodation.id === action.payload.id
          };
          // Asegurar que siempre tenga la propiedad images
          if (!updatedAccommodation.images) {
            updatedAccommodation.images = ['', '', ''];
          }
          return updatedAccommodation;
        })
      };

    case actionTypes.UPDATE_TRANSFERS:
      return {
        ...state,
        additionalServices: {
          ...state.additionalServices,
          transfers: { ...state.additionalServices.transfers, ...action.payload }
        }
      };

    case actionTypes.ADD_EXTRA:
      return {
        ...state,
        additionalServices: {
          ...state.additionalServices,
          extras: [...state.additionalServices.extras, {
            id: Date.now(),
            name: '',
            price: 0
          }]
        }
      };

    case actionTypes.UPDATE_EXTRA:
      return {
        ...state,
        additionalServices: {
          ...state.additionalServices,
          extras: state.additionalServices.extras.map(extra =>
            extra.id === action.payload.id
              ? { ...extra, ...action.payload.updates }
              : extra
          )
        }
      };

    case actionTypes.REMOVE_EXTRA:
      return {
        ...state,
        additionalServices: {
          ...state.additionalServices,
          extras: state.additionalServices.extras.filter(e => e.id !== action.payload.id)
        }
      };

    case actionTypes.RESET_QUOTATION:
      return initialState;

    default:
      return state;
  }
}

// Hook personalizado para el cotizador de viajes
export function useTravelQuotation() {
  const [state, dispatch] = useReducer(quotationReducer, initialState);

  // Actions creators
  const actions = {
    setQuotationTitle: (title) => dispatch({ type: actionTypes.SET_QUOTATION_TITLE, payload: title }),
    setClientInfo: (info) => dispatch({ type: actionTypes.SET_CLIENT_INFO, payload: info }),
    setCommissionRate: (rate) => dispatch({ type: actionTypes.SET_COMMISSION_RATE, payload: rate }),
    
    addPassenger: () => dispatch({ type: actionTypes.ADD_PASSENGER }),
    updatePassenger: (id, updates) => dispatch({ type: actionTypes.UPDATE_PASSENGER, payload: { id, updates } }),
    removePassenger: (id) => dispatch({ type: actionTypes.REMOVE_PASSENGER, payload: { id } }),
    
    updateFlight: (id, updates) => dispatch({ type: actionTypes.UPDATE_FLIGHT, payload: { id, updates } }),
    selectFlight: (id) => dispatch({ type: actionTypes.SELECT_FLIGHT, payload: { id } }),
    
    updateAccommodation: (id, updates) => dispatch({ type: actionTypes.UPDATE_ACCOMMODATION, payload: { id, updates } }),
    selectAccommodation: (id) => dispatch({ type: actionTypes.SELECT_ACCOMMODATION, payload: { id } }),
    
    updateTransfers: (transfers) => dispatch({ type: actionTypes.UPDATE_TRANSFERS, payload: transfers }),
    
    addExtra: () => dispatch({ type: actionTypes.ADD_EXTRA }),
    updateExtra: (id, updates) => dispatch({ type: actionTypes.UPDATE_EXTRA, payload: { id, updates } }),
    removeExtra: (id) => dispatch({ type: actionTypes.REMOVE_EXTRA, payload: { id } }),
    
    resetQuotation: () => dispatch({ type: actionTypes.RESET_QUOTATION })
  };

  // Cálculos derivados
  const calculations = {
    selectedFlight: state.flights.find(flight => flight.selected),
    selectedAccommodation: state.accommodations.find(accommodation => accommodation.selected),
    
    // Costos netos (sin comisión)
    netFlightTotal: () => {
      const selectedFlight = state.flights.find(flight => flight.selected);
      if (!selectedFlight) return 0;
      const basePrice = selectedFlight.price * state.passengers.length;
      return basePrice;
    },
    
    netAccommodationTotal: () => {
      const selectedAccommodation = state.accommodations.find(accommodation => accommodation.selected);
      return selectedAccommodation ? selectedAccommodation.totalPrice : 0;
    },
    
    netTransfersTotal: () => {
      const { transfers } = state.additionalServices;
      let total = 0;
      if (transfers.standard) total += transfers.standardPrice;
      total += transfers.extraPrice;
      return total;
    },
    
    netExtrasTotal: () => {
      return state.additionalServices.extras.reduce((total, extra) => total + extra.price, 0);
    },
    
    netGrandTotal: () => {
      return calculations.netFlightTotal() + 
             calculations.netAccommodationTotal() + 
             calculations.netTransfersTotal() + 
             calculations.netExtrasTotal();
    },
    
    // Precios con comisión (para el cliente)
    commissionAmount: () => {
      return calculations.netGrandTotal() * (state.commissionRate / 100);
    },
    
    flightTotal: () => {
      return calculations.netFlightTotal() * (1 + state.commissionRate / 100);
    },
    
    accommodationTotal: () => {
      return calculations.netAccommodationTotal() * (1 + state.commissionRate / 100);
    },
    
    transfersTotal: () => {
      return calculations.netTransfersTotal() * (1 + state.commissionRate / 100);
    },
    
    extrasTotal: () => {
      return calculations.netExtrasTotal() * (1 + state.commissionRate / 100);
    },
    
    grandTotal: () => {
      return calculations.netGrandTotal() * (1 + state.commissionRate / 100);
    }
  };

  return {
    state,
    actions,
    calculations
  };
}
