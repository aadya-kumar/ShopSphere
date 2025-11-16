// backend/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./src/models/Product');
const Offer = require('./src/models/Offer'); // create Offer model file if not present

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ecomm-db';

const products = [
  // Clothing
  { 
    name: 'Classic Cotton T-Shirt', 
    description: 'Premium soft cotton tee - comfortable and breathable, perfect for everyday wear. Available in multiple colors.', 
    price: 399, 
    countInStock: 50,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500&h=500&fit=crop',
    category: 'Clothing'
  },
  { 
    name: 'Slim Fit Jeans', 
    description: 'Comfort stretch denim with modern fit. Perfect combination of style and comfort for casual occasions.', 
    price: 1199, 
    countInStock: 30,
    image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop',
    category: 'Clothing'
  },
  { 
    name: 'Hooded Sweatshirt', 
    description: 'Cozy fleece hoodie with front pocket. Perfect for casual wear and outdoor activities. Available in multiple sizes.', 
    price: 1499, 
    countInStock: 40,
    image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop',
    category: 'Clothing'
  },
  { 
    name: 'Formal Dress Shirt', 
    description: 'Crisp cotton dress shirt perfect for office and formal occasions. Wrinkle-resistant fabric.', 
    price: 1299, 
    countInStock: 35,
    image: 'https://assets.myntassets.com/w_412,q_30,dpr_3,fl_progressive,f_webp/assets/images/2024/OCTOBER/17/istWZkll_1c48000f81b047cdbeab827dea577885.jpg',
    category: 'Clothing'
  },
  { 
    name: 'Casual Shorts', 
    description: 'Comfortable cotton shorts with elastic waistband. Perfect for summer and casual outings.', 
    price: 699, 
    countInStock: 45,
    image: 'https://assets.myntassets.com/dpr_1.5,q_30,w_400,c_limit,fl_progressive/assets/images/22515690/2023/3/25/dd1c3f52-c82a-4f3f-b1bf-fefe46ab991d1679743255035SPORTOMenOliveGreenOutdoorShorts1.jpg',
    category: 'Clothing'
  },
  
  // Footwear
  { 
    name: 'Running Sneakers', 
    description: 'Lightweight sports shoes with superior cushioning. Ideal for running, jogging, and daily workouts.', 
    price: 2499, 
    countInStock: 20,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&h=500&fit=crop',
    category: 'Footwear'
  },
  { 
    name: 'Leather Dress Shoes', 
    description: 'Classic leather dress shoes with polished finish. Perfect for formal occasions and business meetings.', 
    price: 3499, 
    countInStock: 25,
    image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=500&h=500&fit=crop',
    category: 'Footwear'
  },
  { 
    name: 'Casual Canvas Shoes', 
    description: 'Lightweight canvas sneakers with rubber sole. Comfortable and stylish for everyday wear.', 
    price: 1299, 
    countInStock: 30,
    image: 'https://images.unsplash.com/photo-1460353581641-37baddab0fa2?w=500&h=500&fit=crop',
    category: 'Footwear'
  },
  
  // Electronics
  { 
    name: 'Wireless Bluetooth Headphones', 
    description: 'Premium over-ear noise isolating headphones with 30-hour battery life. Crystal clear sound quality.', 
    price: 3299, 
    countInStock: 15,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&h=500&fit=crop',
    category: 'Electronics'
  },
  { 
    name: 'Smart Watch', 
    description: 'Fitness tracker with heart rate monitor, sleep tracking, and 50+ sports modes. 7-day battery life.', 
    price: 4999, 
    countInStock: 25,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&h=500&fit=crop',
    category: 'Electronics'
  },
  { 
    name: 'Wireless Mouse', 
    description: 'Ergonomic wireless mouse with 2.4GHz connection. Long battery life and precise tracking.', 
    price: 799, 
    countInStock: 55,
    image: 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=500&h=500&fit=crop',
    category: 'Electronics'
  },
  { 
    name: 'USB-C Hub', 
    description: 'Multi-port USB-C hub with HDMI, USB 3.0, and SD card reader. Perfect for laptops and tablets.', 
    price: 1999, 
    countInStock: 20,
    image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=500&h=500&fit=crop',
    category: 'Electronics'
  },
  { 
    name: 'Portable Power Bank', 
    description: '20000mAh high-capacity power bank with fast charging. Compatible with all smartphones and tablets.', 
    price: 1499, 
    countInStock: 40,
    image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSXTDCZSwSo_BX_A8ryZwlHGA8CWVI0zVK5pg&s',
    category: 'Electronics'
  },
  { 
    name: 'Wireless Earbuds', 
    description: 'True wireless earbuds with noise cancellation. 8-hour battery life with charging case.', 
    price: 2499, 
    countInStock: 30,
    image: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=500&h=500&fit=crop',
    category: 'Electronics'
  },
  
  // Accessories
  { 
    name: 'Stainless Steel Water Bottle', 
    description: '1L insulated bottle keeps drinks cold for 24 hours or hot for 12 hours. BPA-free and eco-friendly.', 
    price: 699, 
    countInStock: 100,
    image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500&h=500&fit=crop',
    category: 'Accessories'
  },
  { 
    name: 'Laptop Backpack', 
    description: '15" laptop compartment with water resistant material. Multiple pockets for organization. Ergonomic design.', 
    price: 1599, 
    countInStock: 40,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&h=500&fit=crop',
    category: 'Accessories'
  },
  { 
    name: 'Leather Wallet', 
    description: 'Genuine leather wallet with RFID blocking technology. Multiple card slots and cash compartments.', 
    price: 899, 
    countInStock: 60,
    image: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=500&h=500&fit=crop',
    category: 'Accessories'
  },
  { 
    name: 'Sunglasses', 
    description: 'UV400 protection sunglasses with polarized lenses. Stylish design suitable for all face shapes.', 
    price: 1299, 
    countInStock: 35,
    image: 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=500&h=500&fit=crop',
    category: 'Accessories'
  },
  { 
    name: 'Leather Belt', 
    description: 'Genuine leather belt with classic buckle. Adjustable sizing, perfect for formal and casual wear.', 
    price: 799, 
    countInStock: 50,
    image: 'https://media.centrepointstores.com/i/centrepoint/4826462-MENB06-SPWIN20300920_02-2100.jpg?fmt=auto&$quality-standard$&sm=c&$prodimg-m-prt-pdp-2x$',
    category: 'Accessories'
  },
  { 
    name: 'Phone Case', 
    description: 'Protective phone case with shock absorption. Clear design shows your phone\'s original color.', 
    price: 499, 
    countInStock: 80,
    image: 'https://brownliving.in/cdn/shop/products/sunflowers-biodegradable-eco-friendly-phone-case-mobile-cover-snflwr-13-001-tech-accessories-brown-living-980329.jpg?v=1682968047',
    category: 'Accessories'
  },
  
  // Sports & Fitness
  { 
    name: 'Yoga Mat', 
    description: 'Non-slip premium yoga mat with extra cushioning. Eco-friendly material, easy to clean and carry.', 
    price: 1499, 
    countInStock: 45,
    image: 'https://sppartos.com/cdn/shop/files/31VX-aIlgWL_580x.jpg?v=1702469142',
    category: 'Sports'
  },
  { 
    name: 'Dumbbell Set', 
    description: 'Adjustable dumbbell set with weights from 5kg to 20kg. Perfect for home workouts and strength training.', 
    price: 3999, 
    countInStock: 15,
    image: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=500&h=500&fit=crop',
    category: 'Sports'
  },
  { 
    name: 'Resistance Bands', 
    description: 'Set of 5 resistance bands with different resistance levels. Includes door anchor and workout guide.', 
    price: 899, 
    countInStock: 35,
    image: 'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=500&h=500&fit=crop',
    category: 'Sports'
  },
  
  // Home & Kitchen
  { 
    name: 'Coffee Maker', 
    description: 'Programmable coffee maker with thermal carafe. Makes up to 12 cups. Auto shut-off feature.', 
    price: 3499, 
    countInStock: 18,
    image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=500&h=500&fit=crop',
    category: 'Home & Kitchen'
  },
  { 
    name: 'Stainless Steel Cookware Set', 
    description: '10-piece cookware set with non-stick coating. Includes pots, pans, and lids. Dishwasher safe.', 
    price: 4999, 
    countInStock: 12,
    image: 'https://images.unsplash.com/photo-1556911220-bff31c812dba?w=500&h=500&fit=crop',
    category: 'Home & Kitchen'
  },
  { 
    name: 'Air Fryer', 
    description: '5.5L capacity air fryer with digital display. Healthier cooking with 85% less oil. Multiple presets.', 
    price: 4499, 
    countInStock: 20,
    image: 'https://images.unsplash.com/photo-1615873968403-89e068629265?w=500&h=500&fit=crop',
    category: 'Home & Kitchen'
  },
  { 
    name: 'Bedding Set', 
    description: 'Premium cotton bedding set with pillowcases and duvet cover. Soft, breathable, and machine washable.', 
    price: 2499, 
    countInStock: 25,
    image: 'https://images.unsplash.com/photo-1586105251261-72a756497a11?w=500&h=500&fit=crop',
    category: 'Home & Kitchen'
  },
  { 
    name: 'Desk Lamp', 
    description: 'LED desk lamp with adjustable brightness and color temperature. USB charging port included.', 
    price: 1299, 
    countInStock: 30,
    image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop',
    category: 'Home & Kitchen'
  },
  
  // Books & Stationery
  { 
    name: 'Leather Journal', 
    description: 'Handcrafted leather-bound journal with lined pages. Perfect for writing, sketching, and note-taking.', 
    price: 899, 
    countInStock: 40,
    image: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&h=500&fit=crop',
    category: 'Books & Stationery'
  },
  { 
    name: 'Pen Set', 
    description: 'Premium fountain pen set with ink refills. Elegant design perfect for writing and gifting.', 
    price: 1499, 
    countInStock: 28,
    image: 'https://scooboo.in/cdn/shop/files/Kaco_Pure_Assorted_Colour_Gel_Pens-6.png?v=1758169262',
    category: 'Books & Stationery'
  }
];

const offers = [
  { title: 'WELCOME10', code: 'WELCOME10', discountPercent: 10, active: true },
  { title: 'FESTIVE20', code: 'FESTIVE20', discountPercent: 20, active: true }
];

async function seed() {
  await mongoose.connect(MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  console.log('Connected to DB for seeding');

  await Product.deleteMany({});
  await Offer.deleteMany({});

  const created = await Product.insertMany(products);
  console.log(`Inserted ${created.length} products.`);

  const createdOffers = await Offer.insertMany(offers);
  console.log(`Inserted ${createdOffers.length} offers.`);

  await mongoose.disconnect();
  console.log('Seeding completed and disconnected.');
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
