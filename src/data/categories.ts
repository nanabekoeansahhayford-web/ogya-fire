import { CategoryInfo } from '../types/marketplace';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'vehicles',
    name: 'Vehicles',
    iconName: 'Car',
    shortDesc: 'Cars, Motorbikes, Trotro, SUVs & Trucks in Ghana',
    subcategories: ['Cars', 'Motorbikes & Scooters', 'Trotro & Buses', 'SUVs & 4x4s', 'Auto Parts & Tires', 'Trucks & Trailers']
  },
  {
    id: 'phones-tablets',
    name: 'Phones & Tablets',
    iconName: 'Smartphone',
    shortDesc: 'iPhone, Samsung, Tecno, Infinix & Tablets',
    subcategories: ['iPhone', 'Samsung Galaxy', 'Tecno', 'Infinix', 'Tablets & iPads', 'Smart Watches', 'Accessories']
  },
  {
    id: 'electronics',
    name: 'Electronics',
    iconName: 'Laptop',
    shortDesc: 'Laptops, TVs, Fridges, Fans & Audio Systems',
    subcategories: ['Laptops & Computers', 'TVs & Home Audio', 'Fridges & Freezers', 'Fans & Air Conditioners', 'Gaming & Consoles']
  },
  {
    id: 'property',
    name: 'Property',
    iconName: 'Building2',
    shortDesc: 'Rooms, Apartments, Houses for rent in Accra, Kumasi, Tema',
    subcategories: ['Rooms for Rent', 'Apartments for Rent', 'Houses for Rent', 'Houses for Sale', 'Plots & Land', 'Commercial Property']
  },
  {
    id: 'fashion',
    name: 'Fashion',
    iconName: 'Shirt',
    shortDesc: 'Clothes, Shoes, Wigs, Bags, Watches & Kente',
    subcategories: ['Wigs & Hair', 'Shoes & Sneakers', 'Men\'s Clothing', 'Women\'s Clothing', 'Bags & Purses', 'Watches & Jewelry', 'African Wear & Kente']
  },
  {
    id: 'home-furniture',
    name: 'Home & Furniture',
    iconName: 'Armchair',
    shortDesc: 'Beds, Sofas, Tables, Kitchen & Living Room Decor',
    subcategories: ['Beds & Mattresses', 'Sofas & Couches', 'Dining Tables & Chairs', 'Wardrobes & Cabinets', 'Kitchen Appliances', 'Home Decor']
  },
  {
    id: 'beauty-care',
    name: 'Beauty & Health',
    iconName: 'Sparkles',
    shortDesc: 'Skincare, Hair Products, Shea Butter & Fragrances',
    subcategories: ['Skincare & Glow', 'Hair Care & Oils', 'Fragrances & Perfumes', 'Makeup & Cosmetics', 'Natural Shea & Cocoa Butter']
  },
  {
    id: 'food',
    name: 'Food',
    iconName: 'Utensils',
    shortDesc: 'Jollof, Waakye, Pizza, Tilapia, Kelewele, Juice & Grills',
    subcategories: ['Jollof & Fried Rice', 'Waakye Specials', 'Grilled Tilapia & Banku', 'Pizza & Fast Food', 'Kelewele & Street Food', 'Fresh Juices & Smoothies']
  },
  {
    id: 'jobs-services',
    name: 'Jobs & Services',
    iconName: 'Briefcase',
    shortDesc: 'Plumber, Electrician, Driver, Cleaning & Professional Services',
    subcategories: ['Plumber & Pipe Fitting', 'Electrician & Wiring', 'Driver & Chauffeur', 'Deep Cleaning & Fumigation', 'Carpentry & Masonry', 'IT & Graphic Design']
  },
  // Legacy category IDs preserved for full system backwards compatibility
  {
    id: 'services',
    name: 'Other Services',
    iconName: 'Briefcase',
    shortDesc: 'Logistics, Tuition, Event Planning',
    subcategories: ['Logistics & Moving', 'Tuition & Lessons', 'Events & Catering']
  },
  {
    id: 'food-agriculture',
    name: 'Agriculture & Farm Produce',
    iconName: 'Wheat',
    shortDesc: 'Farm Crops, Livestock, Poultry & Feeds',
    subcategories: ['Farm Crops & Fresh Produce', 'Poultry & Birds', 'Livestock & Cattle']
  },
  {
    id: 'animals-pets',
    name: 'Animals & Pets',
    iconName: 'Dog',
    shortDesc: 'Dogs, Puppies, Cats & Pet Accessories',
    subcategories: ['Dogs & Puppies', 'Cats & Kittens', 'Pet Accessories']
  },
  {
    id: 'babies-kids',
    name: 'Babies & Kids',
    iconName: 'Baby',
    shortDesc: 'Children Clothes, Toys & Baby Gear',
    subcategories: ['Baby Clothes', 'Toys & Games', 'Strollers & Car Seats']
  },
  {
    id: 'jobs',
    name: 'Corporate Jobs',
    iconName: 'BriefcaseBusiness',
    shortDesc: 'Full-time, Part-time & Remote Tech Jobs',
    subcategories: ['Software & IT Jobs', 'Sales & Marketing', 'Accounting & Finance']
  },
  {
    id: 'seeking-work-cvs',
    name: 'Seeking Work - CVs',
    iconName: 'FileText',
    shortDesc: 'Verified Candidate Profiles & CV Summaries',
    subcategories: ['Software Engineers', 'Accountants', 'Experienced Drivers']
  },
  {
    id: 'repair-construction',
    name: 'Repair & Construction',
    iconName: 'Hammer',
    shortDesc: 'Building Materials, Cement, Roofing & Tiles',
    subcategories: ['Building Materials', 'Cement & Steel', 'Roofing & Tiles']
  },
  {
    id: 'commercial-equipment',
    name: 'Commercial Equipment',
    iconName: 'Wrench',
    shortDesc: 'Industrial Machinery & Store Fixtures',
    subcategories: ['Store Fixtures', 'Manufacturing Equipment']
  },
  {
    id: 'leisure-activities',
    name: 'Leisure & Activities',
    iconName: 'Compass',
    shortDesc: 'Sports Gear, Musical Instruments & Books',
    subcategories: ['Gym & Fitness', 'Musical Instruments', 'Books']
  },
  {
    id: 'business-industry',
    name: 'Business & Wholesale',
    iconName: 'Factory',
    shortDesc: 'Wholesale Lots & Businesses For Sale',
    subcategories: ['Wholesale & Bulk Lots', 'Businesses For Sale']
  }
];

export const GHANA_CITIES = [
  'All Ghana',
  'Accra',
  'Kumasi',
  'Tema',
  'Takoradi',
  'Tamale',
  'Cape Coast'
] as const;

export type GhanaCity = typeof GHANA_CITIES[number];

export const REGIONS = [
  'Greater Accra (Accra, Tema, Madina, Legon)',
  'Ashanti (Kumasi, Obuasi, Ejisu)',
  'Western (Takoradi, Sekondi, Tarkwa)',
  'Central (Cape Coast, Kasoa, Winneba, Mankessim)',
  'Eastern (Koforidua, Akuapem, Nkawkaw)',
  'Northern (Tamale, Yendi, Savelugu)',
  'Volta (Ho, Keta, Hohoe)',
  'Bono (Sunyani, Berekum)',
  'Bono East (Techiman, Kintampo)',
  'Western North (Sefwi Wiawso, Bibiani)',
  'Upper East (Bolgatanga, Bawku, Navrongo)',
  'Upper West (Wa, Lawra, Tumu)',
  'Oti (Dambai, Nkwanta, Jasikan)',
  'Savannah (Damongo, Salaga, Bole)',
  'North East (Nalerigu, Walewale)',
  'Ahafo (Goaso, Mim, Kenyasi)'
];
