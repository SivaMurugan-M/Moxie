import watch from "../assets/images/watch.svg";
import shoe from "../assets/images/shoe.svg";
import buds from "../assets/images/Buds.png";
import cap from "../assets/images/cap.png";

const categories = [
  {
    name: "Watches",
    slug: "watches",
    image: watch,
    subcategories: [
      { name: "Smart Watches", slug: "smart-watches" },
      { name: "Men's Watches", slug: "mens-watches" },
      { name: "Women's Watches", slug: "womens-watches" },
      { name: "Kids Watches", slug: "kids-watches" }
    ]
  },
  {
    name: "Accessories",
    slug: "accessories",
    image: watch,
    subcategories: [
      { name: "Headphones", slug: "headphones" },
      { name: "Bluetooth Speakers", slug: "bluetooth-speakers" },
      { name: "Neckbands", slug: "neckbands" },
      { name: "Pendrives", slug: "pendrives" },
      { name: "Memory Cards", slug: "memory-cards" },
      { name: "Card Readers", slug: "card-readers" },
      { name: "iPhone Charger Covers", slug: "iphone-charger-covers" },
      { name: "Watch Straps", slug: "watch-straps" },
      { name: "Other Accessories", slug: "other-accessories" }
    ]
  },
  {
    name: "Gadgets",
    slug: "gadgets",
    image: buds,
    subcategories: [
      { name: "AirPods", slug: "airpods" },
      { name: "Boom Headphones", slug: "boom-headphones" },
      { name: "Chargers", slug: "chargers" },
      { name: "Other Gadgets", slug: "other-gadgets" }
    ]
  },
  {
    name: "Fashion & Bags",
    slug: "fashion-bags",
    image: cap,
    subcategories: [
      { name: "Handbags", slug: "handbags" },
      { name: "Wallets", slug: "wallets" },
      { name: "Men's Belts", slug: "mens-belts" },
      { name: "Kids Belts", slug: "kids-belts" },
      { name: "Caps for Men", slug: "caps-for-men" },
      { name: "Caps for Kids", slug: "caps-for-kids" }
    ]
  },
  {
    name: "Die-Cast Cars",
    slug: "die-cast-cars",
    image: shoe,
    subcategories: [
      { name: "Die-Cast Cars", slug: "die-cast-cars" }
    ]
  },
  {
    name: "Footwear",
    slug: "footwear",
    image: shoe,
    subcategories: [
      { name: "Men's Shoes", slug: "mens-shoes" },
      { name: "Women's Shoes", slug: "womens-shoes" },
      { name: "Men's Slippers", slug: "mens-slippers" },
      { name: "Women's Slippers", slug: "womens-slippers" },
      { name: "Sliders", slug: "sliders" }
    ]
  },
  {
    name: "Clothing",
    slug: "clothing",
    image: cap,
    subcategories: [
      { name: "Men's T-Shirts", slug: "mens-t-shirts" }
    ]
  },
  {
    name: "Electronics & Cameras",
    slug: "electronics-cameras",
    image: buds,
    subcategories: [
      { name: "Drone Cameras", slug: "drone-cameras" }
    ]
  }
];

export default categories;
