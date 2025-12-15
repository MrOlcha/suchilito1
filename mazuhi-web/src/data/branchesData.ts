export interface BranchService {
  id: string
  name: string
  icon: string
  available: boolean
  description?: string
}

export interface Branch {
  id: number
  name: string
  city: string
  address: string
  phone: string
  email: string
  hours: {
    weekdays: string
    weekends: string
    holidays?: string
  }
  coordinates: {
    lat: number
    lng: number
  }
  image: string
  features: string[]
  services: BranchService[]
  rating: number
  reviewCount: number
  manager: string
  parkingAvailable: boolean
  accessibility: boolean
  wifi: boolean
}

export interface City {
  id: string
  name: string
  emoji: string
  branches: Branch[]
}

export const branchesData: City[] = [
  {
    id: 'queretaro',
    name: 'Querétaro',
    emoji: '🏛️',
    branches: [
      {
        id: 1,
        name: 'Sushi Centro Histórico',
        city: 'Querétaro',
        address: 'Calle 5 de Mayo #123, Centro Histórico, 76000',
        phone: '+52 442 123 4567',
        email: 'centrohistorico@sushi.com',
        hours: {
          weekdays: 'Lunes a Viernes: 12:00 PM - 10:00 PM',
          weekends: 'Sábados y Domingos: 11:00 AM - 11:00 PM',
          holidays: 'Días festivos: 1:00 PM - 9:00 PM'
        },
        coordinates: { lat: 20.5888, lng: -100.3899 },
        image: '🏛️',
        features: ['Terraza', 'Vista al Centro', 'Ambiente Familiar', 'Estacionamiento'],
        services: [
          { id: 'delivery', name: 'Entrega a Domicilio', icon: '🚚', available: true, description: 'Entrega en 30-45 min' },
          { id: 'pickup', name: 'Recoger en Sucursal', icon: '🥡', available: true, description: 'Listo en 15-20 min' },
          { id: 'dinein', name: 'Comer en el Lugar', icon: '🍽️', available: true, description: 'Reservaciones disponibles' },
          { id: 'catering', name: 'Servicio de Catering', icon: '🎉', available: true, description: 'Para eventos especiales' }
        ],
        rating: 4.8,
        reviewCount: 245,
        manager: 'Chef Miguel Rodríguez',
        parkingAvailable: true,
        accessibility: true,
        wifi: true
      },
      {
        id: 2,
        name: 'Sushi Antea',
        city: 'Querétaro',
        address: 'Blvd. Antea #123, Antea Lifestyle Center, 76230',
        phone: '+52 442 234 5678',
        email: 'antea@sushi.com',
        hours: {
          weekdays: 'Lunes a Viernes: 1:00 PM - 10:00 PM',
          weekends: 'Sábados y Domingos: 12:00 PM - 11:00 PM'
        },
        coordinates: { lat: 20.6197, lng: -100.4656 },
        image: '🏢',
        features: ['Centro Comercial', 'Área de Niños', 'Moderno', 'Food Court'],
        services: [
          { id: 'delivery', name: 'Entrega a Domicilio', icon: '🚚', available: true, description: 'Entrega en 25-40 min' },
          { id: 'pickup', name: 'Recoger en Sucursal', icon: '🥡', available: true, description: 'Listo en 10-15 min' },
          { id: 'dinein', name: 'Comer en el Lugar', icon: '🍽️', available: true, description: 'Sin reservaciones necesarias' },
          { id: 'express', name: 'Express Counter', icon: '⚡', available: true, description: 'Servicio rápido' }
        ],
        rating: 4.6,
        reviewCount: 189,
        manager: 'Chef Andrea López',
        parkingAvailable: true,
        accessibility: true,
        wifi: true
      }
    ]
  },
  {
    id: 'cdmx',
    name: 'Ciudad de México',
    emoji: '🏙️',
    branches: [
      {
        id: 3,
        name: 'Sushi Polanco',
        city: 'CDMX',
        address: 'Av. Presidente Masaryk #456, Polanco, 11560',
        phone: '+52 55 1234 5678',
        email: 'polanco@sushi.com',
        hours: {
          weekdays: 'Lunes a Viernes: 12:00 PM - 11:00 PM',
          weekends: 'Sábados y Domingos: 11:00 AM - 12:00 AM'
        },
        coordinates: { lat: 19.4326, lng: -99.1332 },
        image: '🌆',
        features: ['Zona Exclusiva', 'Bar de Sake', 'Valet Parking', 'Terraza VIP'],
        services: [
          { id: 'delivery', name: 'Entrega a Domicilio', icon: '🚚', available: true, description: 'Entrega en 20-35 min' },
          { id: 'pickup', name: 'Recoger en Sucursal', icon: '🥡', available: true, description: 'Listo en 15-25 min' },
          { id: 'dinein', name: 'Comer en el Lugar', icon: '🍽️', available: true, description: 'Reservaciones recomendadas' },
          { id: 'private', name: 'Eventos Privados', icon: '🥂', available: true, description: 'Salones privados disponibles' },
          { id: 'valet', name: 'Valet Parking', icon: '🚗', available: true, description: 'Servicio gratuito' }
        ],
        rating: 4.9,
        reviewCount: 412,
        manager: 'Chef Hiroshi Tanaka',
        parkingAvailable: true,
        accessibility: true,
        wifi: true
      },
      {
        id: 4,
        name: 'Sushi Roma Norte',
        city: 'CDMX',
        address: 'Calle Orizaba #789, Roma Norte, 06700',
        phone: '+52 55 2345 6789',
        email: 'romanorte@sushi.com',
        hours: {
          weekdays: 'Lunes a Viernes: 1:00 PM - 10:30 PM',
          weekends: 'Sábados y Domingos: 12:00 PM - 11:30 PM'
        },
        coordinates: { lat: 19.4148, lng: -99.1670 },
        image: '🎨',
        features: ['Arte Local', 'Ambiente Bohemio', 'Pet Friendly', 'Música en Vivo'],
        services: [
          { id: 'delivery', name: 'Entrega a Domicilio', icon: '🚚', available: true, description: 'Entrega en 25-40 min' },
          { id: 'pickup', name: 'Recoger en Sucursal', icon: '🥡', available: true, description: 'Listo en 15-20 min' },
          { id: 'dinein', name: 'Comer en el Lugar', icon: '🍽️', available: true, description: 'Ambiente relajado' },
          { id: 'events', name: 'Eventos Culturales', icon: '🎭', available: true, description: 'Noches temáticas' }
        ],
        rating: 4.7,
        reviewCount: 298,
        manager: 'Chef Carmen Velázquez',
        parkingAvailable: false,
        accessibility: true,
        wifi: true
      }
    ]
  },
  {
    id: 'puebla',
    name: 'Puebla',
    emoji: '⛪',
    branches: [
      {
        id: 5,
        name: 'Sushi Angelópolis',
        city: 'Puebla',
        address: 'Blvd. del Niño Poblano #2507, Angelópolis, 72193',
        phone: '+52 222 123 4567',
        email: 'angelopolis@sushi.com',
        hours: {
          weekdays: 'Lunes a Viernes: 1:00 PM - 10:00 PM',
          weekends: 'Sábados y Domingos: 12:00 PM - 10:30 PM'
        },
        coordinates: { lat: 19.0414, lng: -98.2063 },
        image: '🏬',
        features: ['Centro Comercial', 'Área Familiar', 'Vista Panorámica', 'Zona de Juegos'],
        services: [
          { id: 'delivery', name: 'Entrega a Domicilio', icon: '🚚', available: true, description: 'Entrega en 30-45 min' },
          { id: 'pickup', name: 'Recoger en Sucursal', icon: '🥡', available: true, description: 'Listo en 15-25 min' },
          { id: 'dinein', name: 'Comer en el Lugar', icon: '🍽️', available: true, description: 'Perfecto para familias' },
          { id: 'birthday', name: 'Fiestas Infantiles', icon: '🎂', available: true, description: 'Paquetes especiales' }
        ],
        rating: 4.5,
        reviewCount: 156,
        manager: 'Chef Roberto Morales',
        parkingAvailable: true,
        accessibility: true,
        wifi: true
      },
      {
        id: 6,
        name: 'Sushi Centro Puebla',
        city: 'Puebla',
        address: 'Av. 16 de Septiembre #321, Centro Histórico, 72000',
        phone: '+52 222 234 5678',
        email: 'centropuebla@sushi.com',
        hours: {
          weekdays: 'Lunes a Viernes: 12:00 PM - 9:30 PM',
          weekends: 'Sábados y Domingos: 11:00 AM - 10:00 PM'
        },
        coordinates: { lat: 19.0421, lng: -98.2008 },
        image: '⛪',
        features: ['Patrimonio UNESCO', 'Arquitectura Colonial', 'Ubicación Central', 'Tradición'],
        services: [
          { id: 'delivery', name: 'Entrega a Domicilio', icon: '🚚', available: true, description: 'Entrega en 35-50 min' },
          { id: 'pickup', name: 'Recoger en Sucursal', icon: '🥡', available: true, description: 'Listo en 20-25 min' },
          { id: 'dinein', name: 'Comer en el Lugar', icon: '🍽️', available: true, description: 'Ambiente histórico único' },
          { id: 'tourist', name: 'Tours Gastronómicos', icon: '📸', available: true, description: 'Para turistas' }
        ],
        rating: 4.4,
        reviewCount: 127,
        manager: 'Chef Elena Ramírez',
        parkingAvailable: false,
        accessibility: false,
        wifi: true
      }
    ]
  }
]