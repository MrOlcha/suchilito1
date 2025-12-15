export interface MenuItem {
  id: number
  name: string
  description: string
  price: string
  image?: string
  emoji: string
  isVegetarian?: boolean
  isSpicy?: boolean
  isNew?: boolean
  ingredients?: string[]
}

export interface MenuCategory {
  id: string
  name: string
  description: string
  emoji: string
  items: MenuItem[]
}

export const menuData: MenuCategory[] = [
  {
    id: 'entradas',
    name: 'Entradas',
    description: 'Deliciosos aperitivos para comenzar tu experiencia culinaria',
    emoji: '🥢',
    items: [
      {
        id: 1,
        name: 'Edamame',
        description: 'Vainas de soja cocidas al vapor con sal marina',
        price: '$8.00',
        emoji: '🫘',
        isVegetarian: true,
        ingredients: ['Edamame', 'Sal marina', 'Aceite de sésamo']
      },
      {
        id: 2,
        name: 'Gyoza de Pollo',
        description: 'Dumplings japoneses rellenos de pollo y vegetales',
        price: '$12.00',
        emoji: '🥟',
        ingredients: ['Pollo molido', 'Repollo', 'Cebolla verde', 'Jengibre']
      },
      {
        id: 3,
        name: 'Agedashi Tofu',
        description: 'Tofu frito en caldo dashi con rábano rallado',
        price: '$10.00',
        emoji: '🧊',
        isVegetarian: true,
        ingredients: ['Tofu suave', 'Caldo dashi', 'Rábano daikon', 'Cebolla verde']
      },
      {
        id: 4,
        name: 'Tempura de Vegetales',
        description: 'Vegetales frescos en tempura crujiente',
        price: '$14.00',
        emoji: '🥕',
        isVegetarian: true,
        ingredients: ['Calabacín', 'Berenjena', 'Camote', 'Pimiento', 'Harina tempura']
      }
    ]
  },
  {
    id: 'arroces',
    name: 'Arroces',
    description: 'Bowls de arroz con ingredientes frescos y sabrosos',
    emoji: '🍚',
    items: [
      {
        id: 5,
        name: 'Chirashi Bowl',
        description: 'Arroz sushi con sashimi mixto y vegetales',
        price: '$24.00',
        emoji: '🍣',
        ingredients: ['Arroz sushi', 'Salmón', 'Atún', 'Hamachi', 'Aguacate', 'Pepino']
      },
      {
        id: 6,
        name: 'Unagi Don',
        description: 'Arroz con anguila glaseada y salsa teriyaki',
        price: '$22.00',
        emoji: '🍱',
        ingredients: ['Arroz japonés', 'Anguila', 'Salsa teriyaki', 'Semillas de sésamo']
      },
      {
        id: 7,
        name: 'Salmon Poke Bowl',
        description: 'Bowl hawaiano con salmón marinado y vegetables',
        price: '$20.00',
        emoji: '🥗',
        ingredients: ['Arroz', 'Salmón marinado', 'Edamame', 'Wakame', 'Aguacate']
      }
    ]
  },
  {
    id: 'rollos-naturales',
    name: 'Rollos Naturales',
    description: 'Rollos tradicionales con ingredientes frescos',
    emoji: '🍣',
    items: [
      {
        id: 8,
        name: 'California Roll',
        description: 'Cangrejo, aguacate y pepino',
        price: '$12.00',
        emoji: '🦀',
        ingredients: ['Cangrejo', 'Aguacate', 'Pepino', 'Mayonesa', 'Sésamo']
      },
      {
        id: 9,
        name: 'Salmon Roll',
        description: 'Salmón fresco con aguacate',
        price: '$14.00',
        emoji: '🐟',
        ingredients: ['Salmón fresco', 'Aguacate', 'Arroz sushi', 'Nori']
      },
      {
        id: 10,
        name: 'Tuna Roll',
        description: 'Atún de calidad sashimi',
        price: '$16.00',
        emoji: '🍤',
        ingredients: ['Atún fresco', 'Arroz sushi', 'Nori']
      },
      {
        id: 11,
        name: 'Veggie Roll',
        description: 'Pepino, aguacate y zanahoria',
        price: '$10.00',
        emoji: '🥒',
        isVegetarian: true,
        ingredients: ['Pepino', 'Aguacate', 'Zanahoria', 'Brotes de alfalfa']
      }
    ]
  },
  {
    id: 'rollos-empanizados',
    name: 'Rollos Empanizados',
    description: 'Rollos crujientes con tempura dorada',
    emoji: '🍤',
    items: [
      {
        id: 12,
        name: 'Ebi Fry Roll',
        description: 'Camarón tempura con aguacate y salsa especial',
        price: '$16.00',
        emoji: '🍤',
        ingredients: ['Camarón tempura', 'Aguacate', 'Pepino', 'Salsa spicy mayo']
      },
      {
        id: 13,
        name: 'Chicken Katsu Roll',
        description: 'Pollo empanizado con vegetales frescos',
        price: '$14.00',
        emoji: '🐔',
        ingredients: ['Pollo katsu', 'Lechuga', 'Tomate', 'Mayonesa japonesa']
      },
      {
        id: 14,
        name: 'Soft Shell Crab Roll',
        description: 'Cangrejo de concha suave tempura',
        price: '$18.00',
        emoji: '🦀',
        ingredients: ['Cangrejo soft shell', 'Aguacate', 'Pepino', 'Masago']
      }
    ]
  },
  {
    id: 'rollos-especiales',
    name: 'Rollos Especiales',
    description: 'Creaciones únicas de la casa',
    emoji: '⭐',
    items: [
      {
        id: 15,
        name: 'Dragon Roll',
        description: 'Anguila y aguacate por fuera, camarón tempura por dentro',
        price: '$22.00',
        emoji: '🐉',
        isNew: true,
        ingredients: ['Anguila', 'Aguacate', 'Camarón tempura', 'Salsa anguila']
      },
      {
        id: 16,
        name: 'Rainbow Roll',
        description: 'California roll cubierto con sashimi mixto',
        price: '$20.00',
        emoji: '🌈',
        ingredients: ['California roll', 'Salmón', 'Atún', 'Aguacate', 'Hamachi']
      },
      {
        id: 17,
        name: 'Spider Roll',
        description: 'Cangrejo soft shell con aguacate y pepino',
        price: '$19.00',
        emoji: '🕷️',
        isSpicy: true,
        ingredients: ['Cangrejo soft shell', 'Aguacate', 'Pepino', 'Salsa spicy']
      },
      {
        id: 18,
        name: 'Volcano Roll',
        description: 'Roll horneado con mariscos mixtos',
        price: '$24.00',
        emoji: '🌋',
        isSpicy: true,
        isNew: true,
        ingredients: ['Camarón', 'Cangrejo', 'Queso crema', 'Salsa spicy mayo']
      }
    ]
  },
  {
    id: 'rollos-horneados',
    name: 'Rollos Horneados',
    description: 'Rollos gratinados con sabores intensos',
    emoji: '🔥',
    items: [
      {
        id: 19,
        name: 'Baked Salmon Roll',
        description: 'Roll horneado con salmón y queso crema',
        price: '$18.00',
        emoji: '🔥',
        ingredients: ['Salmón', 'Queso crema', 'Aguacate', 'Salsa teriyaki']
      },
      {
        id: 20,
        name: 'Dynamite Roll',
        description: 'Camarón y cangrejo horneado con salsa spicy',
        price: '$20.00',
        emoji: '💥',
        isSpicy: true,
        ingredients: ['Camarón', 'Cangrejo', 'Mayonesa spicy', 'Masago']
      },
      {
        id: 21,
        name: 'Lava Roll',
        description: 'Roll horneado con pescado blanco y jalapeños',
        price: '$19.00',
        emoji: '🌶️',
        isSpicy: true,
        ingredients: ['Pescado blanco', 'Jalapeños', 'Queso crema', 'Salsa sriracha']
      }
    ]
  },
  {
    id: 'bebidas',
    name: 'Bebidas',
    description: 'Refrescantes bebidas japonesas y clásicas',
    emoji: '🍵',
    items: [
      {
        id: 22,
        name: 'Té Verde',
        description: 'Auténtico té verde japonés',
        price: '$4.00',
        emoji: '🍵',
        isVegetarian: true
      },
      {
        id: 23,
        name: 'Sake Junmai',
        description: 'Sake premium servido caliente o frío',
        price: '$8.00',
        emoji: '🍶'
      },
      {
        id: 24,
        name: 'Ramune',
        description: 'Soda japonesa con sabores únicos',
        price: '$5.00',
        emoji: '🥤',
        isVegetarian: true
      },
      {
        id: 25,
        name: 'Agua de Coco',
        description: 'Refrescante agua de coco natural',
        price: '$6.00',
        emoji: '🥥',
        isVegetarian: true
      }
    ]
  },
  {
    id: 'postres',
    name: 'Postres',
    description: 'Dulces tradicionales japoneses',
    emoji: '🍡',
    items: [
      {
        id: 26,
        name: 'Mochi de Te Verde',
        description: 'Suave mochi relleno de helado de té verde',
        price: '$7.00',
        emoji: '🍡',
        isVegetarian: true
      },
      {
        id: 27,
        name: 'Dorayaki',
        description: 'Pancakes japoneses rellenos de pasta de frijol dulce',
        price: '$6.00',
        emoji: '🥞',
        isVegetarian: true
      },
      {
        id: 28,
        name: 'Tempura de Helado',
        description: 'Helado de vainilla en tempura caliente',
        price: '$9.00',
        emoji: '🍨',
        isVegetarian: true
      }
    ]
  },
  {
    id: 'extras',
    name: 'Extras',
    description: 'Complementos y salsas adicionales',
    emoji: '🧂',
    items: [
      {
        id: 29,
        name: 'Wasabi Extra',
        description: 'Porción adicional de wasabi fresco',
        price: '$2.00',
        emoji: '🟢',
        isVegetarian: true
      },
      {
        id: 30,
        name: 'Jengibre Encurtido',
        description: 'Jengibre marinado tradicional',
        price: '$2.00',
        emoji: '🫚',
        isVegetarian: true
      },
      {
        id: 31,
        name: 'Salsa Soja Premium',
        description: 'Salsa de soja artesanal japonesa',
        price: '$3.00',
        emoji: '🥢',
        isVegetarian: true
      },
      {
        id: 32,
        name: 'Arroz Extra',
        description: 'Porción adicional de arroz sushi',
        price: '$4.00',
        emoji: '🍚',
        isVegetarian: true
      }
    ]
  }
]