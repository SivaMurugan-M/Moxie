/**
 * Order Service API Client
 * Manages customer order history, order details, tracking timelines, and cancellations.
 * Prepared for future integration with Python + Django REST API /api/orders/.
 */

import watch1 from "../assets/images/watch1.png";
import shoe from "../assets/images/shoe.svg";
import buds from "../assets/images/Buds.png";

// Helper to calculate date offsets relative to today
const getDateOffset = (offsetDays) => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

const getInitialMockOrders = () => [
  {
    id: "ORD10245",
    date: getDateOffset(-2),
    name: "Classic Black Watch",
    image: watch1,
    variant: "Color: Midnight Gold",
    quantity: 1,
    price: 4999,
    subtotal: 4999,
    discount: 500,
    shippingCharge: 100,
    tax: 450,
    total: 5049, // subtotal - discount + shippingCharge + tax
    paymentStatus: "Paid",
    paymentMethod: "UPI (Paytm)",
    transactionRef: "TXN882740194",
    status: "Shipped",
    expectedDelivery: getDateOffset(3),
    deliveryPartner: "BlueDart Express",
    trackingNumber: "BD98274619",
    shippingAddress: {
      name: "Amit Kumar",
      phone: "+91 98765 43210",
      flat: "Flat 402, Building C",
      area: "Sector 17-B",
      city: "Chandigarh",
      state: "Chandigarh",
      pincode: "160017",
    },
    timeline: {
      placed: `${getDateOffset(-2)}, 10:09 AM`,
      confirmed: `${getDateOffset(-2)}, 02:30 PM`,
      packed: `${getDateOffset(-1)}, 11:00 AM`,
      shipped: `${getDateOffset(-1)}, 05:45 PM`,
      outForDelivery: null,
      delivered: null,
    },
  },
  {
    id: "ORD10212",
    date: getDateOffset(-7),
    name: "Air Comfort Running Shoes",
    image: shoe,
    variant: "Size: 9 · Color: Neon Yellow",
    quantity: 1,
    price: 3499,
    subtotal: 3499,
    discount: 300,
    shippingCharge: 100,
    tax: 320,
    total: 3619,
    paymentStatus: "Paid",
    paymentMethod: "Credit Card",
    transactionRef: "TXN748920194",
    status: "Delivered",
    expectedDelivery: getDateOffset(-3),
    deliveryPartner: "Moxie Logistics",
    trackingNumber: "MX88274601",
    shippingAddress: {
      name: "Amit Kumar",
      phone: "+91 98765 43210",
      flat: "Flat 402, Building C",
      area: "Sector 17-B",
      city: "Chandigarh",
      state: "Chandigarh",
      pincode: "160017",
    },
    timeline: {
      placed: `${getDateOffset(-7)}, 03:12 PM`,
      confirmed: `${getDateOffset(-7)}, 05:00 PM`,
      packed: `${getDateOffset(-6)}, 10:00 AM`,
      shipped: `${getDateOffset(-5)}, 12:30 PM`,
      outForDelivery: `${getDateOffset(-3)}, 09:15 AM`,
      delivered: `${getDateOffset(-3)}, 02:40 PM`,
    },
  },
  {
    id: "ORD10190",
    date: getDateOffset(-15),
    name: "BassBlast Air Buds Pro",
    image: buds,
    variant: "Color: Pearl White",
    quantity: 2,
    price: 2499,
    subtotal: 4998,
    discount: 1000,
    shippingCharge: 200,
    tax: 720,
    total: 4918,
    paymentStatus: "Paid",
    paymentMethod: "Debit Card",
    transactionRef: "TXN228491048",
    status: "Delivered",
    expectedDelivery: getDateOffset(-11),
    deliveryPartner: "BlueDart Express",
    trackingNumber: "BD22940581",
    shippingAddress: {
      name: "Amit Kumar",
      phone: "+91 98765 43210",
      flat: "Flat 402, Building C",
      area: "Sector 17-B",
      city: "Chandigarh",
      state: "Chandigarh",
      pincode: "160017",
    },
    timeline: {
      placed: `${getDateOffset(-15)}, 09:30 AM`,
      confirmed: `${getDateOffset(-15)}, 11:45 AM`,
      packed: `${getDateOffset(-14)}, 02:00 PM`,
      shipped: `${getDateOffset(-13)}, 08:00 AM`,
      outForDelivery: `${getDateOffset(-11)}, 11:00 AM`,
      delivered: `${getDateOffset(-11)}, 04:15 PM`,
    },
  }
];

export const orderService = {
  fetchOrders: async (email) => {
    await new Promise((resolve) => setTimeout(resolve, 400));
    if (!email) return [];

    try {
      const stored = localStorage.getItem(`moxie_orders_${email}`);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.error("Error reading orders:", e);
    }

    const initial = getInitialMockOrders();
    localStorage.setItem(`moxie_orders_${email}`, JSON.stringify(initial));
    return initial;
  },

  cancelOrder: async (email, orderId) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!email || !orderId) return false;

    const orders = await orderService.fetchOrders(email);
    const updated = orders.map((o) => {
      if (o.id === orderId) {
        return {
          ...o,
          status: "Cancelled",
          timeline: {
            ...o.timeline,
            cancelled: new Date().toLocaleString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
              hour: "numeric",
              minute: "numeric",
              hour12: true,
            }),
          },
        };
      }
      return o;
    });

    localStorage.setItem(`moxie_orders_${email}`, JSON.stringify(updated));
    return true;
  },

  placeOrder: async (email, orderData) => {
    await new Promise((resolve) => setTimeout(resolve, 500));
    if (!email) return null;

    const orders = await orderService.fetchOrders(email);
    const newOrder = {
      id: `ORD${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
      name: orderData.name || "Moxie Product Purchase",
      image: orderData.image || buds,
      variant: orderData.variant || "",
      quantity: orderData.quantity || 1,
      price: orderData.price || 0,
      subtotal: orderData.subtotal || 0,
      discount: orderData.discount || 0,
      shippingCharge: orderData.shippingCharge || 100,
      tax: orderData.tax || 0,
      total: orderData.total || 0,
      paymentStatus: orderData.paymentStatus || "Paid",
      paymentMethod: orderData.paymentMethod || "UPI",
      transactionRef: `TXN${Math.floor(100000000 + Math.random() * 900000000)}`,
      status: "Placed",
      expectedDelivery: getDateOffset(5),
      deliveryPartner: "Moxie Logistics",
      trackingNumber: `MX${Math.floor(10000000 + Math.random() * 90000000)}`,
      shippingAddress: orderData.shippingAddress || {},
      timeline: {
        placed: `${new Date().toLocaleDateString("en-IN")}, ${new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "numeric" })}`,
        confirmed: null,
        packed: null,
        shipped: null,
        outForDelivery: null,
        delivered: null,
      },
    };

    orders.unshift(newOrder);
    localStorage.setItem(`moxie_orders_${email}`, JSON.stringify(orders));
    return newOrder;
  }
};
