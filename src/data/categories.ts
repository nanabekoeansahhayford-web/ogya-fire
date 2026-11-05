import { CategoryInfo } from '../types/marketplace';

export const CATEGORIES: CategoryInfo[] = [
  {
    id: 'vehicles',
    name: 'Vehicles',
    iconName: 'Car',
    shortDesc: 'Cars, SUVs, Motorcycles, Trucks, Auto Parts & Accessories',
    subcategories: ['Cars', 'SUVs & 4x4s', 'Motorcycles & Scooters', 'Trucks & Trailers', 'Auto Parts & Tires', 'Buses & Vans', 'Watercraft & Boats']
  },
  {
    id: 'property',
    name: 'Property',
    iconName: 'Building2',
    shortDesc: 'Houses, Apartments, Land & Commercial Spaces for Sale/Rent',
    subcategories: ['Houses & Apartments for Rent', 'Houses & Apartments for Sale', 'Land & Plots', 'Commercial Property', 'Short Let & Holiday Rentals']
  },
  {
    id: 'phones-tablets',
    name: 'Phones & Tablets',
    iconName: 'Smartphone',
    shortDesc: 'Smartphones, Tablets, Smartwatches & Accessories',
    subcategories: ['Mobile Phones', 'Tablets', 'Smart Watches & Bands', 'Headphones & Earbuds', 'Phone Accessories & Cases']
  },
  {
    id: 'electronics',
    name: 'Electronics',
    iconName: 'Laptop',
    shortDesc: 'Laptops, TVs, Audio Systems, Cameras & Gaming Consoles',
    subcategories: ['Laptops & Computers', 'TVs & Home Audio', 'Gaming Consoles & Games', 'Cameras & Video Gear', 'Computer Accessories', 'Generators & Inverters']
  },
  {
    id: 'home-furniture',
    name: 'Home, Furniture & Appliances',
    iconName: 'Armchair',
    shortDesc: 'Living Room, Bedroom, Kitchen, Appliances & Interior Decor',
    subcategories: ['Living Room Furniture', 'Kitchen Appliances', 'Bedroom Furniture', 'Refrigerators & Freezers', 'Washing Machines', 'Home Decor & Lighting']
  },
  {
    id: 'fashion',
    name: 'Fashion',
    iconName: 'Shirt',
    shortDesc: 'Clothing, Shoes, African Traditional Wear, Watches & Jewelry',
    subcategories: ['Women\'s Clothing', 'Men\'s Clothing', 'Shoes & Footwear', 'Bags & Luggage', 'Jewelry & Watches', 'Traditional & African Print']
  },
  {
    id: 'beauty-care',
    name: 'Beauty & Personal Care',
    iconName: 'Sparkles',
    shortDesc: 'Skincare, Hair Care, Perfumes, Cosmetics & Wellness',
    subcategories: ['Fragrances & Perfumes', 'Skincare & Organic Creams', 'Hair Care & Extensions', 'Makeup & Cosmetics', 'Oral & Body Care']
  },
  {
    id: 'services',
    name: 'Services',
    iconName: 'Briefcase',
    shortDesc: 'IT, Event Planning, Transport & Logistics, Cleaning & Tuition',
    subcategories: ['IT & Web Development', 'Logistics & Haulage', 'Cleaning & Fumigation', 'Events & Catering', 'Legal & Financial Services', 'Classes & Tutoring']
  },
  {
    id: 'repair-construction',
    name: 'Repair & Construction',
    iconName: 'Hammer',
    shortDesc: 'Building Materials, Plumbing, Electrical, Masonry & Roofing',
    subcategories: ['Building Materials & Cement', 'Electrical Works', 'Plumbing & Drainage', 'Roofing & Steel', 'Carpentry & Joinery', 'Painting & Tiles']
  },
  {
    id: 'commercial-equipment',
    name: 'Commercial Equipment & Tools',
    iconName: 'Wrench',
    shortDesc: 'Industrial Machinery, Medical Equipment, Printing & Store Fixtures',
    subcategories: ['Heavy Machinery & Excavators', 'Manufacturing Equipment', 'Store Fixtures & Shelving', 'Printing & Graphics Equipment', 'Medical & Lab Equipment']
  },
  {
    id: 'leisure-activities',
    name: 'Leisure & Activities',
    iconName: 'Compass',
    shortDesc: 'Sports Gear, Musical Instruments, Hobbies, Travel & Books',
    subcategories: ['Gym & Fitness Gear', 'Musical Instruments', 'Books & Magazines', 'Outdoor & Camping', 'Bicycles & Skate', 'Art & Collectibles']
  },
  {
    id: 'babies-kids',
    name: 'Babies & Kids',
    iconName: 'Baby',
    shortDesc: 'Children\'s Clothes, Strollers, Toys, Nursery & Educational Gear',
    subcategories: ['Baby & Children\'s Clothes', 'Prams, Strollers & Car Seats', 'Toys & Board Games', 'Nursery Furniture', 'Feeding & Baby Essentials']
  },
  {
    id: 'food-agriculture',
    name: 'Food, Agriculture & Farming',
    iconName: 'Wheat',
    shortDesc: 'Farm Produce, Grains, Livestock, Poultry, Farm Machinery & Feed',
    subcategories: ['Farm Crops & Fresh Produce', 'Poultry & Birds', 'Livestock & Cattle', 'Farm Feeds & Supplements', 'Farm Implements & Tractors', 'Seeds & Seedlings']
  },
  {
    id: 'animals-pets',
    name: 'Animals & Pets',
    iconName: 'Dog',
    shortDesc: 'Dogs, Puppies, Cats, Aquariums, Birds & Pet Accessories',
    subcategories: ['Dogs & Puppies', 'Cats & Kittens', 'Pet Accessories & Cages', 'Fish & Aquariums', 'Veterinary & Pet Care']
  },
  {
    id: 'jobs',
    name: 'Jobs',
    iconName: 'BriefcaseBusiness',
    shortDesc: 'Full-time, Part-time, Remote, Tech, Sales, Healthcare & Hospitality',
    subcategories: ['Software & IT Jobs', 'Sales & Marketing', 'Accounting & Finance', 'Hospitality & Restaurants', 'Drivers & Logistics', 'Healthcare & Nursing', 'Customer Support']
  },
  {
    id: 'seeking-work-cvs',
    name: 'Seeking Work - CVs',
    iconName: 'FileText',
    shortDesc: 'Verified Candidate Profiles, CV Summaries, Available Immediately',
    subcategories: ['Software Engineers & Tech', 'Accountants & Auditors', 'Experienced Drivers', 'Executive Assistants & Admin', 'Electricians & Technicians', 'Chefs & Caterers']
  },
  {
    id: 'business-industry',
    name: 'Business & Industry',
    iconName: 'Factory',
    shortDesc: 'Wholesale Lots, Businesses for Sale, Raw Materials & Contracts',
    subcategories: ['Wholesale & Bulk Lots', 'Businesses For Sale', 'Industrial Raw Materials', 'Packaging Materials', 'Office Equipment & Supplies']
  }
];

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
