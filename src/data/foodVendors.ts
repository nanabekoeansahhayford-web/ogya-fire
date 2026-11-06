import mamaEfuaImg from '../assets/images/food_mama_efua_jollof_1793886043512.jpg';
import accraGrillImg from '../assets/images/food_accra_grill_tilapia_1793886043887.jpg';
import auntieMuniImg from '../assets/images/food_auntie_muni_waakye_1793886045717.jpg';
import pizzaFireImg from '../assets/images/food_pizza_fire_accra_1793886046155.jpg';
import keleweleKingImg from '../assets/images/food_kelewele_adenta_1793886046069.jpg';
import freshJuiceImg from '../assets/images/food_fresh_juice_bar_1793886046929.jpg';

export interface FoodMenuItem {
  id: string;
  name: string;
  price: number; // in GHS
  description: string;
  category: string;
  imageUrl: string;
  isPopular?: boolean;
  spicyLevel?: number; // 0-3
}

export interface FoodVendor {
  id: string;
  name: string;
  neighborhood: string;
  city: string;
  rating: number;
  reviewCount: number;
  deliveryTime: string; // e.g., '25-35 mins'
  deliveryFee: number; // in GHS (e.g., 10 GHS)
  minOrder?: number;
  imageUrl: string;
  tags: string[];
  isOpen: boolean;
  isVerified: boolean;
  menu: FoodMenuItem[];
}

export const FOOD_VENDORS: FoodVendor[] = [
  {
    id: 'vendor-mama-efua',
    name: "Mama Efua's Kitchen",
    neighborhood: 'Osu',
    city: 'Accra',
    rating: 4.9,
    reviewCount: 342,
    deliveryTime: '25-35 mins',
    deliveryFee: 10,
    minOrder: 30,
    imageUrl: mamaEfuaImg,
    tags: ['Authentic Ghanaian', 'Jollof & Waakye', 'Local Dishes'],
    isOpen: true,
    isVerified: true,
    menu: [
      {
        id: 'efua-1',
        name: 'Jollof Rice + Grilled Chicken',
        price: 45,
        description: 'Rich smoky party jollof served with succulent spiced grilled chicken leg, shito, and fresh salad.',
        category: 'Jollof & Rice',
        imageUrl: mamaEfuaImg,
        isPopular: true,
      },
      {
        id: 'efua-2',
        name: 'Waakye + Egg',
        price: 35,
        description: 'Traditional Ghanaian waakye served with boiled egg, spaghetti (talia), gari foto, and dark shito.',
        category: 'Traditional',
        imageUrl: mamaEfuaImg,
        isPopular: true,
      },
      {
        id: 'efua-3',
        name: 'Fried Rice + Chicken',
        price: 40,
        description: 'Flavorful Ghanaian spiced fried rice packed with vegetables, served with golden crispy chicken.',
        category: 'Jollof & Rice',
        imageUrl: mamaEfuaImg,
      },
    ],
  },
  {
    id: 'vendor-accra-grill',
    name: 'Accra Grill House',
    neighborhood: 'East Legon',
    city: 'Accra',
    rating: 4.8,
    reviewCount: 289,
    deliveryTime: '20-30 mins',
    deliveryFee: 10,
    minOrder: 35,
    imageUrl: accraGrillImg,
    tags: ['Charcoal Grill', 'Banku & Tilapia', 'Shawarma'],
    isOpen: true,
    isVerified: true,
    menu: [
      {
        id: 'grill-1',
        name: 'Grilled Tilapia + Banku',
        price: 60,
        description: 'Whole seasoned fresh Volta tilapia grilled over open charcoal, served with 2 hot banku balls and fresh ground pepper.',
        category: 'Grill Specials',
        imageUrl: accraGrillImg,
        isPopular: true,
      },
      {
        id: 'grill-2',
        name: 'Grilled Chicken + Fries',
        price: 55,
        description: 'Flame-grilled quarter chicken with secret herb rub, served with seasoned yam/potato fries and coleslaw.',
        category: 'Grill Specials',
        imageUrl: accraGrillImg,
        isPopular: true,
      },
      {
        id: 'grill-3',
        name: 'Beef Shawarma',
        price: 38,
        description: 'Tender spiced beef strips wrapped in pita with garlic sauce, crunchy vegetables, and mild pepper.',
        category: 'Wraps & Quick Bites',
        imageUrl: accraGrillImg,
      },
    ],
  },
  {
    id: 'vendor-auntie-muni',
    name: 'Auntie Muni Waakye',
    neighborhood: 'Madina',
    city: 'Accra',
    rating: 4.9,
    reviewCount: 512,
    deliveryTime: '15-25 mins',
    deliveryFee: 10,
    minOrder: 15,
    imageUrl: auntieMuniImg,
    tags: ['Legendary Waakye', 'Breakfast & Lunch', 'Accra Favorite'],
    isOpen: true,
    isVerified: true,
    menu: [
      {
        id: 'muni-1',
        name: 'Waakye Special',
        price: 30,
        description: 'The famous Auntie Muni recipe: aromatic waakye with wele, egg, talia, plantain, and signature spicy black shito.',
        category: 'Waakye Combos',
        imageUrl: auntieMuniImg,
        isPopular: true,
      },
      {
        id: 'muni-2',
        name: 'Waakye + Chicken',
        price: 40,
        description: 'Full waakye plate paired with tender seasoned stewed chicken and rich tomato stew sauce.',
        category: 'Waakye Combos',
        imageUrl: auntieMuniImg,
        isPopular: true,
      },
      {
        id: 'muni-3',
        name: 'Hausa Koko + Koose',
        price: 15,
        description: 'Warm spicy Hausa koko millet porridge served with 4 crispy, fluffy deep-fried bean koose cakes.',
        category: 'Morning Specials',
        imageUrl: auntieMuniImg,
      },
    ],
  },
  {
    id: 'vendor-pizza-fire',
    name: 'Pizza Fire Accra',
    neighborhood: 'Spintex',
    city: 'Accra',
    rating: 4.7,
    reviewCount: 198,
    deliveryTime: '30-40 mins',
    deliveryFee: 10,
    minOrder: 50,
    imageUrl: pizzaFireImg,
    tags: ['Wood-Fired Pizza', 'Italian & Local Twist', 'Late Night'],
    isOpen: true,
    isVerified: true,
    menu: [
      {
        id: 'pizza-1',
        name: 'Pepperoni Pizza Large',
        price: 120,
        description: '14-inch wood-fired crust loaded with premium beef pepperoni, melted mozzarella, and oregano tomato sauce.',
        category: 'Pizzas',
        imageUrl: pizzaFireImg,
        isPopular: true,
      },
      {
        id: 'pizza-2',
        name: 'Chicken BBQ Pizza Medium',
        price: 95,
        description: '12-inch pizza topped with tender BBQ chicken bites, red onions, bell peppers, and smoky barbecue swirl.',
        category: 'Pizzas',
        imageUrl: pizzaFireImg,
        isPopular: true,
      },
      {
        id: 'pizza-3',
        name: 'Meat Lovers Pizza',
        price: 130,
        description: 'Signature pizza loaded with beef pepperoni, sausage crumbles, spicy minced beef, and double cheese.',
        category: 'Pizzas',
        imageUrl: pizzaFireImg,
      },
    ],
  },
  {
    id: 'vendor-kelewele-king',
    name: 'Kelewele King',
    neighborhood: 'Adenta',
    city: 'Accra',
    rating: 4.8,
    reviewCount: 220,
    deliveryTime: '15-20 mins',
    deliveryFee: 10,
    minOrder: 20,
    imageUrl: keleweleKingImg,
    tags: ['Ghanaian Street Food', 'Hot & Spicy', 'Snacks & Grills'],
    isOpen: true,
    isVerified: true,
    menu: [
      {
        id: 'kelewele-1',
        name: 'Kelewele + Groundnut',
        price: 20,
        description: 'Ripe plantains spiced with ginger, chili, and cloves fried to caramelized perfection, served with roasted peanuts.',
        category: 'Street Favorites',
        imageUrl: keleweleKingImg,
        isPopular: true,
      },
      {
        id: 'kelewele-2',
        name: 'Fried Yam + Chicken',
        price: 45,
        description: 'Crispy fried Pona yam chips paired with seasoned fried chicken, hot green pepper dip, and shito.',
        category: 'Yam & Platters',
        imageUrl: keleweleKingImg,
        isPopular: true,
      },
      {
        id: 'kelewele-3',
        name: 'Chichinga Skewers',
        price: 25,
        description: '3 skewers of succulent Ghanaian suya beef kebabs coated in roasted peanut spice (tankora).',
        category: 'Street Favorites',
        imageUrl: keleweleKingImg,
      },
    ],
  },
  {
    id: 'vendor-fresh-juice',
    name: 'Fresh Juice & Smoothie Bar',
    neighborhood: 'Cantonments',
    city: 'Accra',
    rating: 4.9,
    reviewCount: 165,
    deliveryTime: '10-15 mins',
    deliveryFee: 10,
    minOrder: 18,
    imageUrl: freshJuiceImg,
    tags: ['100% Natural', 'Cold-Pressed', 'Healthy Smoothies'],
    isOpen: true,
    isVerified: true,
    menu: [
      {
        id: 'juice-1',
        name: 'Mango Smoothie',
        price: 25,
        description: 'Creamy blend of ripe sweet Ghanaian mangoes, Greek yogurt, and pure blossom honey.',
        category: 'Smoothies',
        imageUrl: freshJuiceImg,
        isPopular: true,
      },
      {
        id: 'juice-2',
        name: 'Pineapple Ginger Juice',
        price: 18,
        description: 'Cold-pressed sweet Sugar Loaf pineapple with fiery fresh ginger punch, no added sugar.',
        category: 'Fresh Juices',
        imageUrl: freshJuiceImg,
        isPopular: true,
      },
      {
        id: 'juice-3',
        name: 'Avocado Smoothie',
        price: 30,
        description: 'Rich velvety green blend of fresh butter avocado, condensed milk splash, and crushed ice.',
        category: 'Smoothies',
        imageUrl: freshJuiceImg,
      },
    ],
  },
];
