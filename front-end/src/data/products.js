import watch1 from "../assets/images/watch1.png";
import watch2 from "../assets/images/watch2.png";
import watch3 from "../assets/images/watch3.png";
import watch4 from "../assets/images/watch4.png";
import watch5 from "../assets/images/watch5.png";
import watch6 from "../assets/images/watch6.png";
import watch7 from "../assets/images/watch7.png";
import watch8 from "../assets/images/watch8.png";
import watch9 from "../assets/images/watch9.png";
import shoe from "../assets/images/shoe.svg";
import buds from "../assets/images/Buds.png";
import cap from "../assets/images/cap.png";

const products = [
  // Watches
  {
    id: 1,
    name: "Classic Black Watch",
    category: "watches",
    subcategory: "mens-watches",
    price: 4999,
    oldPrice: 6999,
    discount: 28,
    rating: 4.5,
    reviewCount: 120,
    image: watch1,
    stock: true
  },
  {
    id: 2,
    name: "Premium Silver Watch",
    category: "watches",
    subcategory: "mens-watches",
    price: 5999,
    oldPrice: 8999,
    discount: 33,
    rating: 4.8,
    reviewCount: 85,
    image: watch2,
    stock: true
  },
  {
    id: 3,
    name: "Sport Black Watch",
    category: "watches",
    subcategory: "mens-watches",
    price: 3999,
    oldPrice: 4999,
    discount: 20,
    rating: 4.3,
    reviewCount: 154,
    image: watch3,
    stock: true
  },
  {
    id: 4,
    name: "Smart Watch Pro",
    category: "watches",
    subcategory: "smart-watches",
    price: 6999,
    oldPrice: 9999,
    discount: 30,
    rating: 4.7,
    reviewCount: 210,
    image: watch4,
    stock: true
  },
  {
    id: 5,
    name: "Rose Gold Series",
    category: "watches",
    subcategory: "womens-watches",
    price: 7999,
    oldPrice: 11999,
    discount: 33,
    rating: 4.6,
    reviewCount: 92,
    image: watch5,
    stock: false
  },
  {
    id: 6,
    name: "Active Fit Watch",
    category: "watches",
    subcategory: "smart-watches",
    price: 2999,
    oldPrice: 3999,
    discount: 25,
    rating: 4.2,
    reviewCount: 68,
    image: watch6,
    stock: true
  },
  {
    id: 7,
    name: "Elite Chronograph",
    category: "watches",
    subcategory: "mens-watches",
    price: 8999,
    oldPrice: 12999,
    discount: 30,
    rating: 4.9,
    reviewCount: 45,
    image: watch7,
    stock: true
  },
  {
    id: 8,
    name: "Titanium Sports Watch",
    category: "watches",
    subcategory: "mens-watches",
    price: 11999,
    oldPrice: 15999,
    discount: 25,
    rating: 4.8,
    reviewCount: 76,
    image: watch8,
    stock: true
  },
  {
    id: 9,
    name: "Minimalist Leather Watch",
    category: "watches",
    subcategory: "mens-watches",
    price: 4599,
    oldPrice: 5999,
    discount: 23,
    rating: 4.4,
    reviewCount: 112,
    image: watch9,
    stock: true
  },

  // Shoes (Footwear -> Men's Shoes)
  {
    id: 10,
    name: "Air Comfort Running Shoes",
    category: "footwear",
    subcategory: "mens-shoes",
    price: 3499,
    oldPrice: 4999,
    discount: 30,
    rating: 4.6,
    reviewCount: 142,
    image: shoe,
    stock: true
  },
  {
    id: 11,
    name: "Urban Street Sneakers",
    category: "footwear",
    subcategory: "mens-shoes",
    price: 4299,
    oldPrice: 5999,
    discount: 28,
    rating: 4.7,
    reviewCount: 98,
    image: shoe,
    stock: true
  },
  {
    id: 12,
    name: "FlexiFit Trainer Shoes",
    category: "footwear",
    subcategory: "mens-shoes",
    price: 2799,
    oldPrice: 3499,
    discount: 20,
    rating: 4.3,
    reviewCount: 56,
    image: shoe,
    stock: true
  },
  {
    id: 13,
    name: "Outdoor Hiking Trail Shoes",
    category: "footwear",
    subcategory: "mens-shoes",
    price: 4999,
    oldPrice: 6999,
    discount: 28,
    rating: 4.5,
    reviewCount: 74,
    image: shoe,
    stock: false
  },

  // Air Buds (Gadgets -> AirPods)
  {
    id: 14,
    name: "BassBlast Air Buds Pro",
    category: "gadgets",
    subcategory: "airpods",
    price: 2499,
    oldPrice: 3999,
    discount: 37,
    rating: 4.5,
    reviewCount: 188,
    image: buds,
    stock: true
  },
  {
    id: 15,
    name: "ActiveFit Earbuds Lite",
    category: "gadgets",
    subcategory: "airpods",
    price: 1799,
    oldPrice: 2499,
    discount: 28,
    rating: 4.2,
    reviewCount: 124,
    image: buds,
    stock: true
  },
  {
    id: 16,
    name: "TWS True Wireless Buds",
    category: "gadgets",
    subcategory: "airpods",
    price: 1999,
    oldPrice: 2999,
    discount: 33,
    rating: 4.4,
    reviewCount: 150,
    image: buds,
    stock: true
  },

  // Caps (Fashion & Bags -> Caps for Men)
  {
    id: 17,
    name: "Classic Athletics Cap",
    category: "fashion-bags",
    subcategory: "caps-for-men",
    price: 799,
    oldPrice: 999,
    discount: 20,
    rating: 4.3,
    reviewCount: 42,
    image: cap,
    stock: true
  },
  {
    id: 18,
    name: "Premium Streetwear Cap",
    category: "fashion-bags",
    subcategory: "caps-for-men",
    price: 1199,
    oldPrice: 1499,
    discount: 20,
    rating: 4.6,
    reviewCount: 31,
    image: cap,
    stock: true
  },
  {
    id: 19,
    name: "Minimalist Snapback",
    category: "fashion-bags",
    subcategory: "caps-for-men",
    price: 999,
    oldPrice: 1299,
    discount: 23,
    rating: 4.4,
    reviewCount: 27,
    image: cap,
    stock: true
  },

  // Sliders (Footwear -> Sliders)
  {
    id: 20,
    name: "Comfort Foam Sliders",
    category: "footwear",
    subcategory: "sliders",
    price: 1499,
    oldPrice: 1999,
    discount: 25,
    rating: 4.4,
    reviewCount: 63,
    image: shoe,
    stock: true
  },
  {
    id: 21,
    name: "Streetwear Sport Sliders",
    category: "footwear",
    subcategory: "sliders",
    price: 1799,
    oldPrice: 2499,
    discount: 28,
    rating: 4.5,
    reviewCount: 48,
    image: shoe,
    stock: true
  },

  // Accessories
  {
    id: 22,
    name: "Watch Silicone Strap Duo",
    category: "accessories",
    subcategory: "watch-straps",
    price: 999,
    oldPrice: 1499,
    discount: 33,
    rating: 4.6,
    reviewCount: 77,
    image: watch2,
    stock: true
  },
  {
    id: 23,
    name: "Smart Watch Charging Dock",
    category: "accessories",
    subcategory: "other-accessories",
    price: 1299,
    oldPrice: 1999,
    discount: 35,
    rating: 4.3,
    reviewCount: 39,
    image: watch4,
    stock: true
  },
  {
    id: 24,
    name: "Earbuds Protective Case",
    category: "accessories",
    subcategory: "other-accessories",
    price: 499,
    oldPrice: 799,
    discount: 37,
    rating: 4.5,
    reviewCount: 110,
    image: buds,
    stock: true
  }
];

const enrichedProducts = products.map((product, index) => ({
  ...product,
  keywords: [product.category, product.subcategory, product.name, product.category === "watches" ? "watch wearable timepiece" : "", product.category === "gadgets" ? "earbuds audio wireless tws" : "", product.category === "footwear" ? "footwear comfort" : ""].join(" ").toLowerCase(),
  popularity: product.reviewCount * 3 + Math.round(product.rating * 20),
  isNew: index % 4 === 0 || product.id > 20,
  description: `Built for everyday use, ${product.name} combines dependable comfort, thoughtful details and Moxie's clean, modern style.`,
  specifications: { 
    Brand: "Moxie", 
    Category: product.category === "watches" ? "Watches" : product.category === "footwear" ? "Footwear" : product.category === "gadgets" ? "Gadgets" : product.category === "fashion-bags" ? "Fashion & Bags" : "Accessories", 
    Warranty: "6 months", 
    "Country of origin": "India",
    ...(product.category === "footwear"
      ? { "Sizes": "7, 8, 9, 10, 11, 12" } 
      : {})
  },
}));

export default enrichedProducts;
