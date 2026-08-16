# Moxie — Premium E-Commerce Storefront

Welcome to the **Moxie** frontend repository! This is a state-of-the-art, premium e-commerce storefront designed in React. It features custom preloader animations, dynamic product shelves, persistent shopping bags/wishlists, interactive color/size selectors, and a fully functional checkout flow.

---

## 🚀 Tech Stack & Setup

The project is built on top of modern frontend standards:
1. **Core Library**: [React (v18+)](https://reactjs.org/) for building interactive component UI.
2. **Routing**: [React Router DOM (v6)](https://reactrouter.com/) managing navigation states.
3. **State Management**: React Context Provider APIs (`CartContext`, `WishlistContext`, `ToastContext`, `AuthContext`) for lightweight global states.
4. **Styling**: Premium, responsive Vanilla CSS layout grids, flex containers, and smooth animation keyframes.

### Developer Commands
Run these commands in the `front-end` directory:

* **Install Dependencies**:
  ```bash
  npm install
  ```
* **Start Local Development Server**:
  ```bash
  npm start
  ```
* **Build Production Bundle**:
  ```bash
  npm run build
  ```

---

## 💎 Core Features

### 1. Minimalist Watch Preloader (`BrandIntro`)
* **Analog Clock Animation**: Features a luxury dial preloader overlay containing custom markers and dynamic watch hands rotating in real time based on system clock times.
* **Letter-Fade Transition**: Animates logo letters sequentially using staggered animation delays.
* **DOM Resource Optimization**: Cleans up window timeouts and request animation frame loops. The preloader DOM node is unmounted immediately upon fade-out.
* **Style Scoping**: Preloader background rules (`background: #030303`) are scoped under `body.is-loading` to automatically restore the store's default light theme when loading finishes.

### 2. Category Cards Scoped Navigation
* Located under the **Our Category** section.
* Prevents the entire card background or product image from triggering link navigation.
* The link is scoped exclusively to the **Explore Now** button element, ensuring standard mouse interactions.

### 3. Dynamic Homepage Shelves
* Displays exactly two rows: **New Arrivals** and a centered, styled **Our Collection** shelf.
* Alternative Category Mixing: Sorts categories alternately (Watches, Shoes, Buds, etc.) on load to ensure maximum visual diversity on the landing page.
* Stock Filtering: Automatically filters out all out-of-stock items (`stock: false`) on the home screen.
* Scroll Container Layouts: Implements a touch-friendly scrolling row container supporting responsive card sizing (`220px` desktop, `180px` tablet, `150px` mobile).

### 4. Interactive Product Detail Views
* **Dynamic Multi-Image Gallery**: Displays a slideshow from the product's `images` array if provided in the database; otherwise, falls back to repeating the main product image for visual layout consistency.
* **Color Picker (All Products)**: Renders a color selector on detail pages. Uses CSS filter rotation (`hue-rotate`, `grayscale`, `brightness`) to instantly change the active product color on-screen without requiring separate image uploads.
* **Size Picker (Footwear)**: Shows selectable size pills (UK 7 to 12) for footwear items (Shoes and Sliders).

### 5. Cart Count & "Buy Now" Bypassing
* **Direct Checkout**: Clicking **Buy Now** on a product details page bypasses the header shopping bag. It packages the selected size/color options and navigates directly to the checkout page using React Router navigation state.
* **Cart Count Lock**: The shopping bag badge count and stored items are preserved during direct checkout, and items in the bag are only cleared if the checkout originated from the Cart page.

### 6. Accurate Cost Calculations
* **Subtotal Formatting**: Cart summaries display the correct mathematical MRP subtotal, so discount deductions are clear.
* **Per-Product Shipping**: Charges exactly **Rs. 100** shipping fee for each item quantity in the cart.
* **Unicode Restoration**: Restores corrupted Unicode currencies (like `₹` and `−`) to their standard characters.

---

## 📁 Repository Structure

```text
front-end/
├── public/                 # Static public assets (HTML templates, icons)
└── src/
    ├── assets/             # Images, vector illustrations, and slide icons
    ├── components/
    │   ├── Banner/         # Hero slider headers
    │   ├── BrandIntro/     # Analog watch loaders
    │   ├── Footer/         # Page footer details
    │   ├── Header/         # Nav menu search bars and badge count indicators
    │   └── Product/        # Product shelves and minimized product cards
    ├── context/            # Globals (Cart, Wishlist, Toast, Auth)
    ├── data/               # Local datasets (enriched products, categories)
    ├── pages/
    │   ├── Home/           # Main homepage layout
    │   ├── Products/       # Catalog list filters
    │   ├── ProductDetails/ # Image galleries, size/color pickers
    │   ├── Cart/           # Order breakdown calculations
    │   └── Checkout/       # Direct checkout payment forms
    ├── index.css           # Global layout variables and main styles overrides
    ├── index.js            # Entry mount point
    └── App.jsx             # Main routing shell
```
